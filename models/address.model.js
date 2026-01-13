import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    
    // 1. Recipient Info (Kisey deliver karna hai)
    fullName: { 
        type: String, 
        required: [true, "Name is required"],
        trim: true 
    },
    phone: { 
        type: String, 
        required: [true, "Phone number is required"],
        match: [/^[0-9]{10}$/, "Please enter a valid 10 digit number"] // Validation
    },
    altPhone: { // Agar main phone switch off ho
        type: String,
        match: [/^[0-9]{10}$/, "Please enter a valid 10 digit number"]
    },

    // 2. Exact Location Details
    pincode: { 
        type: String, 
        required: [true, "Pincode is required"],
        trim: true 
    },
    state: { 
        type: String, 
        required: true 
    },
    city: { 
        type: String, 
        required: true 
    },
    
    // Sabse Important: Ghar ka number alag, Gali/Colony alag
    houseNo: { 
        type: String, 
        required: [true, "House/Flat No. is required"] // Delivery boy ke liye zaroori
    },
    area: { 
        type: String, 
        required: [true, "Area/Road/Colony is required"] 
    },
    landmark: { 
        type: String,
        default: "" 
    },

    // 3. Address Type (Delivery Timing ke liye)
    type: {
        type: String,
        enum: ["Home", "Work", "Other"], // Home = All days, Work = 10am-6pm
        required: true,
        default: "Home"
    },

    // 4. Status Flags
    isDefault: {
        type: Boolean,
        default: false
    },
    isDeleted: { // Soft Delete (Data database me rahega par user ko nahi dikhega)
        type: Boolean,
        default: false
    }

}, { timestamps: true });

// Middleware: Jab bhi user find kare, 'deleted' address na dikhaye
addressSchema.pre(/^find/, function(next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});

const Address = mongoose.model("Address", addressSchema);
export default Address;