import { Schema, mongoose } from 'mongoose'

const likeSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    // ✅ ONLY COLOR - Size remove kar diya
    color: {
        type: String,
        default: null
    },
    // Store variant image URL
    variantImage: {
        type: String,
        default: null
    }

}, { timestamps: true })

// ✅ Unique: userId + productId + color (size nahi)
likeSchema.index({ 
    userId: 1, 
    productId: 1, 
    color: 1 
}, { 
    unique: true 
})

const Like = mongoose.model("Like", likeSchema)
export default Like