import { addNewProduct, deleteProduct, getAppProduct, addServicesArea , updateDeliveryStatus } from "../controllers/dashboard.cantrollers.js";
import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.jwt.js";
const route = Router()

route.post('/addNewProduct', upload.single('image'), verifyJwt, addNewProduct)

route.delete('/deleteProduct', deleteProduct)

route.get('/getAllProduct', getAppProduct)

route.post("/admin/add-pincode", verifyJwt, addServicesArea);

route.post("/admin/updateDeliveryStatus", verifyJwt, updateDeliveryStatus);

export default route;