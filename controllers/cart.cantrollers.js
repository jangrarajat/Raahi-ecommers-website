import Cart from "../models/cartList.model.js";
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

// --- ADD TO CART WITH VARIANT ---
export const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, color, size, quantity = 1 } = req.body;

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

        // Validate variant exists and has stock
        const variant = product.variants.find(v => v.color === color);
        if (!variant) {
            return res.status(400).json({ success: false, message: "Invalid color" });
        }

        const sizeObj = variant.sizes.find(s => s.size === size);
        if (!sizeObj) {
            return res.status(400).json({ success: false, message: "Invalid size for this color" });
        }

        if (sizeObj.stock < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `Only ${sizeObj.stock} items left in ${color} - ${size}` 
            });
        }

        // Get variant image
        const variantImage = getVariantImage(product, color, size);

        // Check if exact variant already in cart
        let existingCartItem = await Cart.findOne({
            userId,
            productId,
            color,
            size
        });

        if (existingCartItem) {
            // Update quantity
            const newQuantity = existingCartItem.quantity + quantity;
            if (newQuantity > sizeObj.stock) {
                return res.status(400).json({ 
                    success: false, 
                    message: `Cannot add more than ${sizeObj.stock} items` 
                });
            }
            existingCartItem.quantity = newQuantity;
            existingCartItem.variantImage = variantImage;
            await existingCartItem.save();
            
            const populated = await Cart.findById(existingCartItem._id).populate('productId');
            return res.status(200).json({
                success: true,
                message: "Cart updated successfully",
                cartItem: populated
            });
        }

        // Create new cart item with image
        const newCartItem = new Cart({
            userId,
            productId,
            color,
            size,
            quantity,
            variantImage
        });

        await newCartItem.save();
        const populated = await Cart.findById(newCartItem._id).populate('productId');

        res.status(201).json({
            success: true,
            message: "Product added to cart",
            cartItem: populated
        });

    } catch (error) {
        console.error("Error in addToCart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- REMOVE FROM CART (exact variant) ---
export const removeFromCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, color, size } = req.body;

        if (!productId || !color || !size) {
            return res.status(400).json({ 
                success: false, 
                message: "ProductId, color, and size are required" 
            });
        }

        const deletedItem = await Cart.findOneAndDelete({
            userId,
            productId,
            color,
            size
        });

        if (!deletedItem) {
            return res.status(404).json({ 
                success: false, 
                message: "Cart item not found for this variant" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Item removed from cart"
        });

    } catch (error) {
        console.error("Error in removeFromCart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- GET CART LIST ---
export const getCartList = async (req, res) => {
    try {
        const userId = req.user._id;
        const cartList = await Cart.find({ userId }).populate('productId');

        res.status(200).json({
            success: true,
            cartList
        });

    } catch (error) {
        console.error("Error in getCartList:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- UPDATE CART QUANTITY ---
export const updateCartQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, color, size, quantity } = req.body;

        if (!productId || !color || !size || !quantity) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        if (quantity < 1) {
            return res.status(400).json({ 
                success: false, 
                message: "Quantity must be at least 1" 
            });
        }

        // Validate stock
        const product = await Product.findById(productId);
        const variant = product.variants.find(v => v.color === color);
        const sizeObj = variant.sizes.find(s => s.size === size);
        
        if (sizeObj.stock < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: `Only ${sizeObj.stock} items available` 
            });
        }

        const updatedItem = await Cart.findOneAndUpdate(
            { userId, productId, color, size },
            { quantity },
            { new: true }
        ).populate('productId');

        if (!updatedItem) {
            return res.status(404).json({ 
                success: false, 
                message: "Cart item not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Quantity updated",
            cartItem: updatedItem
        });

    } catch (error) {
        console.error("Error in updateCartQuantity:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- CLEAR ENTIRE CART (NEW METHOD) ---
export const clearCart = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const result = await Cart.deleteMany({ userId });
        
        res.status(200).json({
            success: true,
            message: "Cart cleared successfully",
            deletedCount: result.deletedCount
        });
        
    } catch (error) {
        console.error("Error in clearCart:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};