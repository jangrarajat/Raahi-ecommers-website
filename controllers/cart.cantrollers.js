import Cart from "../models/cartList.model.js";

// Add to Cart (Logic: Agar hai to +1, nahi to New)
const handleCartProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.user._id;

        if (!productId) return res.status(400).json({ success: false, message: "productId is required" });

        // Check karo agar product pehle se Cart mein hai
        const existingItem = await Cart.findOne({ productId, userId });

        if (existingItem) {
            // Agar pehle se hai, quantity +1 kar do
            existingItem.quantity += 1;
            await existingItem.save();
            
            return res.status(200).json({
                success: true,
                message: "Product quantity updated",
                cartItem: existingItem
            });
        }

        // Naya item create karo
        const cartProduct = await Cart.create({
            productId,
            userId,
            quantity: 1 
        });

        res.status(200).json({
            success: true,
            message: "Added to Cart Successfully",
            cartProduct
        });

    } catch (error) {
        console.log("Error in handleCartProduct", error.message);
        res.status(500).json({ success: false, message: "Failed to add to cart", error: error.message });
    }
};

// Cart Item Delete karna (Remove button ke liye)
const handleDisCartProduct = async (req, res) => {
    try {
        const { productId } = req.body;
        if (!productId) return res.status(400).json({ success: false, message: "productId required" });

        const deletedItem = await Cart.findOneAndDelete({ productId, userId: req.user._id });

        if (!deletedItem) return res.status(404).json({ success: false, message: "Product not found in cart" });

        res.status(200).json({
            success: true,
            message: "Removed from Cart Successfully"
        });
    } catch (error) {
        console.log("Error in handleDisCartProduct", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get Cart List
const getCartList = async (req, res) => {
    try {
        const userId = req.user._id;
        const cartList = await Cart.find({ userId }).populate("productId");

        // Frontend ko Total Price bhi calculate karke bhej sakte hain
        let totalPrice = 0;
        cartList.forEach(item => {
            if(item.productId) totalPrice += item.productId.price * item.quantity;
        });

        res.status(200).json({
            success: true,
            message: "Cart fetched successfully",
            cartList,
            totalPrice // Ye frontend par dikhane me kaam aayega
        });
    } catch (error) {
        console.log("Error in getCartList", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

export { handleCartProduct, handleDisCartProduct, getCartList };