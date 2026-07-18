import express from "express";
import { verifyJwt } from "../middleware/auth.jwt.js";
import {
  canReview,
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
  markHelpful,
} from "../controllers/review.controllers.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// Public routes
router.get("/product/:productId", getProductReviews);

// Protected routes
router.get("/can-review", verifyJwt, canReview);
router.post(
  "/create",
  verifyJwt,
  upload.array("images", 5),
  createReview
);
router.put("/:reviewId", verifyJwt, updateReview);
router.delete("/:reviewId", verifyJwt, deleteReview);
router.post("/:reviewId/helpful", verifyJwt, markHelpful);

export default router;