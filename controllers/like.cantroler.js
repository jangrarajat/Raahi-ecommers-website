import Like from "../models/likeList.model.js";

const handleLikeProduct = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "productId id requried" })
        const { productId } = req.body

        const findLikedProdcut = await Like.findOne({ productId: productId, userId: req.user._id })
        if (findLikedProdcut) return res.status(400).json({ success: false, message: "Allready liked " })

        const likedProdcut = await Like.create({
            productId: productId,
            userId: req.user._id
        })

        if (!likedProdcut) return res.status(500).json({ success: false, message: "Like product server error" })


        res.status(200)
            .json({
                success: true,
                message: "Like Successfully"
            })
    } catch (error) {
        console.log("Error in handleLikeProduct", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed Like ",
                error: error.message
            })
    }
};

const handleDisLikeProduct = async (req, res) => {
    try {
        if (!req.body) return res.status(400).json({ success: false, message: "productId id requried" })
        const { productId } = req.body
        const findLikedProdcut = await Like.findOne({ productId: productId, userId: req.user._id })
        if (!findLikedProdcut) return res.status(400).json({ success: false, message: "Not like this product " })
        const disLikeProduct = await Like.findOneAndDelete({ productId: productId, userId: req.user._id })
        if (!disLikeProduct) return res.status(500).json({ success: false, message: "DisLike Product Failed Server error" })

        res.status(200)
            .json({
                success: true,
                message: "DisLike Successfully"
            })
    } catch (error) {
        console.log("Error in handleDisLikeProduct", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed DisLike ",
                error: error.message
            })
    }
}


const getLikeList = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) return res.status(400).json({ success: false, message: "userId is reqried " })
        const likeList = await Like.find({ userId }).populate("productId")
        if (!likeList) return res.status(400).json({ success: false, message: "Nothing like any product" })

        res.status(200)
            .json({
                success: true,
                message: "Get Like List successfully",
                likeList
            })
    } catch (error) {
        console.log("Error in getLikeList", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed get Like list ",
                error: error.message
            })
    }
}

export { handleLikeProduct, handleDisLikeProduct, getLikeList };