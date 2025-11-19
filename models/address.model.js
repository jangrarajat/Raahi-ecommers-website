import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    houseNo: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },

    landmark: { type: String },
    addressType: { type: String, enum: ["home", "office"], default: "home" }

}, { timestamps: true });

const Address = mongoose.model("Address", addressSchema);
export default Address;
