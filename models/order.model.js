import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: { type: Number, required: true },
            price: { type: Number, required: true },
            size: { type: String, default: "N/A" }, 
            color: { type: String, default: "N/A" }
        }
    ],

    addressId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        required: true
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        required: true
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "cancelled", "refunded"],
        default: "pending"
    },

    orderStatus: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
        default: "pending"
    },

    totalAmount: {
        type: Number,
        required: true
    },

    // Coupon fields
    couponCode: {
        type: String,
        default: null
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    originalTotal: {
        type: Number,
        default: null
    }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;