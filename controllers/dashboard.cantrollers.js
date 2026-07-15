import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import ServiceArea from "../models/serviceArea.model.js";
import {
  deleteFromCloudinary,
} from "../middleware/multer.middleware.js";

// ==========================================
// 1. PRODUCT MANAGEMENT
// ==========================================

const addNewProduct = async (req, res) => {
  console.log("Add Product Request Body:", req.body);
  
  try {
    let parsedVariants = [];
    if (req.body.variants) {
      try {
        parsedVariants = JSON.parse(req.body.variants);
      } catch (e) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid variants format" });
      }
    }

    const { name, description, price, mrp, category, subCategory, fabric } =
      req.body;

    if (!name || !price || !category) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill required fields" });
    }

    if (parsedVariants && parsedVariants.length > 0) {
      for (let i = 0; i < parsedVariants.length; i++) {
        const variant = parsedVariants[i];
        if (!variant.images || variant.images.length === 0) {
          return res.status(400).json({
            success: false,
            message: `Variant ${i + 1} (${variant.color || 'Color'}) must have at least one image`
          });
        }
      }
    }

    const newProduct = await Product.create({
      name,
      description,
      price: Number(price),
      mrp: Number(mrp || 0),
      category,
      subCategory,
      fabric,
      variants: parsedVariants,
    });

    console.log("✅ New Product Created:", newProduct._id);

    res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });

  } catch (error) {
    console.error("❌ Add Product Error:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to add product. Please try again." 
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    let updates = req.body;
    
    // If variants is a string, parse it
    if (updates.variants && typeof updates.variants === 'string') {
      try {
        updates.variants = JSON.parse(updates.variants);
      } catch (e) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid variants format" 
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });
    if (!updatedProduct)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res
      .status(200)
      .json({
        success: true,
        message: "Product updated",
        product: updatedProduct,
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATED: Stock Update for new variant structure ---
const updateVariantStock = async (req, res) => {
  try {
    const { productId, color, size, newStock } = req.body;

    if (!productId || newStock === undefined || !color || !size) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Missing details: Product ID, Color, Size and Stock are required.",
        });
    }

    // NEW STRUCTURE: Find product with variant color and size
    let product = await Product.findOne({
      _id: productId,
      "variants.color": color,
      "variants.sizes.size": size
    });

    if (product) {
      // Update existing size stock
      product = await Product.findOneAndUpdate(
        {
          _id: productId,
          "variants.color": color,
          "variants.sizes.size": size
        },
        {
          $set: { "variants.$[variant].sizes.$[sizeElem].stock": Number(newStock) }
        },
        {
          arrayFilters: [
            { "variant.color": color },
            { "sizeElem.size": size }
          ],
          new: true
        }
      );
    } else {
      // Check if variant exists
      const productExists = await Product.findOne({
        _id: productId,
        "variants.color": color
      });

      if (productExists) {
        // Add new size to existing variant
        product = await Product.findOneAndUpdate(
          {
            _id: productId,
            "variants.color": color
          },
          {
            $push: { "variants.$.sizes": { size: size, stock: Number(newStock) } }
          },
          { new: true }
        );
      } else {
        // Create new variant with size
        product = await Product.findByIdAndUpdate(
          productId,
          {
            $push: {
              variants: {
                color: color,
                sizes: [{ size: size, stock: Number(newStock) }],
                images: []
              }
            }
          },
          { new: true }
        );
      }
    }

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Stock updated successfully", product });
  } catch (error) {
    console.error("❌ Stock Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        if (variant.images && variant.images.length > 0) {
          const deletePromises = variant.images.map((img) =>
            deleteFromCloudinary(img.public_id)
          );
          await Promise.all(deletePromises);
          console.log(`🗑️ Deleted ${variant.images.length} images for variant ${variant.color}`);
        }
      }
    }

    await Product.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "Product Deleted Successfully" });
  } catch (error) {
    console.error("❌ Delete Product Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAppProduct = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const { category, search } = req.query;

    let filter = {};
    if (category && category !== "all") filter.category = category;

    if (search) {
      const searchRegex = new RegExp(search, "i");
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { "variants.color": searchRegex },
      ];
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      products,
      totalPages: Math.ceil(totalProducts / limit),
      currentPage: page,
      totalProducts,
    });
  } catch (error) {
    console.error("❌ Get Products Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const searchProduct = async (req, res) => {
  try {
    let { query } = req.query;
    if (!query)
      return res
        .status(400)
        .json({ success: false, message: "Query required" });

    const searchRegex = new RegExp(query, "i");
    const products = await Product.find({
      $or: [{ name: searchRegex }, { category: searchRegex }],
    }).limit(20);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    console.error("❌ Search Error:", error);
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
      .populate("items.productId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      orders,
      totalPages: Math.ceil(totalOrders / limit),
      currentPage: page,
      totalOrders,
    });
  } catch (error) {
    console.log("❌ Get Orders Error:", error);
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    let order = await Order.findById(orderId);
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    order.orderStatus = status;

    if (status === "delivered") {
      order.paymentStatus = "paid";
    } else if (status === "cancelled") {
      order.paymentStatus = "cancelled";
    }

    await order.save();

    res
      .status(200)
      .json({ success: true, message: `Order marked as ${status}`, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// --- UPDATED: Dashboard Stats with new variant structure ---
const getDashboardStats = async (req, res) => {
  try {
    const { range } = req.query;
    let dateFilter = {};
    const now = new Date();

    if (range === "day") {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (range === "week") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - 7);
      dateFilter = { createdAt: { $gte: startOfWeek } };
    } else if (range === "month") {
      const startOfMonth = new Date(now);
      startOfMonth.setMonth(now.getMonth() - 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    } else if (range === "year") {
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
      totalProducts,
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, orderStatus: "delivered" }),
      Order.countDocuments({ ...dateFilter, orderStatus: "pending" }),
      Order.countDocuments({ ...dateFilter, orderStatus: "cancelled" }),
      User.countDocuments({ ...dateFilter, role: "user" }),
      Order.aggregate([
        { $match: { ...dateFilter, orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
      Order.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      }),
      Product.countDocuments(),
    ]);

    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;
    
    // UPDATED: Find low stock products with new structure
    const lowStockProducts = await Product.find({
      "variants.sizes.stock": { $lt: 5 }
    }).select("name variants");

    res.status(200).json({
      success: true,
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalUsers,
        breakdown: {
          delivered: totalDelivered,
          pending: totalPending,
          cancelled: totalCancelled,
          today: todayOrdersCount,
        },
      },
      lowStockProducts,
    });
  } catch (error) {
    console.log("❌ Stats Error:", error);
    res.status(500).json({ success: false, message: "Error fetching stats" });
  }
};

// ==========================================
// 3. SERVICE AREA (PINCODE) MANAGEMENT
// ==========================================

const addServicesArea = async (req, res) => {
  try {
    const { pincode, city, state, DeliveryAvlabelStatus } = req.body;
    if (!pincode)
      return res
        .status(400)
        .json({ success: false, message: "Pincode is required" });

    const exists = await ServiceArea.findOne({ pincode });
    if (exists)
      return res
        .status(400)
        .json({ success: false, message: "Pincode already exists" });

    await ServiceArea.create({
      pincode,
      city,
      state,
      DeliveryAvlabelStatus: DeliveryAvlabelStatus || true,
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
      { new: true },
    );

    if (!area)
      return res
        .status(404)
        .json({ success: false, message: "Pincode not found" });

    res.status(200).json({ success: true, message: "Status Updated", area });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllServiceAreas = async (req, res) => {
  try {
    const areas = await ServiceArea.find({}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, areas });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ADD NEW VARIANT TO EXISTING PRODUCT
// ==========================================
const addNewVariant = async (req, res) => {
  try {
    const { productId, color, sizes, images } = req.body;

    if (!productId || !color || !sizes || sizes.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ProductId, color, and at least one size are required"
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // Check if variant already exists
    const existingVariant = product.variants.find(v => v.color === color);
    if (existingVariant) {
      return res.status(400).json({
        success: false,
        message: `Variant with color ${color} already exists`
      });
    }

    // Add new variant
    product.variants.push({
      color,
      sizes: sizes.map(s => ({ size: s.size, stock: s.stock || 0 })),
      images: images || []
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "New variant added successfully",
      product
    });
  } catch (error) {
    console.error("❌ Add Variant Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// UPDATE SINGLE VARIANT
// ==========================================
const updateVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantIndex, color, sizes, images } = req.body;

    if (!productId || variantIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "ProductId and variantIndex are required"
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (variantIndex >= product.variants.length) {
      return res.status(400).json({ success: false, message: "Invalid variant index" });
    }

    // Update variant
    product.variants[variantIndex] = {
      ...product.variants[variantIndex],
      color: color || product.variants[variantIndex].color,
      sizes: sizes || product.variants[variantIndex].sizes,
      images: images || product.variants[variantIndex].images
    };

    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      product
    });
  } catch (error) {
    console.error("❌ Update Variant Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// ✅ DELETE SINGLE VARIANT
// ==========================================
const deleteVariant = async (req, res) => {
  try {
    const { productId, variantIndex } = req.params;

    if (!productId || variantIndex === undefined) {
      return res.status(400).json({
        success: false,
        message: "ProductId and variantIndex are required"
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (variantIndex >= product.variants.length) {
      return res.status(400).json({ success: false, message: "Invalid variant index" });
    }

    // Get variant to delete images from Cloudinary
    const variantToDelete = product.variants[variantIndex];
    if (variantToDelete.images && variantToDelete.images.length > 0) {
      const deletePromises = variantToDelete.images.map((img) =>
        deleteFromCloudinary(img.public_id)
      );
      await Promise.all(deletePromises);
      console.log(`🗑️ Deleted ${variantToDelete.images.length} images for variant ${variantToDelete.color}`);
    }

    // Remove variant from array
    product.variants.splice(variantIndex, 1);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully",
      product
    });
  } catch (error) {
    console.error("❌ Delete Variant Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  addNewProduct,
  updateProduct,
  updateVariantStock,
  deleteProduct,
  getAppProduct,
  searchProduct,
  getAllOrdersAdmin,
  updateOrderStatus,
  getDashboardStats,
  addServicesArea,
  updateDeliveryAvlabelStatus,
  getAllServiceAreas,
  addNewVariant,
  updateVariant,
  deleteVariant,  // ✅ Added
};