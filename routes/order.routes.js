import express from 'express';
import { verifyJwt } from '../middleware/auth.jwt.js'; // Aapka Auth Middleware
import {
    placeOrder,
    getMyOrders,
    getAllOrdersAdmin,
    updateOrderStatus,
    cancelledOdder 
} from '../controllers/orderController.js';

const router = express.Router();

// ----------- USER ROUTES -----------
// 1. Order Place karne ke liye
router.post('/place-order', verifyJwt, placeOrder);

// 2. Apne khud ke orders dekhne ke liye
router.get('/my-orders', verifyJwt, getMyOrders);


// ----------- ADMIN / OWNER ROUTES -----------
// 3. Saare customers ke orders dekhne ke liye
router.get('/admin/all-orders', verifyJwt, getAllOrdersAdmin);

// 4. Order ka status badalne ke liye (Pending -> Shipped -> Delivered)
router.post('/admin/update-status', verifyJwt, updateOrderStatus);

router.post('/cancel/Odder' , verifyJwt , cancelledOdder )

export default router;