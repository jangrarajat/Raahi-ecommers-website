import Like from "../models/likeList.model.js";
import Product from "../models/product.model.js";

// --- HELPER: Get variant image URL (only color) ---
const getVariantImage = (product, color) => {
    try {
        const variant = product.variants?.find(v => v.color === color);
        if (variant?.images?.length > 0) {
            const img = variant.images[0];
            if (typeof img === 'object') {
                return (img.url || img.secure_url || "").replace("http://", "https://");
            }
            if (typeof img === 'string') {
                return img.replace("http://", "https://");
            }
        }
        if (product.images?.length > 0) {
            const img = product.images[0];
            if (typeof img === 'object') {
                return (img.url || img.secure_url || "").replace("http://", "https://");
            }
            if (typeof img === 'string') {
                return img.replace("http://", "https://");
            }
        }
        return "https://via.placeholder.com/300?text=No+Image";
    } catch (error) {
        return "https://via.placeholder.com/300?text=Error";
    }
};

// --- ✅ LIKE - ONLY COLOR (size ignore) ---
export const handleLikeProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, color } = req.body;

        if (!productId) {
            return res.status(400).json({ 
                success: false, 
                message: "ProductId is required" 
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // ✅ Validate color if provided
        if (color) {
            const variant = product.variants.find(v => v.color === color);
            if (!variant) {
                return res.status(400).json({ success: false, message: "Invalid color" });
            }
        }

        // ✅ Check if already liked (only productId + color)
        const existingLike = await Like.findOne({
            userId,
            productId,
            color: color || null
        });

        if (existingLike) {
            return res.status(400).json({ 
                success: false, 
                message: "Already liked this color" 
            });
        }

        const variantImage = color ? getVariantImage(product, color) : null;

        const newLike = new Like({
            userId,
            productId,
            color: color || null,
            variantImage
        });

        await newLike.save();
        const populated = await Like.findById(newLike._id).populate('productId');

        res.status(201).json({
            success: true,
            message: "Product liked",
            like: populated
        });

    } catch (error) {
        console.error("Error in handleLikeProduct:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- ✅ DISLIKE - ONLY COLOR (size ignore) ---
export const handleDisLikeProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, color } = req.body;

        if (!productId) {
            return res.status(400).json({ 
                success: false, 
                message: "ProductId is required" 
            });
        }

        const deletedLike = await Like.findOneAndDelete({
            userId,
            productId,
            color: color || null
        });

        if (!deletedLike) {
            return res.status(404).json({ 
                success: false, 
                message: "Like not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Product unliked"
        });

    } catch (error) {
        console.error("Error in handleDisLikeProduct:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET LIKE LIST ---
export const getLikeList = async (req, res) => {
    try {
        const userId = req.user._id;
        const likeList = await Like.find({ userId }).populate('productId');

        res.status(200).json({
            success: true,
            likeList
        });

    } catch (error) {
        console.error("Error in getLikeList:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};