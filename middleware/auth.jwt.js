import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import cookie from 'cookie-parser'

const verifyJwt = async (req, res, next) => {

  try {
    const Token = req.cookies?.Token || req.header("Authorization")?.split(" ")[1];
    if (!Token) return res.status(400).json({ success: false, message: "UnAuthroize request" })
    const decodeToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
    if (!decodeToken) return res.status(400).json({ success: false, message: "InValid Token" })
    const user = await User.findById(decodeToken._id).select("-password -refreshToken")
    if (!user) return res.status(403).json({ success: false, message: "Token Expired " })
    req.user = user
    next()
  } catch (error) {
    console.log("Error in verifyJwt", error.message)
    if (error.message === "jwt expired") return res.status(500).json({ success: false, message: error.message })
    res.status(500)
      .json({
        success: false,
        message: "Failed verify Token",
        error: error.message
      })
  }
}

export { verifyJwt };

