import { Router } from "express";
import { 
    addNewProduct, 
    updateProduct,
    updateVariantStock, 
    deleteProduct, 
    getAppProduct, 
    searchProduct,
    getAllOrdersAdmin, 
    updateOrderStatus,
    getDashboardStats,
    addServicesArea, 
    updateDeliveryAvlabelStatus,
    getAllServiceAreas 
} from "../controllers/dashboard.cantrollers.js"; 
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.jwt.js";

const route = Router();

// ============================
// PRODUCT ROUTES
// ============================
route.post('/addNewProduct', verifyJwt, upload.array('images', 5), addNewProduct);
route.put('/updateProduct/:id', verifyJwt, updateProduct);
route.post('/admin/update-stock', verifyJwt, updateVariantStock); // Stock Update
route.delete('/deleteProduct/:id', verifyJwt, deleteProduct); // Delete
route.get('/getAllProduct', getAppProduct); // With Pagination & Search
route.get('/search', searchProduct);

// ============================
// ADMIN ORDER ROUTES
// ============================
route.get('/admin/orders', verifyJwt, getAllOrdersAdmin); // With Pagination
route.post('/admin/update-order-status', verifyJwt, updateOrderStatus); // Update Status

// ============================
// ANALYTICS ROUTES
// ============================
route.get('/admin/stats', verifyJwt, getDashboardStats);

// ============================
// SETTINGS / PINCODE ROUTES
// ============================
route.post("/admin/add-pincode", verifyJwt, addServicesArea);
route.post("/admin/updateDeliveryAvlabelStatus", verifyJwt, updateDeliveryAvlabelStatus);
route.get("/admin/all-pincodes", verifyJwt, getAllServiceAreas); // New route to fetch list

export default route;