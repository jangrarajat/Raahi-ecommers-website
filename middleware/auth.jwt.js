import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import cookie from 'cookie-parser'

const verifyJwt = async (req, res, next) => {
 
  const Token = req.cookies?.Token || req.header("Authorization")?.split(" ")[1];
  if (!Token) return res.status(400).json({ success: false, message: "UnAuthroize request" })
  const decodeToken = jwt.verify(Token, process.env.ACCESS_TOKEN_SECRET)
  if (!decodeToken) return res.status(400).json({ success: false, message: "InValid Token" })
  const user = await User.findById(decodeToken._id).select("-password -refreshToken")
  if (!user) return res.status(403).json({ success: false, message: "Token Expired " })
  req.user = user
  next()
}

export { verifyJwt };

