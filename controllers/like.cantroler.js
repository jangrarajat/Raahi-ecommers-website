import Like from "../models/likeList.model.js";

const handleLikeProduct = async (req, res) => {
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
};

const handleDisLikeProduct = async (req, res) => {
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
}


const getLikeList = async (req, res) => {
    const userId = req.user._id;
    const likeList = await Like.find({ userId }).populate("productId")
    
    res.status(200)
        .json({
            success: true,
            message: "Get Like List successfully",
            likeList
        })
}

export { handleLikeProduct, handleDisLikeProduct, getLikeList };