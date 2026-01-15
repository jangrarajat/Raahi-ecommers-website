import Order from "../models/order.model.js";
import Cart from "../models/cartList.model.js";
import Product from "../models/product.model.js"; 

// =============================================
// 1. PLACE ORDER (Handles Stock Deduction)
// =============================================
const placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId, paymentMethod, productId, singleQuantity, size, color } = req.body;

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Address and Payment Method required" });
        }

        let orderItems = [];
        let totalAmount = 0;
        let isBuyNow = false;

        // --- HELPER TO CHECK & DEDUCT STOCK ---
        const checkAndDeductStock = async (prodId, qty, pSize, pColor) => {
            const product = await Product.findById(prodId);
            if (!product) throw new Error(`Product not found`);

            // Find specific variant
            const variantIndex = product.variants.findIndex(
                v => v.size === pSize && v.color === pColor
            );

            if (variantIndex === -1) {
                // Compatibility for old products without variants
                if (product.variants.length === 0) return product; 
                throw new Error(`${product.name} (${pSize}/${pColor}) is unavailable.`);
            }

            if (product.variants[variantIndex].stock < qty) {
                throw new Error(`Insufficient stock for ${product.name} (${pSize}/${pColor}). Available: ${product.variants[variantIndex].stock}`);
            }

            // Deduct Stock
            product.variants[variantIndex].stock -= qty;
            await product.save();
            return product;
        };

        // --- SCENARIO A: BUY NOW ---
        if (productId) {
            isBuyNow = true;
            const quantity = singleQuantity || 1; 
            const reqSize = size || "N/A";
            const reqColor = color || "N/A";

            // Check & Deduct
            const product = await checkAndDeductStock(productId, quantity, reqSize, reqColor);

            orderItems.push({
                productId: product._id,
                quantity: quantity,
                price: product.price,
                size: reqSize,
                color: reqColor
            });

            totalAmount = product.price * quantity;
        } 
        
        // --- SCENARIO B: CART CHECKOUT ---
        else {
            const cartItems = await Cart.find({ userId }).populate("productId");
            if (!cartItems || cartItems.length === 0) {
                return res.status(400).json({ success: false, message: "Cart is empty" });
            }

            for (const item of cartItems) {
                if (!item.productId) continue;

                const reqSize = item.size || "N/A";
                const reqColor = item.color || "N/A";

                // Check & Deduct for each item
                try {
                    await checkAndDeductStock(item.productId._id, item.quantity, reqSize, reqColor);
                } catch (err) {
                    return res.status(400).json({ success: false, message: err.message });
                }

                totalAmount += (item.productId.price * item.quantity);

                orderItems.push({
                    productId: item.productId._id,
                    quantity: item.quantity,
                    price: item.productId.price,
                    size: reqSize, 
                    color: reqColor
                });
            }
        }

        // --- CREATE ORDER ---
        const newOrder = await Order.create({
            userId,
            items: orderItems,
            addressId,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
            totalAmount,
            orderStatus: "pending"
        });

        if (!isBuyNow) {
            await Cart.deleteMany({ userId });
        }

        res.status(201).json({
            success: true,
            message: "Order Placed Successfully",
            orderId: newOrder._id
        });

    } catch (error) {
        console.log("Error in placeOrder:", error.message);
        res.status(500).json({ success: false, message: error.message || "Order Failed" });
    }
};

// =============================================
// 2. GET MY ORDERS
// =============================================
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate("items.productId")
            .populate("addressId")
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// =============================================
// 3. GET ALL ORDERS (Admin)
// =============================================
const getAllOrdersAdmin = async (req, res) => {
    try {
        if (req.user.role !== "owner") return res.status(403).json({ message: "Access Denied" });
        
        const orders = await Order.find()
            .populate("items.productId")
            .populate("userId", "username email")
            .populate("addressId")
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// =============================================
// 4. UPDATE ORDER STATUS (Admin)
// =============================================
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (req.user.role !== "owner") return res.status(403).json({ message: "Access Denied" });
        
        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
        if(!order) return res.status(404).json({ success: false, message: "Order not found" });

        res.status(200).json({ success: true, message: "Status Updated", order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

// =============================================
// 5. CANCEL ORDER (User - Restock Logic Optional)
// =============================================
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderId } = req.body;

        const order = await Order.findOne({ _id: orderId, userId: userId });
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
            return res.status(400).json({ success: false, message: "Cannot cancel shipped orders." });
        }
        if (order.orderStatus === "cancelled") {
            return res.status(400).json({ success: false, message: "Already cancelled." });
        }

        // OPTIONAL: Restore Stock Logic Here if needed
        // For now, just marking as cancelled
        
        order.orderStatus = "cancelled";
        order.paymentStatus = "cancelled";
        await order.save(); 

        res.status(200).json({ success: true, message: "Order cancelled successfully", order });

    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

export { placeOrder, getMyOrders, getAllOrdersAdmin, updateOrderStatus, cancelOrder };