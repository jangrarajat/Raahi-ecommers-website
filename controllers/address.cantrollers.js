import Address from "../models/address.model.js";

// ==========================================
// 1. ADD NEW ADDRESS (With Duplicate Check)
// ==========================================
const addAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Naye model ke saare fields extract kar rahe hain
        const { 
            fullName, phone, altPhone, 
            pincode, state, city, 
            houseNo, area, landmark, 
            type // 'Home' or 'Work'
        } = req.body;

        // 1. Basic Validation (Middleware bhi karega, par ye safety hai)
        if (!fullName || !phone || !pincode || !state || !city || !houseNo || !area || !type) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing required fields. Please fill all details." 
            });
        }

        // 2. DUPLICATE CHECK LOGIC
        // Check karo agar same address pehle se active hai (deleted nahi hai)
        const duplicateAddress = await Address.findOne({
            userId: userId,
            pincode: pincode,
            houseNo: houseNo,
            area: area,
            city: city,
            isDeleted: false 
        });

        if (duplicateAddress) {
            return res.status(400).json({ 
                success: false, 
                message: "This address already exists in your list!" 
            });
        }

        // 3. Default Address Logic
        // Agar user ka ye pehla address hai, toh automatically default ban jayega
        const addressCount = await Address.countDocuments({ userId, isDeleted: false });
        const isDefault = addressCount === 0;

        // 4. Save to Database
        const newAddress = await Address.create({
            userId,
            fullName, phone, altPhone,
            pincode, state, city,
            houseNo, area, landmark,
            type,
            isDefault
        });

        res.status(201).json({
            success: true,
            message: "Address added successfully",
            address: newAddress
        });

    } catch (error) {
        console.log("Add Address Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 2. SET DEFAULT ADDRESS
// ==========================================
const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.body;
        const userId = req.user._id;

        if (!addressId) return res.status(400).json({ success: false, message: "Address ID required" });

        // Step 1: User ke baaki saare addresses ko 'isDefault: false' kar do
        await Address.updateMany(
            { userId: userId },
            { $set: { isDefault: false } }
        );

        // Step 2: Selected address ko 'isDefault: true' kar do
        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            { isDefault: true },
            { new: true } // Return updated doc
        );

        if (!updatedAddress) {
            return res.status(404).json({ success: false, message: "Address not found" });
        }

        res.status(200).json({
            success: true,
            message: "Default address updated successfully",
            address: updatedAddress
        });

    } catch (error) {
        console.log("Set Default Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 3. DELETE ADDRESS (Soft Delete)
// ==========================================
const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.body;

        if (!addressId) return res.status(400).json({ success: false, message: "Address ID required" });

        // Hum permanently delete nahi karenge, bas 'isDeleted' flag true karenge
        const deleteResponse = await Address.findByIdAndUpdate(
            addressId,
            { isDeleted: true },
            { new: true }
        );

        if (!deleteResponse) return res.status(404).json({ success: false, message: "Address not found" });

        res.status(200).json({
            success: true,
            message: "Address removed successfully"
        });

    } catch (error) {
        console.log("Delete Address Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// ==========================================
// 4. GET ALL ADDRESSES
// ==========================================
const getAllAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Sirf wo addresses laao jo delete nahi hue hain
        // 'sort' se naya address sabse upar dikhega
        const addresses = await Address.find({ userId: userId, isDeleted: false })
                                       .sort({ createdAt: -1 });

        // Note: Empty array aana normal hai agar koi address nahi hai, error nahi
        res.status(200).json({
            success: true,
            message: "Addresses fetched successfully",
            addresses // Array wapis bhejo
        });

    } catch (error) {
        console.log("Get All Address Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export { addAddress, setDefaultAddress, deleteAddress, getAllAddress };