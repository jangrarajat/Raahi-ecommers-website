import { Router } from "express";
import {
    handleRegistration,
    handleLogin,
    handleLogout,
    refreshToken,
    handleResetPassword
} from "../controllers/user.cantrollers.js";

const route = Router();
import { verifyJwt } from "../middleware/auth.jwt.js";


route.post('/registration', handleRegistration) // registration

route.post('/login', handleLogin) // Login 

route.post('/logout', verifyJwt, handleLogout) // Logout

route.post('/refreshExpiredToken', refreshToken) // refreshToken

route.patch('/resetPassword', verifyJwt, handleResetPassword) // ResetPassword



export default route;