import { Router } from "express";
import { 
    addNewProduct, 
    updateProduct,
    updateVariantStock, // New Stock Update
    deleteProduct, 
    getAppProduct, 
    searchProduct,
    getAllOrdersAdmin, 
    updateOrderStatus,
    getDashboardStats,
    addServicesArea, 
    updateDeliveryAvlabelStatus 
} from "../controllers/dashboard.cantrollers.js"; // File name check kar lena (controller vs cantrollers)
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.jwt.js";

const route = Router();

// ============================
// PRODUCT ROUTES
// ============================

// Add New Product (Max 5 Images)
route.post('/addNewProduct', verifyJwt, upload.array('images', 5), addNewProduct);

// Update Product Details (Generic)
route.put('/updateProduct/:id', verifyJwt, updateProduct);

// Update Stock Only (Specific Variant)
route.post('/admin/update-stock', verifyJwt, updateVariantStock);

// Delete Product
route.delete('/deleteProduct/:id', verifyJwt, deleteProduct);

// Public Routes (No Login Required)
route.get('/getAllProduct', getAppProduct);
route.get('/search', searchProduct);


// ============================
// ADMIN ORDER ROUTES
// ============================
route.get('/admin/orders', verifyJwt, getAllOrdersAdmin);
route.post('/admin/update-order-status', verifyJwt, updateOrderStatus);


// ============================
// ANALYTICS & SETTINGS
// ============================
route.get('/admin/stats', verifyJwt, getDashboardStats);

route.post("/admin/add-pincode", verifyJwt, addServicesArea);
route.post("/admin/updateDeliveryAvlabelStatus", verifyJwt, updateDeliveryAvlabelStatus);

export default route;