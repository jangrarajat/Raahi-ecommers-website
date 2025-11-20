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
    }

}, { timestamps: true })

const Cart = mongoose.model("Cart", cartSchema)

export default Cart