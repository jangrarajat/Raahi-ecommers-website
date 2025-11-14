import jwt, { decode } from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt'
import Otp from "../models/otp.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { otpEmailHtml } from "../utils/mailHtml.js";

//  registration 
const handleRegistration = async (req, res) => {
    try {
        const { username, email, password } = req.body

        // all fields are requried
        if (!username || !email || !password) return res.status(400).json({ success: false, message: "all fields are requried" })

        //  chack user Existing
        const exist = await User.findOne({ email: email })
        if (exist) return res.status(400).json({ success: false, message: "User allready exist" })



        // registred new user
        const user = await User.create({ username: username, email: email, password: password })

        const createdUser = await User.findById(user._id).select("-password")


        res.status(201).json({
            success: true,
            createdUser
        })
    } catch (error) {
        console.log("Error in  Registration", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed Registration ",
                error: error.message
            })
    }
}

//  login
const handleLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        const findUser = await User.findOne({ email: email }) // find user
        if (!findUser) return res.status(400).json({ success: false, message: "User not exist" })

        const checkPassword = await bcrypt.compare(password, findUser.password)
        if (!checkPassword) return res.status(400).json({ success: false, message: "Incurrect password" })

        const role = email === process.env.OWNER_EMAIL ? "owner" : "user";
        // genrate token
        const Token = await jwt.sign({
            _id: findUser._id,
            username: findUser.username,
            email: findUser.email,
            role: role
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIR
        })
        //  genrate refresh token
        const refreshToken = await jwt.sign({
            _id: findUser._id,
            username: findUser.username,
            email: findUser.email
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIR
        })

        await User.findByIdAndUpdate(findUser._id, { refreshToken: refreshToken, role: role })

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        }


        const loginUser = await User.findById(findUser._id).select("-password -refreshToken")

        res.status(201)
            .cookie("refreshToken", refreshToken, options)
            .cookie("Token", Token, options)
            .json({
                success: true,
                message: "Login Success",
                user: loginUser,



            })
    } catch (error) {
        console.log("Error in  handleLogin", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed Login ",
                error: error.message
            })
    }
}



// Logout
const handleLogout = async (req, res) => {

    try {
        await User.findByIdAndUpdate(req.user._id, { $unset: { refreshToken: "" } })

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        }

        res.status(200)
            .clearCookie("refreshToken", options)
            .clearCookie("Token", options)
            .json({
                success: true,
                message: "Logout Successfully",

            })
    } catch (error) {
        console.log("Error in  handleLogout", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed Logout ",
                error: error.message
            })
    }
}

//  refresh Expirey token 
const refreshToken = async (req, res) => {

    try {
        const refreshToken = req.cookies.refreshToken
        if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token requried" })
        const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
        if (!decode) return res.status(400).json({ success: false, message: "Expired Refresh token" })
        const user = await User.findById(decode._id)
        const role = user.email === process.env.OWNER_EMAIL ? "owner" : "user";
        const newToken = await jwt.sign({
            _id: user._id,
            username: user.username,
            email: user.email,
            role: role
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIR
        })

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        }

        res.status(201)
            .cookie("Token", newToken, options)
            .json({
                success: true,
                message: "Refresh token successfully",


            })
    } catch (error) {
        console.log("Error in  refreshToken", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed refresh Token ",
                error: error.message
            })
    }
}


// reset password
const handleResetPassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: "OldPassword & new password are requried" })

        const user = await User.findById(req.user._id)
        if (!user) return res.status(400).json({ success: false, message: "User note Exist" })

        const compareResult = await bcrypt.compare(oldPassword, user.password)
        if (!compareResult) return res.status(400).json({ success: false, message: "Incorrect password" })



        user.password = newPassword
        await user.save()

        res.status(200)
            .json({
                success: true,
                message: "Reset Password Successfully",

            })
    } catch (error) {
        console.log("Error in handleResetPassword", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed Reser password ",
                error: error.message
            })
    }
}


const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const findUser = await User.findOne({ email: email })

        if (!findUser) return res.status(400).json({ success: false, message: "User not exist!!" })
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        // Save OTP
        const createdOtp = await Otp.create({
            email: email,
            otp: otp,
            expiresAt: expiresAt
        });

        if (!createdOtp) {
            return res.json({ success: false, message: "Otp save error" });
        }

        // Send Email
        const html = otpEmailHtml(otp);
        await sendEmail(email, "Your OTP Code", html);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        });

    } catch (error) {
        console.log("Error in forgetPassword", error.message);
        return res.status(500).json({
            success: false,
            message: "Error in forget password",
            error: error.message
        });
    }
};


const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email & OTP are required"
            });
        }

        const findUser = await User.findOne({ email: email })

        if (!findUser) return res.status(400).json({ success: false, message: "User not exist!!" })


        const otpData = await Otp.findOne({ email }).sort({ createdAt: -1 });

        if (!otpData) {
            return res.json({ success: false, message: "OTP expired" });
        }

        // Check Expiry
        if (otpData.expiresAt < new Date()) {
            return res.json({ success: false, message: "OTP expired" });
        }

        // Check OTP
        if (otpData.otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }
        await Otp.deleteMany({ email });

        const user = await User.findOne({ email: email })
        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        }

        const forgetPasswordToken = await jwt.sign({
            _id: user._id,
            username: user.username,
            email: user.email,
        }, process.env.FORGET_PASSWORD_TOKEN_SECRET, {
            expiresIn: process.env.FORGET_PASSWORD_TOKEN_EXPIR
        })
        return res.status(200)
            .cookie("forgetPasswordToken", forgetPasswordToken, options)
            .json({ success: true, message: "OTP verified success" });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const setForgetPassword = async (req, res) => {
    try {
        const { newPassword } = req.body

        const forgetPasswordToken = req.cookies?.forgetPasswordToken

        if (!forgetPasswordToken) return res.status(500).json({ success: false, message: "UnAuthorize request" })

        const decode = jwt.verify(forgetPasswordToken, process.env.FORGET_PASSWORD_TOKEN_SECRET)
        if (decode === "jwt expired") return res.status(400).json({ success: false, message: "Token expired" })
        console.log(decode)

        const user = await User.findById(decode._id)


        user.password = newPassword;
        await user.save()

        const options = {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
        }

        res.status(200)
            .clearCookie("forgetPasswordToken", options)
            .json({ success: true, message: "set newPassword success", user })

    } catch (error) {
        console.log(error.message)
        if (error.message === "jwt expired") return res.status(500).json({ success: false, message: error.message }) 
        res.status(500).json({ success: false, message: "server error" })
    }
}


export {
    handleRegistration,
    handleLogin,
    refreshToken,
    handleLogout,
    handleResetPassword,
    forgetPassword,
    verifyOtp,
    setForgetPassword
};