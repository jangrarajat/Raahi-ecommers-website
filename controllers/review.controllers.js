import Review from "../models/review.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../middleware/multer.middleware.js";
import mongoose from "mongoose";

// =============================================
// 1. CHECK IF USER CAN REVIEW (ORDER DELIVERED)
// =============================================
export const canReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, orderId } = req.query;

    if (!productId || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Product ID and Order ID are required",
      });
    }

    // Check if order exists and is delivered
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
      orderStatus: "delivered",
    });

    if (!order) {
      return res.status(200).json({
        success: true,
        canReview: false,
        message: "Order not delivered or not found",
      });
    }

    // Check if product exists in order
    const productInOrder = order.items.some(
      (item) => item.productId.toString() === productId
    );

    if (!productInOrder) {
      return res.status(200).json({
        success: true,
        canReview: false,
        message: "Product not found in this order",
      });
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({
      userId,
      productId,
    });

    if (existingReview) {
      return res.status(200).json({
        success: true,
        canReview: false,
        message: "You already reviewed this product",
        review: existingReview,
      });
    }

    res.status(200).json({
      success: true,
      canReview: true,
      message: "You can review this product",
    });
  } catch (error) {
    console.error("Error in canReview:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 2. CREATE REVIEW
// =============================================
export const createReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, orderId, rating, review } = req.body;

    // Validate required fields
    if (!productId || !orderId || !rating || !review) {
      // Clean up any uploaded files if validation fails
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const fs = await import('fs');
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.error("Error cleaning up file:", err);
          }
        }
      }
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if order exists and is delivered
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
      orderStatus: "delivered",
    });

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order not delivered or not found",
      });
    }

    // Check if product exists in order
    const productInOrder = order.items.some(
      (item) => item.productId.toString() === productId
    );

    if (!productInOrder) {
      return res.status(400).json({
        success: false,
        message: "Product not found in this order",
      });
    }

    // Check if already reviewed (BEFORE uploading images)
    const existingReview = await Review.findOne({
      userId,
      productId,
    });

    if (existingReview) {
      // Clean up uploaded files
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          try {
            const fs = await import('fs');
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.error("Error cleaning up file:", err);
          }
        }
      }
      return res.status(400).json({
        success: false,
        message: "You already reviewed this product",
        review: existingReview,
      });
    }

    // Upload images to Cloudinary if any
    let imageUrls = [];
    let uploadedImages = [];
    
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const result = await uploadOnCloudinary(file.path, "reviews");
          if (result) {
            imageUrls.push({
              public_id: result.public_id,
              url: result.secure_url,
            });
            uploadedImages.push(result.public_id);
          }
        } catch (uploadError) {
          console.error("Image upload error:", uploadError);
        }
      }
    }

    try {
      // Create review
      const newReview = await Review.create({
        userId,
        productId,
        orderId,
        rating: parseInt(rating),
        review: review.trim(),
        images: imageUrls,
        isVerifiedPurchase: true,
      });

      // Populate user details
      const populatedReview = await Review.findById(newReview._id)
        .populate("userId", "username email")
        .populate("productId", "name price images");

      res.status(201).json({
        success: true,
        message: "Review submitted successfully",
        review: populatedReview,
      });
    } catch (dbError) {
      // If database insert fails, delete uploaded images from Cloudinary
      if (uploadedImages.length > 0) {
        for (const publicId of uploadedImages) {
          try {
            await deleteFromCloudinary(publicId);
          } catch (err) {
            console.error("Error deleting uploaded image:", err);
          }
        }
      }
      throw dbError;
    }
  } catch (error) {
    console.error("Error in createReview:", error);
    
    // Check if it's a duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }
    
    res.status(500).json({
      success: false,
      message: error.message || "Failed to submit review",
    });
  }
};

// =============================================
// 3. GET PRODUCT REVIEWS
// =============================================
export const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const [reviews, totalReviews, ratingStats] = await Promise.all([
      Review.find({ productId })
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ productId }),
      Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalReviews: { $sum: 1 },
            ratingCounts: {
              $push: "$rating",
            },
          },
        },
      ]),
    ]);

    // Calculate rating distribution
    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    if (ratingStats.length > 0) {
      ratingStats[0].ratingCounts.forEach((r) => {
        ratingDistribution[r] = (ratingDistribution[r] || 0) + 1;
      });
    }

    const averageRating = ratingStats.length > 0
      ? Math.round(ratingStats[0].averageRating * 10) / 10
      : 0;

    const totalPages = Math.ceil(totalReviews / limit);

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        totalPages,
        totalReviews,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      stats: {
        averageRating,
        totalReviews,
        ratingDistribution,
      },
    });
  } catch (error) {
    console.error("Error in getProductReviews:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 4. UPDATE REVIEW (User)
// =============================================
export const updateReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;
    const { rating, review } = req.body;

    const existingReview = await Review.findOne({
      _id: reviewId,
      userId: userId,
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    if (rating) existingReview.rating = parseInt(rating);
    if (review) existingReview.review = review.trim();

    await existingReview.save();

    const updatedReview = await Review.findById(existingReview._id)
      .populate("userId", "username email")
      .populate("productId", "name price");

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    console.error("Error in updateReview:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 5. DELETE REVIEW (User)
// =============================================
export const deleteReview = async (req, res) => {
  try {
    const userId = req.user._id;
    const { reviewId } = req.params;

    const review = await Review.findOne({
      _id: reviewId,
      userId: userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found or unauthorized",
      });
    }

    // Delete images from Cloudinary
    if (review.images && review.images.length > 0) {
      for (const image of review.images) {
        try {
          await deleteFromCloudinary(image.public_id);
        } catch (err) {
          console.error("Error deleting image from cloudinary:", err);
        }
      }
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteReview:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =============================================
// 6. HELPFUL REVIEW
// =============================================
export const markHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findByIdAndUpdate(
      reviewId,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Marked as helpful",
      helpful: review.helpful,
    });
  } catch (error) {
    console.error("Error in markHelpful:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};