import Order from "../models/order.model.js";
import Cart from "../models/cartList.model.js";

const placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId, paymentMethod } = req.body;

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Address and Payment Method required" });
        }

        // 1. User ka Poora Cart uthao
        const cartItems = await Cart.find({ userId }).populate("productId");

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // 2. Total Amount Calculate karo
        let totalAmount = 0;
        const orderItems = [];

        for (const item of cartItems) {
            if (!item.productId) continue;

            const itemTotal = item.productId.price * item.quantity;
            totalAmount += itemTotal;

            orderItems.push({
                productId: item.productId._id,
                quantity: item.quantity,
                price: item.productId.price
            });
        }

        // 3. Order Create karo
        const newOrder = await Order.create({
            userId,
            items: orderItems,
            addressId,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
            totalAmount,
            orderStatus: "pending"
        });

        // 4. Order lagne ke baad Cart ko POORA KHALI kar do
        await Cart.deleteMany({ userId });

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: newOrder._id
        });

    } catch (error) {
        console.log("Error in placeOrder:", error.message);
        res.status(500).json({ success: false, message: "Order Failed", error: error.message });
    }
};

// My Orders aur Admin wale functions (Pichle code se same hain)
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate("items.productId").populate("addressId").sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

const getAllOrdersAdmin = async (req, res) => {
    try {
        if (req.user.role !== "owner") return res.status(403).json({ message: "Access Denied" });
        const orders = await Order.find().populate("items.productId").populate("userId", "username email").populate("addressId").sort({ createdAt: -1 });
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        if (req.user.role !== "owner") return res.status(403).json({ message: "Access Denied" });
        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
        res.status(200).json({ success: true, message: "Status Updated", order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

const cancelledOdder = async (req, res) => {
    try {
        const userId = req.user._id; // Logged in user ki ID
        const { orderId } = req.body; // Frontend se Order ID aayegi

        // 1. Check karo ki Order ID aayi hai ya nahi
        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: "Order ID is required"
            });
        }

        // 2. Order dhundo jo User ID se match kare 
        // (Taaki user A galti se User B ka order cancel na kar de)
        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found or does not belong to you"
            });
        }

        // 3. Check karo ki Order ka status kya hai
        // Agar Shipped ya Delivered hai, toh Cancel mat karne do
        if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
            return res.status(400).json({
                success: false,
                message: "Order cannot be cancelled. It is already shipped or delivered."
            });
        }

        // 4. Agar order pehle se cancelled hai
        if (order.orderStatus === "cancelled") {
            return res.status(400).json({
                success: false,
                message: "Order is already cancelled."
            });
        }

        // 5. Status update karke Save karo
        order.orderStatus = "cancelled";
        await order.save();

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order // Updated order wapas bhej diya
        });

    } catch (error) {
        console.log("Error in cancelledOdder:", error.message);
        res.status(500).json({
            success: false,
            message: "Server Error: Could not cancel order",
            error: error.message
        });
    }
}


export { placeOrder, getMyOrders, getAllOrdersAdmin, updateOrderStatus, cancelledOdder };