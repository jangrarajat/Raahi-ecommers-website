import { addNewProduct } from "../controllers/dashboard.cantrollers.js";
import { Router } from "express";
const route = Router()

route.post('/addNewProduct' , addNewProduct)


export default route