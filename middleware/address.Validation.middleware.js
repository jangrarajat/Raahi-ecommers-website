import Address from "../models/address.model.js";
import ServiceArea from "../models/serviceArea.model.js";
import { otpSender } from "../utils/sms.otpSender.js";


export const validateAddress = async (req, res, next) => {

    try {
        const { name, phone, pincode, state, district, city, landmark } = req.body;




        // 1. Required Fields
        if (!name || !phone || !pincode || !state || !district || !city || !landmark) {
            return res.status(400).json({
                success: false,
                message: "All address fields are required"
            });
        }

        // check same address exist OR not
        const existAddress = await Address.findOne({
            userId: req.user._id,
            name,
            phone,
            pincode,
            state,
            district,
            city,
            landmark

        });

  



        if (existAddress) {
            return res.status(400).json({
                success: false,
                message: "This address already exists"
            });
        }

        // 2. Phone validation
        if (!/^[0-9]{10}$/.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Phone number must be 10 digits"
            });
        }

        // 3. Pincode format
        if (!/^[0-9]{6}$/.test(pincode)) {
            return res.status(400).json({
                success: false,
                message: "Invalid pincode format"
            });
        }

        // 4. Check service area in DB
        const area = await ServiceArea.findOne({ pincode });

        if (!area) {
            return res.status(400).json({
                success: false,
                message: "We don't deliver to this pincode"
            });
        }

        // 5. Check delivery available?
        if (area.DeliveryAvlabelStatus === false) {
            return res.status(400).json({
                success: false,
                message: "Delivery currently unavailable for this pincode"
            });
        }

        next();

    } catch (error) {
        console.log("Address Validation Error:", error.message);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
