import { Schema, mongoose } from 'mongoose'
import Product from './product.model.js'
import User from './user.model.js'

const likeSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true
    },

}, { timestamps: true })

const Like = mongoose.model("Like", likeSchema)

export default Like