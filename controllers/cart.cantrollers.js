import Cart from "../models/cartList.model.js";

const handleCartProduct = async (req, res) => {
    try {
        const { productId } = req.body
        if (!productId) return res.status(400).json({ success: false, message: "productId id requried" })

        const findCartProdcut = await Cart.findOne({ productId: productId, userId: req.user._id })
        if (findCartProdcut) return res.status(400).json({ success: false, message: "Allready Added in Cart " })

        const cartProdcut = await Cart.create({
            productId: productId,
            userId: req.user._id
        })

        if (!cartProdcut) return res.status(500).json({ success: false, message: "Add to cart product server error" })


        res.status(200)
            .json({
                success: true,
                message: "Add to cart Successfully"
            })
    } catch (error) {
        console.log("Error in handleCartProduct", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed Add to Cart Product list",
                error: error.message
            })
    }
};

const handleDisCartProduct = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "productId id requried" })
        const { productId } = req.body
        const findCartProdcut = await Cart.findOne({ productId: productId, userId: req.user._id })
        if (!findCartProdcut) return res.status(400).json({ success: false, message: "Not Cart  this product " })
        const disCartProduct = await Cart.findOneAndDelete({ productId: productId, userId: req.user._id })
        if (!disCartProduct) return res.status(500).json({ success: false, message: "Add to cart  Failed Server error" })

        res.status(200)
            .json({
                success: true,
                message: "DisCart Successfully"
            })
    } catch (error) {
        console.log("Error in handleDisCartProduct", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed DisCart Product list",
                error: error.message
            })
    }
}


const getCartList = async (req, res) => {
    try {
        const userId = req.user._id;
        const cartList = await Cart.find({ userId }).populate("productId")

        res.status(200)
            .json({
                success: true,
                message: "Get Like List successfully",
                cartList
            })
    } catch (error) {
        console.log("Error in getCartList", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed get Cart list",
                error: error.message
            })
    }
}

export { handleCartProduct, handleDisCartProduct, getCartList };