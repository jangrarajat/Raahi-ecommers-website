import Order from "../models/order.model.js";
import Cart from "../models/cartList.model.js";
import Product from "../models/product.model.js"; 

// =============================================
// 1. PLACE ORDER (Handles 'Buy Now' & 'Cart')
// =============================================
const placeOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Frontend se data receive karo
        const { addressId, paymentMethod, productId, singleQuantity } = req.body;

        if (!addressId || !paymentMethod) {
            return res.status(400).json({ success: false, message: "Address and Payment Method required" });
        }

        let orderItems = [];
        let totalAmount = 0;
        let isBuyNow = false; // Flag to identify order type

        // --- SCENARIO A: BUY NOW (Single Product) ---
        if (productId) {
            isBuyNow = true;
            const quantity = singleQuantity || 1; 

            // Price DB se fetch karte hain (Security ke liye)
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ success: false, message: "Product not found" });
            }

            orderItems.push({
                productId: product._id,
                quantity: quantity,
                price: product.price
            });

            totalAmount = product.price * quantity;
        } 
        
        // --- SCENARIO B: CART CHECKOUT (Multiple Products) ---
        else {
            const cartItems = await Cart.find({ userId }).populate("productId");

            if (!cartItems || cartItems.length === 0) {
                return res.status(400).json({ success: false, message: "Cart is empty" });
            }

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
        }

        // --- CREATE ORDER IN DATABASE ---
        const newOrder = await Order.create({
            userId,
            items: orderItems,
            addressId,
            paymentMethod,
            paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
            totalAmount,
            orderStatus: "pending"
        });

        // Agar 'Buy Now' nahi tha (yani Cart se khareeda), tabhi Cart khali karo
        if (!isBuyNow) {
            await Cart.deleteMany({ userId });
        }

        res.status(201).json({
            success: true,
            message: isBuyNow ? "Single Order Placed" : "Order Placed Successfully",
            orderId: newOrder._id
        });

    } catch (error) {
        console.log("Error in placeOrder:", error.message);
        res.status(500).json({ success: false, message: "Order Failed", error: error.message });
    }
};

// =============================================
// 2. GET MY ORDERS (User)
// =============================================
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id })
            .populate("items.productId") // Product details dikhane ke liye
            .populate("addressId")       // Address details ke liye
            .sort({ createdAt: -1 });    // Latest order sabse upar
            
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// =============================================
// 3. GET ALL ORDERS (Admin/Owner)
// =============================================
const getAllOrdersAdmin = async (req, res) => {
    try {
        // Sirf Owner hi sabke orders dekh sake
        if (req.user.role !== "owner") return res.status(403).json({ message: "Access Denied" });
        
        const orders = await Order.find()
            .populate("items.productId")
            .populate("userId", "username email") // User ka naam aur email bhi chahiye admin ko
            .populate("addressId")
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};

// =============================================
// 4. UPDATE ORDER STATUS (Admin/Owner)
// =============================================
const updateOrderStatus = async (req, res) => {
    try {
        const { orderId, status } = req.body;
        
        if (req.user.role !== "owner") return res.status(403).json({ message: "Access Denied" });
        
        // Status update kar rahe hain (Pending -> Shipped -> Delivered)
        const order = await Order.findByIdAndUpdate(orderId, { orderStatus: status }, { new: true });
        
        if(!order) return res.status(404).json({ success: false, message: "Order not found" });

        res.status(200).json({ success: true, message: "Status Updated", order });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating status" });
    }
};

// =============================================
// 5. CANCEL ORDER (User Side - NO DELETE)
// =============================================
const cancelOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ success: false, message: "Order ID is required" });
        }

        // Order dhoondo (Delete nahi karna)
        const order = await Order.findOne({ _id: orderId, userId: userId });

        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        // Validation: Shipped order cancel nahi ho sakta
        if (order.orderStatus === "shipped" || order.orderStatus === "delivered") {
            return res.status(400).json({ success: false, message: "Cannot cancel order because it is already shipped/delivered." });
        }

        // Validation: Already cancelled
        if (order.orderStatus === "cancelled") {
            return res.status(400).json({ success: false, message: "Order is already cancelled." });
        }

        // Status change karo "cancelled"
        order.orderStatus = "cancelled";
        order.paymentStatus = "cancelled";
        await order.save(); // Save changes to DB

        res.status(200).json({
            success: true,
            message: "Order cancelled successfully",
            order
        });

    } catch (error) {
        console.log("Error in cancelOrder:", error.message);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
}

export { 
    placeOrder, 
    getMyOrders, 
    getAllOrdersAdmin, 
    updateOrderStatus, 
    cancelOrder // Note: Maine spelling 'cancelledOdder' se 'cancelOrder' kar di hai
};