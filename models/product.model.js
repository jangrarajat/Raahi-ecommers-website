import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    // 1. Basic Info
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Description is required"]
    },
    
    // 2. Pricing
    price: { 
        type: Number, 
        required: true 
    }, // Selling Price (e.g., 999)
    
    mrp: { 
        type: Number, 
        default: 0
    }, // Original Price (e.g., 1999) - Frontend par cut dikhane ke liye
    
    // 3. Category
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String // e.g., 'T-Shirt', 'Jeans'
    },

    // 4. Images (Multiple - Array of Objects)
    images: [
        {
            public_id: { type: String, required: true },
            url: { type: String, required: true }
        }
    ],

    // 5. VARIANTS (Size & Color Inventory)
    variants: [
        {
            color: { type: String, required: true }, // e.g. "Black"
            size: { type: String, required: true },  // e.g. "M"
            stock: { type: Number, default: 0 }      // e.g. 50
        }
    ],

    // 6. Extra Info
    fabric: { type: String }, 
    isActive: { type: Boolean, default: true }

}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;