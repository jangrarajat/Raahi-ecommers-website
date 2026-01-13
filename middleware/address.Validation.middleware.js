const validateAddress = (req, res, next) => {
    // 1. Data Extract karo
    const { 
        fullName, 
        phone, 
        altPhone, 
        pincode, 
        state, 
        city, 
        houseNo, 
        area, 
        type 
    } = req.body;

    // 2. Required Fields Check (Landmark aur altPhone optional hain)
    if (!fullName || !phone || !pincode || !state || !city || !houseNo || !area || !type) {
        return res.status(400).json({ 
            success: false, 
            message: "Missing Required Fields! Please fill Name, Phone, Pincode, House No, Area, City, State & Type." 
        });
    }

    // 3. Validations (Regex)
    const phoneRegex = /^[0-9]{10}$/; // Sirf 10 digit number allowed
    const pincodeRegex = /^[0-9]{6}$/; // Sirf 6 digit number allowed

    // Phone Check
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Phone Number! It must be exactly 10 digits." 
        });
    }

    // Alternate Phone Check (Sirf tab check karein agar user ne bhara ho)
    if (altPhone && !phoneRegex.test(altPhone)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Alternate Phone Number!" 
        });
    }

    // Pincode Check
    if (!pincodeRegex.test(pincode)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Pincode! It must be exactly 6 digits." 
        });
    }

    // Type Check (Spelling exact honi chahiye)
    const allowedTypes = ["Home", "Work", "Other"];
    if (!allowedTypes.includes(type)) {
        return res.status(400).json({ 
            success: false, 
            message: "Invalid Address Type! Use 'Home', 'Work', or 'Other'." 
        });
    }

    // Sab sahi hai toh aage badho
    next();
};

export { validateAddress };