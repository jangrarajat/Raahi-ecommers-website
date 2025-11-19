import mongoose from "mongoose";

const serviceAreaSchema = new mongoose.Schema({
    pincode: {
        type: String,
        required: true,
        unique: true,
        minlength: 6,
        maxlength: 6
    },
    DeliveryStatus: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const ServiceArea =  mongoose.model("ServiceArea", serviceAreaSchema);
export default ServiceArea;
