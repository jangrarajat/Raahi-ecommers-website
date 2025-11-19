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
            price: { type: Number, required: true }
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
        enum: ["pending", "paid"],
        default: "pending"
    },

    orderStatus: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "delivered"],
        default: "pending"
    },

    totalAmount: {
        type: Number,
        required: true
    }

}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);
export default Order;
