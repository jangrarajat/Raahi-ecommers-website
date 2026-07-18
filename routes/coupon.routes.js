import express from "express";
import { verifyJwt } from "../middleware/auth.jwt.js";
import {
  createCoupon,
  getAllCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  applyCouponToOrder,
  getCouponStats,
} from "../controllers/coupon.controllers.js";

const router = express.Router();

// Admin routes
router.post("/create", verifyJwt, createCoupon);
router.get("/admin/all", verifyJwt, getAllCoupons);
router.put("/update/:couponId", verifyJwt, updateCoupon);
router.delete("/delete/:couponId", verifyJwt, deleteCoupon);
router.get("/admin/stats", verifyJwt, getCouponStats);

// User routes
router.post("/validate", verifyJwt, validateCoupon);
router.post("/apply-to-order", verifyJwt, applyCouponToOrder);

export default router;