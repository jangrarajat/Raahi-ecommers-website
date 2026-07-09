import Like from "../models/likeList.model.js";
import Product from "../models/product.model.js";

// --- HELPER: Get variant image URL ---
const getVariantImage = (product, color, size) => {
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
        // Fallback to product image
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

// --- LIKE A PRODUCT VARIANT ---
export const handleLikeProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, color, size } = req.body;

        // Validate required fields
        if (!productId || !color || !size) {
            return res.status(400).json({ 
                success: false, 
                message: "ProductId, color, and size are required" 
            });
        }

        // Validate product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Validate variant exists
        const variant = product.variants.find(v => v.color === color);
        if (!variant) {
            return res.status(400).json({ success: false, message: "Invalid color" });
        }
        const sizeObj = variant.sizes.find(s => s.size === size);
        if (!sizeObj) {
            return res.status(400).json({ success: false, message: "Invalid size" });
        }

        // Check if already liked
        const existingLike = await Like.findOne({
            userId,
            productId,
            color,
            size
        });

        if (existingLike) {
            return res.status(400).json({ 
                success: false, 
                message: "Already liked this variant" 
            });
        }

        // Get variant image
        const variantImage = getVariantImage(product, color, size);

        const newLike = new Like({
            userId,
            productId,
            color,
            size,
            variantImage
        });

        await newLike.save();
        const populated = await Like.findById(newLike._id).populate('productId');

        res.status(201).json({
            success: true,
            message: "Product variant liked",
            like: populated
        });

    } catch (error) {
        console.error("Error in handleLikeProduct:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- DISLIKE A PRODUCT VARIANT ---
export const handleDisLikeProduct = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, color, size } = req.body;

        if (!productId || !color || !size) {
            return res.status(400).json({ 
                success: false, 
                message: "ProductId, color, and size are required" 
            });
        }

        const deletedLike = await Like.findOneAndDelete({
            userId,
            productId,
            color,
            size
        });

        if (!deletedLike) {
            return res.status(404).json({ 
                success: false, 
                message: "Like not found for this variant" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Product variant unliked"
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