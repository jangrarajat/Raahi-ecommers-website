import Product from "../models/product.model.js";
import Order from "../models/order.model.js"; 
import User from "../models/user.model.js";
import ServiceArea from "../models/serviceArea.model.js"; // Ensure model exists
import { uploadOnCloudinary, deleteFromCloudinary } from "../middleware/multer.middleware.js";

// ==========================================
// 1. PRODUCT MANAGEMENT
// ==========================================

const addNewProduct = async (req, res) => {
    try {
        let parsedVariants = [];
        if (req.body.variants) {
            try {
                parsedVariants = JSON.parse(req.body.variants);
            } catch (e) {
                return res.status(400).json({ success: false, message: "Invalid variants format" });
            }
        }

        const { name, description, price, mrp, category, subCategory, fabric } = req.body;

        let imageArray = [];
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                const result = await uploadOnCloudinary(file.path);
                if (result) return { public_id: result.public_id, url: result.secure_url };
            });
            const uploadedImages = await Promise.all(uploadPromises);
            imageArray = uploadedImages.filter(img => img !== undefined);
        }

        if (!name || !price || !category) {
            return res.status(400).json({ success: false, message: "Please fill required fields" });
        }

        const newProduct = await Product.create({
            name, description, price, mrp, category, subCategory, fabric,
            images: imageArray,
            variants: parsedVariants
        });

        res.status(201).json({ success: true, message: "Product added successfully", product: newProduct });

    } catch (error) {
        console.error("Add Product Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body; 
        const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedProduct) return res.status(404).json({ success: false, message: "Product not found" });
        res.status(200).json({ success: true, message: "Product updated", product: updatedProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update Stock Logic
const updateVariantStock = async (req, res) => {
    try {
        const { productId, color, size, newStock } = req.body;
        
        if (!productId || newStock === undefined) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }

        // Agar variant specific hai
        if(color && size) {
            const product = await Product.findOneAndUpdate(
                { _id: productId, "variants.size": size, "variants.color": color },
                { $set: { "variants.$.stock": Number(newStock) } },
                { new: true }
            );
            if (!product) return res.status(404).json({ success: false, message: "Product or Variant not found" });
            return res.status(200).json({ success: true, message: "Stock updated", product });
        } else {
             return res.status(400).json({ success: false, message: "Color and Size required for variant update" });
        }

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
             const deletePromises = product.images.map(img => deleteFromCloudinary(img.public_id));
             await Promise.all(deletePromises);
        }
        await Product.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Product Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Pagination (50 items per page) & Search
const getAppProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; 
        const skip = (page - 1) * limit;
        const { category, search } = req.query;
        
        let filter = {};
        if (category && category !== "all") filter.category = category;
        
        // Search Logic
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { name: searchRegex },
                { description: searchRegex },
                { category: searchRegex },
                { "variants.color": searchRegex }
            ];
        }

        const totalProducts = await Product.countDocuments(filter);
        const products = await Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            totalProducts
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const searchProduct = async (req, res) => {
    // Ye separate search route hai agar quick search chahiye ho
    try {
        let { query } = req.query;
        if (!query) return res.status(400).json({ success: false, message: "Query required" });
        
        const searchRegex = new RegExp(query, 'i');
        const products = await Product.find({
            $or: [
                { name: searchRegex }, 
                { category: searchRegex }
            ]
        }).limit(20);
        res.status(200).json({ success: true, count: products.length, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 2. ORDER & ANALYTICS
// ==========================================

const getAllOrdersAdmin = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; 
        const skip = (page - 1) * limit;

        const totalOrders = await Order.countDocuments({});
        
        const orders = await Order.find({})
            .populate("userId", "username email") 
            .populate("addressId")              
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
            
        res.status(200).json({ 
            success: true, 
            orders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
            totalOrders
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        let order = await Order.findById(orderId);
        if(!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.orderStatus = status;

        if (status === "delivered") {
            order.paymentStatus = "paid"; 
        } 
        else if (status === "cancelled") {
            order.paymentStatus = "cancelled"; 
        }
        else if (status === "confirmed") {
            // Optional: Logic for confirmed
        }

        await order.save(); 

        res.status(200).json({ success: true, message: `Order marked as ${status}`, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getDashboardStats = async (req, res) => {
    try {
        const { range } = req.query; 
        let dateFilter = {};
        const now = new Date();
        
        if (range === 'day') {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            dateFilter = { createdAt: { $gte: startOfDay } };
        } else if (range === 'week') {
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            dateFilter = { createdAt: { $gte: startOfWeek } };
        } else if (range === 'month') {
            const startOfMonth = new Date(now);
            startOfMonth.setMonth(now.getMonth() - 1);
            dateFilter = { createdAt: { $gte: startOfMonth } };
        } else if (range === 'year') {
            const startOfYear = new Date(now);
            startOfYear.setFullYear(now.getFullYear() - 1);
            dateFilter = { createdAt: { $gte: startOfYear } };
        }
        
        const [
            totalOrders,
            totalDelivered,
            totalPending,
            totalCancelled,
            totalUsers,
            revenueData,
            todayOrdersCount,
            totalProducts
        ] = await Promise.all([
            Order.countDocuments(dateFilter), 
            Order.countDocuments({ ...dateFilter, orderStatus: 'delivered' }),
            Order.countDocuments({ ...dateFilter, orderStatus: 'pending' }),
            Order.countDocuments({ ...dateFilter, orderStatus: 'cancelled' }),
            User.countDocuments({ ...dateFilter, role: 'user' }), 
            
            Order.aggregate([
                { $match: { ...dateFilter, orderStatus: 'delivered' } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),

            Order.countDocuments({ 
                createdAt: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
            }),

            Product.countDocuments() 
        ]);

        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
        const lowStockProducts = await Product.find({ "variants.stock": { $lt: 5 } }).select("name variants");

        res.status(200).json({
            success: true,
            stats: {
                totalRevenue, totalOrders, totalProducts, totalUsers,
                breakdown: {
                    delivered: totalDelivered,
                    pending: totalPending,
                    cancelled: totalCancelled,
                    today: todayOrdersCount
                }
            },
            lowStockProducts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};

// ==========================================
// 3. SERVICE AREA (PINCODE) MANAGEMENT
// ==========================================

const addServicesArea = async (req, res) => {
    try {
        const { pincode, city, state, DeliveryAvlabelStatus } = req.body;
        if (!pincode) return res.status(400).json({ success: false, message: "Pincode is required" });

        const exists = await ServiceArea.findOne({ pincode });
        if (exists) return res.status(400).json({ success: false, message: "Pincode already exists" });

        await ServiceArea.create({
            pincode, city, state, DeliveryAvlabelStatus: DeliveryAvlabelStatus || true
        });

        res.status(201).json({ success: true, message: "Service Area Added" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateDeliveryAvlabelStatus = async (req, res) => {
    try {
        const { DeliveryAvlabelStatus, pincode } = req.body;
        
        const area = await ServiceArea.findOneAndUpdate(
            { pincode }, 
            { DeliveryAvlabelStatus },
            { new: true }
        );

        if (!area) return res.status(404).json({ success: false, message: "Pincode not found" });

        res.status(200).json({ success: true, message: "Status Updated", area });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getAllServiceAreas = async (req, res) => {
    try {
        const areas = await ServiceArea.find({}).sort({createdAt: -1});
        res.status(200).json({ success: true, areas });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export { 
    addNewProduct, updateProduct, updateVariantStock, deleteProduct, 
    getAppProduct, searchProduct, getAllOrdersAdmin, updateOrderStatus, 
    getDashboardStats, addServicesArea, updateDeliveryAvlabelStatus, getAllServiceAreas
};