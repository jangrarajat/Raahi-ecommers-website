import express from "express";
import { 
    addToCart, 
    removeFromCart, 
    getCartList,
    updateCartQuantity 
} from "../controllers/cart.cantrollers.js";
import { verifyJwt } from "../middleware/auth.jwt.js";  // ✅ Changed

const router = express.Router();

// --- CART ROUTES ---
router.post('/addCartProduct', verifyJwt, addToCart);      // ✅ Changed
router.post('/disCartProduct', verifyJwt, removeFromCart); // ✅ Changed
router.get('/cartList', verifyJwt, getCartList);           // ✅ Changed
router.put('/updateCartQuantity', verifyJwt, updateCartQuantity); // ✅ Changed

export default router;