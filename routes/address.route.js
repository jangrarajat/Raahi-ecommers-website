import { Router } from "express";
import { verifyJwt } from "../middleware/auth.jwt.js";
import { validateAddress } from "../middleware/address.Validation.middleware.js";
import { addAddress , setDefaultAddress } from "../controllers/address.cantrollers.js";

const route = Router()


route.post('/add-address', verifyJwt, validateAddress, addAddress )

route.post('/set-default-address', verifyJwt, setDefaultAddress)


export default route;