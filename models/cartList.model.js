import { Schema, mongoose } from 'mongoose'

const cartSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
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

// UNIQUE INDEX: Same user, same product, same variant = ek hi entry
cartSchema.index({ userId: 1, productId: 1, color: 1, size: 1 }, { unique: true })

const Cart = mongoose.model("Cart", cartSchema)
export default Cart