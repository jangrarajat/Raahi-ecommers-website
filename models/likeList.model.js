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
    // --- VARIANT FIELDS ---
    color: {
        type: String,
        required: true,
        default: null
    },
    size: {
        type: String,
        required: true,
        default: null
    },
    // ✅ NEW: Store variant image URL
    variantImage: {
        type: String,
        default: null
    }

}, { timestamps: true })

// UNIQUE INDEX: Same user, same product, same variant = ek hi like
likeSchema.index({ userId: 1, productId: 1, color: 1, size: 1 }, { unique: true })

const Like = mongoose.model("Like", likeSchema)
export default Like