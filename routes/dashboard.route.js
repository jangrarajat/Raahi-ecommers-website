import { addNewProduct, deleteProduct, getAppProduct } from "../controllers/dashboard.cantrollers.js";
import { Router } from "express";
import multer from 'multer'
import { upload } from "../middleware/multer.middleware.js";
const route = Router()

route.post('/addNewProduct', upload.single('image'), addNewProduct)

route.delete('/deleteProduct', deleteProduct)

route.get('/getAllProduct',  getAppProduct)

export default route