import { Router } from "express";
import { handleLikeProduct  ,handleDisLikeProduct , getLikeList} from "../controllers/like.cantroler.js";
import { verifyJwt } from "../middleware/auth.jwt.js";

const route = Router()

route.get('/likeList', verifyJwt, getLikeList)
route.post('/likeProduct', verifyJwt, handleLikeProduct)
route.post('/dislikeProduct', verifyJwt, handleDisLikeProduct)
export default route;