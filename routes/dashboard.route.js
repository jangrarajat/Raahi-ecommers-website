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
    getAllServiceAreas ,
    addNewVariant,
    updateVariant,
    deleteVariant  // ✅ Added
} from "../controllers/dashboard.cantrollers.js"; 
import { verifyJwt } from "../middleware/auth.jwt.js";

const route = Router();

// ============================
// PRODUCT ROUTES
// ============================
route.post('/addNewProduct', verifyJwt, addNewProduct);
route.put('/updateProduct/:id', verifyJwt, updateProduct);
route.post('/admin/update-stock', verifyJwt, updateVariantStock);
route.delete('/deleteProduct/:id', verifyJwt, deleteProduct);
route.get('/getAllProduct', getAppProduct);
route.get('/search', searchProduct);

// ============================
// VARIANT ROUTES ✅
// ============================
route.post('/add-new-variant', verifyJwt, addNewVariant);
route.put('/update-variant/:productId', verifyJwt, updateVariant);
route.delete('/delete-variant/:productId/:variantIndex', verifyJwt, deleteVariant);

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