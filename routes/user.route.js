import { Router } from "express";
import { verifyJwt } from "../middleware/auth.jwt.js";

const route = Router();
import {
    handleRegistration,
    handleLogin,
    handleLogout,
    refreshToken,
    handleResetPassword,
    forgetPassword,
    verifyOtp,
    setForgetPassword,
    getMe
} from "../controllers/user.cantrollers.js";



route.post('/registration', handleRegistration) // registration

route.post('/login', handleLogin) // Login 

route.post('/logout', verifyJwt, handleLogout) // Logout

route.post('/refreshExpiredToken', refreshToken) // refreshToken

route.patch('/resetPassword', verifyJwt, handleResetPassword) // ResetPassword

route.post('/forgetPassword', forgetPassword) //forget password

route.post('/verify-otp', verifyOtp) //forget password

route.post('/setForgetPassword', setForgetPassword) //forget password

route.get('/get/me', verifyJwt, getMe)

export default route;