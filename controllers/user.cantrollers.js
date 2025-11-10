import jwt, { decode } from "jsonwebtoken";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt'


//  registration 
const handleRegistration = async (req, res) => {
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
}

//  login
const handleLogin = async (req, res) => {
    const { email, password } = req.body

    const findUser = await User.findOne({ email: email }) // find user
    if (!findUser) return res.status(400).json({ success: false, message: "User not exist" })

    const checkPassword = await bcrypt.compare(password, findUser.password)
    if (!checkPassword) return res.status(400).json({ success: false, message: "Incurrect password" })


    // genrate token
    const Token = await jwt.sign({
        _id: findUser._id,
        username: findUser.username,
        email: findUser.email
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

    await User.findByIdAndUpdate(findUser._id, { refreshToken: refreshToken })

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
}



// Logout
const handleLogout = async (req, res) => {

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
}

//  refresh Expirey token 
const refreshToken = async (req, res) => {

    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token requried" })
    const decode = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    if (!decode) return res.status(400).json({ success: false, message: "Expired Refresh token" })
    const user = await User.findById(decode._id)
    const newToken = await jwt.sign({
        _id: user._id,
        username: user.username,
        email: user.email
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
}


// reset password
const handleResetPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) return res.status(400).json({ success: false, message: "OldPassword & new password are requried" })

    const user = await User.findById(req.user._id)
    if(!user)  return res.status(400).json({ success: false, message: "User note Exist" })

    const compareResult = await bcrypt.compare(oldPassword, user.password)
    if (!compareResult) return res.status(400).json({ success: false, message: "Incorrect password" })



    user.password = newPassword
    await user.save()

    res.status(200)
        .json({
            success: true,
            message: "Reset Password Successfully",

        })
}


export {
    handleRegistration,
    handleLogin,
    refreshToken,
    handleLogout,
    handleResetPassword
};