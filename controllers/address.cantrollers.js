import Address from "../models/address.model.js";


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
export { addAddress, setDefaultAddress }