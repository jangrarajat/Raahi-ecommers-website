import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJwt } from "../middleware/auth.jwt.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../middleware/multer.middleware.js";
import fs from "fs";

const route = Router();

// Single image upload route - Instant upload on selection
route.post('/upload-single-image', verifyJwt, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "No image file provided" 
            });
        }

        console.log("📤 Uploading single image:", req.file.originalname);
        
        const result = await uploadOnCloudinary(req.file.path);
        
        if (!result) {
            return res.status(500).json({
                success: false,
                message: "Failed to upload image to Cloudinary"
            });
        }

        // Delete the local file after upload
        if (req.file.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log("🗑️ Local file deleted:", req.file.path);
        }

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                public_id: result.public_id,
                url: result.secure_url
            }
        });

    } catch (error) {
        console.error("❌ Upload error:", error);
        
        // Clean up local file on error
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (unlinkError) {
                console.error("⚠️ Error deleting local file:", unlinkError.message);
            }
        }
        
        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload image"
        });
    }
});

// Delete image from Cloudinary
route.post('/delete-image', verifyJwt, async (req, res) => {
    try {
        const { public_id } = req.body;
        
        if (!public_id) {
            return res.status(400).json({
                success: false,
                message: "Public ID is required"
            });
        }

        console.log("🗑️ Deleting image from Cloudinary:", public_id);
        
        const result = await deleteFromCloudinary(public_id);

        if (result) {
            res.status(200).json({
                success: true,
                message: "Image deleted successfully",
                data: { public_id }
            });
        } else {
            res.status(500).json({
                success: false,
                message: "Failed to delete image from Cloudinary"
            });
        }

    } catch (error) {
        console.error("❌ Delete error:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to delete image"
        });
    }
});

export default route;