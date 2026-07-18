import Order from "../models/order.model.js";
import Cart from "../models/cartList.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";

// =============================================
// 1. PLACE ORDER (Handles Stock Deduction - Updated for new variant structure with Coupon)
// =============================================
const placeOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId, paymentMethod, productId, singleQuantity, size, color, couponCode } =
      req.body;

    if (!addressId || !paymentMethod) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Address and Payment Method required",
        });
    }

    let orderItems = [];
    let totalAmountCalc = 0;
    let isBuyNow = false;
    let appliedCoupon = null;
    let discountAmount = 0;

    // --- HELPER TO CHECK & DEDUCT STOCK ---
    const checkAndDeductStock = async (prodId, qty, pSize, pColor) => {
      const product = await Product.findById(prodId);
      if (!product) throw new Error(`Product not found`);

      if (!product.variants || product.variants.length === 0) {
        if (product.stock !== undefined) {
          if (product.stock < qty) {
            throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
          }
          product.stock -= qty;
          await product.save();
          return product;
        }
        throw new Error(`${product.name} has no stock information.`);
      }

      const variantIndex = product.variants.findIndex(
        (v) => v.color === pColor
      );

      if (variantIndex === -1) {
        throw new Error(`${product.name} (Color: ${pColor}) is unavailable.`);
      }

      const variant = product.variants[variantIndex];
      const sizeIndex = variant.sizes.findIndex(
        (s) => s.size === pSize
      );

      if (sizeIndex === -1) {
        throw new Error(`${product.name} (${pColor}/${pSize}) is unavailable.`);
      }

      if (variant.sizes[sizeIndex].stock < qty) {
        throw new Error(
          `Insufficient stock for ${product.name} (${pColor}/${pSize}). Available: ${variant.sizes[sizeIndex].stock}`
        );
      }

      product.variants[variantIndex].sizes[sizeIndex].stock -= qty;
      await product.save();
      return product;
    };

    // --- SCENARIO A: BUY NOW ---
    if (productId) {
      isBuyNow = true;
      const quantity = singleQuantity || 1;
      const reqSize = size || "N/A";
      const reqColor = color || "N/A";

      const product = await checkAndDeductStock(
        productId,
        quantity,
        reqSize,
        reqColor,
      );

      orderItems.push({
        productId: product._id,
        quantity: quantity,
        price: product.price,
        size: reqSize,
        color: reqColor,
      });

      totalAmountCalc = product.price * quantity;
    }

    // --- SCENARIO B: CART CHECKOUT ---
    else {
      const cartItems = await Cart.find({ userId }).populate("productId");
      if (!cartItems || cartItems.length === 0) {
        return res
          .status(400)
          .json({ success: false, message: "Cart is empty" });
      }

      for (const item of cartItems) {
        if (!item.productId) continue;

        const reqSize = item.size || "N/A";
        const reqColor = item.color || "N/A";

        try {
          await checkAndDeductStock(
            item.productId._id,
            item.quantity,
            reqSize,
            reqColor,
          );
        } catch (err) {
          return res.status(400).json({ success: false, message: err.message });
        }

        totalAmountCalc += item.productId.price * item.quantity;

        orderItems.push({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.price,
          size: reqSize,
          color: reqColor,
        });
      }
    }

    // --- COUPON LOGIC ---
    let finalAmount = totalAmountCalc;
    let appliedCouponCode = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
        isActive: true,
        expiryDate: { $gte: new Date() },
      });

      if (coupon) {
        // Check usage limits
        if (coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit) {
          const userUsage = coupon.usedBy.filter(
            (entry) => entry.userId.toString() === userId.toString()
          );
          
          if (userUsage.length < coupon.perUserLimit) {
            // Calculate discount
            if (coupon.discountType === "percentage") {
              discountAmount = (totalAmountCalc * coupon.discountValue) / 100;
            } else {
              discountAmount = coupon.discountValue;
            }

            // Apply max discount cap
            if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
              discountAmount = coupon.maxDiscountAmount;
            }

            finalAmount = Math.max(0, totalAmountCalc - discountAmount);
            appliedCouponCode = coupon.code;
            appliedCoupon = coupon;
          }
        }
      }
    }

    // --- CREATE ORDER ---
    const newOrder = await Order.create({
      userId,
      items: orderItems,
      addressId,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
      totalAmount: finalAmount,
      orderStatus: "pending",
      couponCode: appliedCouponCode,
      discountAmount: discountAmount,
      originalTotal: totalAmountCalc,
    });

    // --- UPDATE COUPON USAGE ---
    if (appliedCoupon) {
      appliedCoupon.usedCount += 1;
      appliedCoupon.usedBy.push({
        userId,
        orderId: newOrder._id,
        usedAt: new Date(),
      });
      await appliedCoupon.save();
    }

    // --- CLEAR CART AFTER SUCCESSFUL ORDER ---
    if (!isBuyNow) {
      await Cart.deleteMany({ userId });
      console.log(`Cart cleared for user: ${userId}`);
    }

    res.status(201).json({
      success: true,
      message: "Order Placed Successfully",
      orderId: newOrder._id,
      discountApplied: discountAmount > 0,
      discountAmount: discountAmount,
      finalAmount: finalAmount,
    });
  } catch (error) {
    console.log("Error in placeOrder:", error.message);
    res
      .status(500)
      .json({ success: false, message: error.message || "Order Failed" });
  }
};

// =============================================
// 2. GET MY ORDERS
// =============================================
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.productId")
      .populate("addressId")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// =============================================
// 3. GET ALL ORDERS (Admin)
// =============================================
const getAllOrdersAdmin = async (req, res) => {
  try {
    if (req.user.role !== "owner")
      return res.status(403).json({ message: "Access Denied" });

    const orders = await Order.find()
      .populate("items.productId")
      .populate("userId", "username email")
      .populate("addressId")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching orders" });
  }
};

// =============================================
// 4. UPDATE ORDER STATUS (Admin)
// =============================================
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if (req.user.role !== "owner")
      return res.status(403).json({ message: "Access Denied" });

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus: status },
      { new: true },
    );
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Status Updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating status" });
  }
};

// =============================================
// 5. CANCEL ORDER (User - Restock Logic)
// =============================================
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: userId });
    if (!order)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
      return res
        .status(400)
        .json({ success: false, message: "Cannot cancel shipped orders." });
    }
    if (order.orderStatus === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Already cancelled." });
    }

    // Restore stock when order is cancelled
    try {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product && product.variants && product.variants.length > 0) {
          const variantIndex = product.variants.findIndex(
            (v) => v.color === item.color
          );
          if (variantIndex !== -1) {
            const sizeIndex = product.variants[variantIndex].sizes.findIndex(
              (s) => s.size === item.size
            );
            if (sizeIndex !== -1) {
              product.variants[variantIndex].sizes[sizeIndex].stock += item.quantity;
              await product.save();
            }
          }
        }
      }
    } catch (stockError) {
      console.log("Error restoring stock:", stockError.message);
    }

    order.orderStatus = "cancelled";
    order.paymentStatus = "cancelled";
    await order.save();

    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully", order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  placeOrder,
  getMyOrders,
  getAllOrdersAdmin,
  updateOrderStatus,
  cancelOrder,
};