import { uploadOnCloudinary, deleteImageOnCloudinary } from "../middleware/multer.middleware.js";
import Product from "../models/product.model.js";


const addNewProduct = async (req, res) => {
    const { name, descraption, category, quantity, price } = req.body
    if (!name || !descraption || !category || !quantity || !price) return res.status(400).json({ success: false, message: "all fields are requried" })


    try {

        if (!req.file.path) return res.status(400).json({ success: false, message: "image file requried" })
        const imageUrl = await uploadOnCloudinary(req.file.path)
        if (!imageUrl) return res.status(400).json({ success: "image uplaod failded " })
        const newproduct = await Product.create({ name: name, descraption: descraption, category: category, quantity: quantity, price: price, imageUrl: imageUrl.url ,public_id:imageUrl.public_id })
        if (!newproduct) return res.status(400).json({ success: false, message: "New product registred failed" })
        




        res.status(201).json({
            success: true,
            message: "New product added successfully",
            newproduct

        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};



const deleteProduct = async (req, res) => {
    res.status(200)
        .json({
            success: true,
            message: "delete product successfully"
        })
}


export { addNewProduct, deleteProduct }