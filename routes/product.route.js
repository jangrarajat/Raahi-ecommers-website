import { Router } from "express";
import { getAppProduct, getSingleProduct  } from "../controllers/products.cantrollers.js";

const route = Router()

route.get('/getLimitProduct', getAppProduct)
route.get('/getSingleProduct', getSingleProduct)
 

export default route; 