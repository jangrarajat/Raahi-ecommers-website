import Coupon from "../models/coupon.model.js";

// =============================================
// 1. CREATE COUPON (Admin)
// =============================================
export const createCoupon = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      perUserLimit,
      expiryDate,
      applicableCategories,
      applicableProducts,
      excludedProducts,
    } = req.body;

    if (!code || !description || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: "Code, description, discount type, value, and expiry date are required",
      });
    }

    if (discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: "Discount value must be greater than 0",
      });
    }

    if (discountType === "percentage" && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description,
      discountType,
      discountValue,
      minOrderAmount: minOrderAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || 1,
      expiryDate: new Date(expiryDate),
      applicableCategories: applicableCategories || [],
      applicableProducts: applicableProducts || [],
      excludedProducts: excludedProducts || [],
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully",
      coupon,
    });
  } catch (error) {
    console.error("Error in createCoupon:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 2. GET ALL COUPONS (Admin)
// =============================================
export const getAllCoupons = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [coupons, total] = await Promise.all([
      Coupon.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      coupons,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error in getAllCoupons:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 3. UPDATE COUPON (Admin)
// =============================================
export const updateCoupon = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const { couponId } = req.params;
    const updates = req.body;

    const coupon = await Coupon.findById(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    if (updates.discountType === "percentage" && updates.discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: "Percentage discount cannot exceed 100%",
      });
    }

    if (updates.code && updates.code !== coupon.code) {
      const existingCoupon = await Coupon.findOne({
        code: updates.code.toUpperCase(),
        _id: { $ne: couponId },
      });
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists",
        });
      }
      updates.code = updates.code.toUpperCase();
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      updates,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon: updatedCoupon,
    });
  } catch (error) {
    console.error("Error in updateCoupon:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 4. DELETE COUPON (Admin)
// =============================================
export const deleteCoupon = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const { couponId } = req.params;

    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteCoupon:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 5. VALIDATE COUPON (User)
// =============================================
export const validateCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code, totalAmount, products, categories } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code",
      });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired",
      });
    }

    if (new Date(coupon.startDate) > new Date()) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not active yet",
      });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit has been reached",
      });
    }

    const userUsage = coupon.usedBy.filter(
      (entry) => entry.userId.toString() === userId.toString()
    );
    if (userUsage.length >= coupon.perUserLimit) {
      return res.status(400).json({
        success: false,
        message: `You have already used this coupon ${coupon.perUserLimit} time(s)`,
      });
    }

    if (totalAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required`,
        minRequired: coupon.minOrderAmount,
      });
    }

    if (coupon.applicableCategories && coupon.applicableCategories.length > 0) {
      const hasApplicableCategory = categories.some((cat) =>
        coupon.applicableCategories.includes(cat)
      );
      if (!hasApplicableCategory) {
        return res.status(400).json({
          success: false,
          message: "Coupon is not applicable to products in your cart",
        });
      }
    }

    if (coupon.applicableProducts && coupon.applicableProducts.length > 0) {
      const hasApplicableProduct = products.some((p) =>
        coupon.applicableProducts.includes(p)
      );
      if (!hasApplicableProduct) {
        return res.status(400).json({
          success: false,
          message: "Coupon is not applicable to products in your cart",
        });
      }
    }

    if (coupon.excludedProducts && coupon.excludedProducts.length > 0) {
      const hasExcludedProduct = products.some((p) =>
        coupon.excludedProducts.includes(p)
      );
      if (hasExcludedProduct) {
        return res.status(400).json({
          success: false,
          message: "Coupon cannot be applied to products in your cart",
        });
      }
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (totalAmount * coupon.discountValue) / 100;
    } else {
      discountAmount = coupon.discountValue;
    }

    if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
      discountAmount = coupon.maxDiscountAmount;
    }

    const finalAmount = Math.max(0, totalAmount - discountAmount);

    res.status(200).json({
      success: true,
      valid: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100,
        originalAmount: totalAmount,
      },
    });
  } catch (error) {
    console.error("Error in validateCoupon:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 6. APPLY COUPON TO ORDER (After successful order)
// =============================================
export const applyCouponToOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { couponCode, orderId } = req.body;

    if (!couponCode || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and order ID are required",
      });
    }

    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found",
      });
    }

    const alreadyUsed = coupon.usedBy.some(
      (entry) => entry.orderId.toString() === orderId
    );
    if (alreadyUsed) {
      return res.status(400).json({
        success: false,
        message: "Coupon already applied to this order",
      });
    }

    coupon.usedCount += 1;
    coupon.usedBy.push({
      userId,
      orderId,
      usedAt: new Date(),
    });
    await coupon.save();

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Error in applyCouponToOrder:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 7. GET COUPON STATS (Admin)
// =============================================
export const getCouponStats = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.status(403).json({ success: false, message: "Access Denied" });
    }

    const [totalCoupons, activeCoupons, expiredCoupons, totalUsed] = await Promise.all([
      Coupon.countDocuments(),
      Coupon.countDocuments({ isActive: true, expiryDate: { $gte: new Date() } }),
      Coupon.countDocuments({ expiryDate: { $lt: new Date() } }),
      Coupon.aggregate([
        { $group: { _id: null, total: { $sum: "$usedCount" } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalCoupons,
        activeCoupons,
        expiredCoupons,
        totalUsed: totalUsed.length > 0 ? totalUsed[0].total : 0,
      },
    });
  } catch (error) {
    console.error("Error in getCouponStats:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};