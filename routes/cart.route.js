import express from 'express';
import { 
    addToCart, 
    removeFromCart, 
    getCartList, 
    updateCartQuantity,
    clearCart // Add this import
} from '../controllers/cart.cantrollers.js';
import { verifyJwt } from '../middleware/auth.jwt.js';

const router = express.Router();

// All routes are protected with verifyJwt
router.post('/addCartProduct', verifyJwt, addToCart);
router.post('/disCartProduct', verifyJwt, removeFromCart);
router.get('/cartList', verifyJwt, getCartList);
router.put('/update-quantity', verifyJwt, updateCartQuantity);
router.delete('/clear-cart', verifyJwt, clearCart); // Add this route

export default router;