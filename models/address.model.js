import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: String,
    phone: String,
    pincode: String,
    state: String,
    district: String,
    city: String,
    landmark: String,
    isDefault: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);
export default Address;
