import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
});

const variantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  sizes: [sizeSchema], // Array of sizes with stock
  images: [
    {
      public_id: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: true,
    },
    mrp: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
    },
    variants: [variantSchema],
    fabric: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

export default Product;
