import Address from "../models/address.model.js";
import { otpSender } from "../utils/sms.otpSender.js";



const addAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const data = req.body;

        // make first address default
        const alreadyAddress = await Address.findOne({ userId });

        if (!alreadyAddress) {
            data.isDefault = true;
        }

        const newAddress = await Address.create({
            ...data,
            userId
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

const setDefaultAddress = async (req, res) => {
    try {
        const { addressId } = req.body
        const user = req.user._id
        // Step 1: Sab addresses ko default=false karo

        await Address.updateMany(
            { userId: user },
            { $set: { isDefault: false } }
        );

        // Step 2: Jo user ne choose kiya usko default=true karo
        await Address.findByIdAndUpdate(
            addressId,
            { isDefault: true }
        );

        res.status(200)
            .json({
                success: true,
                message: "setDefaultAddress successfull"
            })
    } catch (error) {
        console.log(" Error: in setDefaultAddress", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const deleteAddress = async (req, res) => {
    try {
        const { addressId } = req.body

        if (addressId === undefined) return res.status(400).json({ success: false, message: "addressId field are requried" })

        const deleteResponse = await Address.findByIdAndDelete(addressId)
        console.log(deleteResponse)

        if (!deleteResponse) return res.status(400).json({ success: false, message: "Address delete failed" })


        res.status(200)
            .json({
                success: true,
                message: "deleteAddress successfull"
            })
    } catch (error) {
        console.log(" Error: in deleteAddress", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}


const getAllAddress = async (req, res) => {
    try {
        const userId = req.user._id;
        const findAddres = await Address.find({ userId: userId })
        if (findAddres) return res.status(400).json({ success: false, message: "Addres not found" })

        res.status(200)
            .json({
                success: true,
                message: "get all address successfull",
                findAddres
            })
    } catch (error) {
        console.log(" Error: in getAllAddress", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

const sendOtpVerifyPhoneNumber = async (req, res) => {
    try {

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
        const msg = `Your Address verification code is: ${otp}
         Otp expire in 5 minut`
 
        const number = process.env.MY_NUMBER;
        await otpSender({ num: number, msg: msg })

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully"

        });

    } catch (error) {
        console.error("❌ Error in sendOtpVerifyPhoneNumber:", error.message); // Error message print karein
        return res.status(500).json({
            success: false,
            message: "Server Error: SMS nahi gaya",
            error: error.message
        });
    }
}

export { addAddress, setDefaultAddress, deleteAddress, getAllAddress, sendOtpVerifyPhoneNumber }