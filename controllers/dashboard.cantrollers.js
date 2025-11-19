import { uploadOnCloudinary, deleteImageOnCloudinary } from "../middleware/multer.middleware.js";
import Product from "../models/product.model.js";
import ServiceArea from "../models/serviceArea.model.js";




const addNewProduct = async (req, res) => {

    if (req.user.role === "user") return res.status(400).json({ success: false, message: "Only owner can access this feater" })

    if (!req.body) return res.status(400).json({ success: false, message: "nam, descraption , category , quantity ,image, price these fields are requried" })

    const { name, descraption, category, quantity, price } = req.body
    if (!name || !descraption || !category || !quantity || !price) return res.status(400).json({ success: false, message: "all fields are requried" })


    try {

        if (!req.file.path) return res.status(400).json({ success: false, message: "image file requried" })
        const imageUrl = await uploadOnCloudinary(req.file.path)
        if (!imageUrl) return res.status(400).json({ success: "image uplaod failded " })
        const newproduct = await Product.create({ name: name, descraption: descraption, category: category, quantity: quantity, price: price, imageUrl: imageUrl.url, public_id: imageUrl.public_id })
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

    const { public_id, _id } = req.body
    if (!public_id) return res.status(400).json({ success: true, message: "public_id is reqried" })
    const deletedProduct = await deleteImageOnCloudinary(public_id)
    const product = await Product.findByIdAndDelete(_id)
    if (!product) return res.status(400).json({ success: true, message: "delete producte Failed " })
    res.status(200)
        .json({
            success: true,
            message: "delete product successfully"
        })
}

const getAppProduct = async (req, res) => {
    let allProduct
    const { category } = req.body
    if (category === "man") {
        allProduct = await Product.find({ category: "man" })

    } else if (category === "ladies") {
        allProduct = await Product.find({ category: "ladies" })

    } else if (category === "all") {
        allProduct = await Product.find()

    }

    if (!allProduct) return res.status(500).json({ success: true, message: "Get All data failed" })

    res.status(200)
        .json({
            success: true,
            message: "successflly",
            allProduct
        })
}


const addServicesArea = async (req, res) => {
    try {
        const { pincode } = req.body;
        const existPincode = await ServiceArea.findOne({ pincode })
        if (existPincode) return res.status(400).json({ success: false, message: "This pincode Exist" })
        await ServiceArea.create({ pincode });

        res.status(201).json({ success: true, message: "Pincode added" });
    } catch (error) {
        console.log("Error in  addServicesArea")
        res.status(400).json({ success: false, message: error.message });
    }
}

const updateDeliveryAvlabelStatus = async (req, res) => {
    try {
        const { DeliveryAvlabelStatus, pincode } = req.body

        if (DeliveryAvlabelStatus === undefined  || !pincode) return res.status(400).json({ success: false, message: "DeliveryAvlabelStatus & pincode field are reueried" })

        const existPincode = await ServiceArea.findOne({ pincode })
        if (!existPincode) return res.status(400).json({ success: false, message: "This pincode not exist" })

        const getDeliveryStatus = await ServiceArea.findOneAndUpdate({ pincode }, { DeliveryAvlabelStatus: DeliveryAvlabelStatus })
        if (!getDeliveryStatus) return res.status(400).json({ success: false, message: "Update failed DeliveryStatus" })
        console.log(getDeliveryStatus)

        res.status(200)
            .json({
                success: true,
                message: "Update successfully DeliveryStatus",
                getDeliveryStatus
            })

    } catch (error) {
        console.log("Error in updateDeliveryStatus  ", error.message)
        res.status(500).json({ success: false, message: "server Error" });
    }
}

export { addNewProduct, deleteProduct, getAppProduct, addServicesArea, updateDeliveryAvlabelStatus }