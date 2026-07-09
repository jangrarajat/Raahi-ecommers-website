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
import { verifyJwt } from "../middleware/auth.jwt.js";

const route = Router();

// ============================
// PRODUCT ROUTES
// ============================
// Now using JSON instead of multipart since images are uploaded separately
route.post('/addNewProduct', verifyJwt, addNewProduct);
route.put('/updateProduct/:id', verifyJwt, updateProduct);
route.post('/admin/update-stock', verifyJwt, updateVariantStock);
route.delete('/deleteProduct/:id', verifyJwt, deleteProduct);
route.get('/getAllProduct', getAppProduct);
route.get('/search', searchProduct);

// ============================
// ADMIN ORDER ROUTES
// ============================
route.get('/admin/orders', verifyJwt, getAllOrdersAdmin);
route.post('/admin/update-order-status', verifyJwt, updateOrderStatus);

// ============================
// ANALYTICS ROUTES
// ============================
route.get('/admin/stats', verifyJwt, getDashboardStats);

// ============================
// SETTINGS / PINCODE ROUTES
// ============================
route.post("/admin/add-pincode", verifyJwt, addServicesArea);
route.post("/admin/updateDeliveryAvlabelStatus", verifyJwt, updateDeliveryAvlabelStatus);
route.get("/admin/all-pincodes", verifyJwt, getAllServiceAreas);

export default route;