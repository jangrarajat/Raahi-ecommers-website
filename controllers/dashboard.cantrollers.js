import Product from "../models/product.model.js";
import Order from "../models/order.model.js"; // Aapka Model
import User from "../models/user.model.js";   // Aapka Model
import { uploadOnCloudinary, deleteFromCloudinary } from "..//middleware/multer.middleware.js";

// ==========================================
// 1. PRODUCT MANAGEMENT (Ye same rahega)
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

const updateVariantStock = async (req, res) => {
    try {
        const { productId, color, size, newStock } = req.body;
        if (!productId || !color || !size || newStock === undefined) {
            return res.status(400).json({ success: false, message: "Missing details" });
        }
        const product = await Product.findOneAndUpdate(
            { _id: productId, "variants.size": size, "variants.color": color },
            { $set: { "variants.$.stock": Number(newStock) } },
            { new: true }
        );
        if (!product) return res.status(404).json({ success: false, message: "Product or Variant not found" });
        res.status(200).json({ success: true, message: "Stock updated", product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findById(id);
        if (!product) return res.status(404).json({ success: false, message: "Product not found" });

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

const getAppProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const { category } = req.query;
        let filter = {};
        if (category && category !== "all") filter.category = category;

        const totalProducts = await Product.countDocuments(filter);
        const products = await Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

const searchProduct = async (req, res) => {
    try {
        let { query } = req.query;
        if (!query) return res.status(400).json({ success: false, message: "Query required" });
        const synonyms = { "man": "Men", "ladies": "Women", "girl": "Women", "boy": "Men" };
        if (synonyms[query.toLowerCase()]) query = synonyms[query.toLowerCase()];
        const searchRegex = new RegExp(query, 'i');
        const products = await Product.find({
            $or: [
                { name: searchRegex }, { description: searchRegex },
                { category: searchRegex }, { subCategory: searchRegex },
                { "variants.color": searchRegex }
            ],
            isActive: true
        }).limit(20);
        res.status(200).json({ success: true, count: products.length, products });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 2. ORDER & ANALYTICS (Corrected for YOUR Models)
// ==========================================

// --- GET ALL ORDERS (Admin) ---
const getAllOrdersAdmin = async (req, res) => {
    try {
        // CORRECTION: 'userId' populate kar rahe hain, aur 'username' select kar rahe hain
        const orders = await Order.find({})
            .populate("userId", "username email")  // <--- CORRECTED
            .populate("addressId")                 // Address bhi dikhega
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// --- UPDATE ORDER STATUS (Smart Payment Update) ---
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        // Validation logic...
        
        // Find Order First
        let order = await Order.findById(orderId);
        if(!order) return res.status(404).json({ success: false, message: "Order not found" });

        // Logic: Status ke hisab se Payment Status update karo
        order.orderStatus = status;

        if (status === "delivered") {
            order.paymentStatus = "paid"; // Delivered hua matlab paisa aa gaya
        } 
        else if (status === "cancelled") {
            order.paymentStatus = "cancelled"; // Cancel hua toh payment bhi cancel
        }

        await order.save(); // Save changes

        res.status(200).json({ success: true, message: "Order & Payment Status Updated", order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- DASHBOARD STATS ---
const getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalOrders = await Order.countDocuments();
        
        // CORRECTION: 'user' role check kar rahe hain
        const totalUsers = await User.countDocuments({ role: "user" });
        
        // Revenue Calculation (Only for 'delivered' orders)
        // CORRECTION: Aapke model mein 'orderStatus' hai
        const revenueData = await Order.aggregate([
            { $match: { orderStatus: "delivered" } }, // <--- CORRECTED
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

        const lowStockProducts = await Product.find({ "variants.stock": { $lt: 5 } }).select("name variants");

        res.status(200).json({
            success: true,
            stats: { totalProducts, totalOrders, totalUsers, totalRevenue },
            lowStockProducts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching stats" });
    }
};

// --- Placeholders ---
const addServicesArea = async (req, res) => res.json({ msg: "Service Area Added" });
const updateDeliveryAvlabelStatus = async (req, res) => res.json({ msg: "Status Updated" });

export { 
    addNewProduct, updateProduct, updateVariantStock, deleteProduct, 
    getAppProduct, searchProduct, getAllOrdersAdmin, updateOrderStatus, 
    getDashboardStats, addServicesArea, updateDeliveryAvlabelStatus 
};