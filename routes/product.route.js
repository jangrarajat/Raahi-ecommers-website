import { Router } from "express";
import { getAppProduct } from "../controllers/products.cantrollers.js";

const route = Router()

route.get('/getLimitProduct', getAppProduct)

export default route; 