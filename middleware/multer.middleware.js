import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Zaroori: Project ke root folder mein 'public' aur uske andar 'temp' folder banayein
        cb(null, "./public/temp"); 
    },
    filename: function (req, file, cb) {
        // File ka naam unique rakhne ke liye time aur random number jodte hain
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 } // Max size: 5MB per file
});



import { v2 as cloudinary } from "cloudinary";
import fs from "fs"; // Node.js File System

// Cloudinary Config (Make sure .env mein ye values hon)
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // 1. Upload file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: "raahi_products" // Cloudinary folder name
        });

        // 2. Upload success -> Delete local file
        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath);
        }
        
        return response;

    } catch (error) {
        // Upload Fail -> Delete local file to keep server clean
        if(fs.existsSync(localFilePath)){
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

// Image Delete karne ke liye (Jab product delete ho)
const deleteFromCloudinary = async (public_id) => {
    try {
        if (!public_id) return null;
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.log("Error deleting from Cloudinary", error);
    }
};

export { uploadOnCloudinary, deleteFromCloudinary };