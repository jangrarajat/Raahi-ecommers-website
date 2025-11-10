import mongoose from "mongoose";
import Product from "../models/product.model.js";

// add new products
const addNewProduct = async (req, res) => {
     console.log(req )
    res.status(201)
        .json({
       success:true,
       message:"New product add Successfully",
        
        })
}

export { addNewProduct }