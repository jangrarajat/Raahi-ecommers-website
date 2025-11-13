import { Router } from "express";
import { verifyJwt } from "../middleware/auth.jwt.js";
import { getCartList, handleCartProduct, handleDisCartProduct } from "../controllers/cart.cantrollers.js";

const route = Router()

route.get('/cartList', verifyJwt, getCartList)
route.post('/addCartProduct', verifyJwt, handleCartProduct)
route.post('/disCartProduct', verifyJwt, handleDisCartProduct)
export default route;