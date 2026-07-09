import express from "express";
import { handleLikeProduct, handleDisLikeProduct, getLikeList } from "../controllers/like.cantroler.js";
import { verifyJwt } from "../middleware/auth.jwt.js";  // ✅ Changed from authenticateUser to verifyJwt

const router = express.Router();

// --- LIKE ROUTES ---
router.post('/likeProduct', verifyJwt, handleLikeProduct);      // ✅ Changed
router.post('/dislikeProduct', verifyJwt, handleDisLikeProduct); // ✅ Changed
router.get('/likeList', verifyJwt, getLikeList);                // ✅ Changed

export default router;