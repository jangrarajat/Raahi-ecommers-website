import { Router } from "express";
import { getAppProduct } from "../controllers/products.cantrollers.js";

const route = Router()

route.post('/getLimitProduct', getAppProduct)

export default route; 