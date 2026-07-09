import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import sharp from "sharp";

// ===================== CLOUDINARY CONFIG =====================
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

// ===================== MULTER CONFIG =====================
const tempDir = "./public/temp";
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, baseName + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

export const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, 
    fileFilter: fileFilter
});

// ===================== IMAGE OPTIMIZATION LOGIC =====================
const optimizeImage = async (filePath) => {
    let currentPath = filePath;
    let attempts = 0;
    const MAX_ATTEMPTS = 3;
    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

    while (attempts < MAX_ATTEMPTS) {
        const stats = fs.statSync(currentPath);
        
        if (stats.size <= MAX_SIZE_BYTES) {
            return currentPath;
        }

        attempts++;
        console.log(`📉 Compression Attempt ${attempts} for: ${path.basename(currentPath)}`);

        const compressedPath = currentPath.replace(/(\.[\w\d_-]+)$/i, `_comp_${attempts}.webp`);
        
        // Har attempt mein quality aur resolution kam karte jao
        const quality = 80 - (attempts * 20); 
        const width = 1500 - (attempts * 300);

        try {
            await sharp(currentPath)
                .resize({ width: width, withoutEnlargement: true })
                .webp({ quality: quality })
                .toFile(compressedPath);

            // Purani temporary file delete karein
            if (currentPath !== filePath) {
                fs.unlinkSync(currentPath);
            }

            currentPath = compressedPath;
        } catch (error) {
            throw new Error("Optimization failed: " + error.message);
        }
    }

    // Check final result after 3 attempts
    const finalStats = fs.statSync(currentPath);
    if (finalStats.size > MAX_SIZE_BYTES) {
        if (fs.existsSync(currentPath)) fs.unlinkSync(currentPath);
        throw new Error("Image could not be compressed under 5MB after 3 attempts.");
    }

    return currentPath;
};

// ===================== CLOUDINARY FUNCTIONS =====================

export const uploadOnCloudinary = async (localFilePath, folder = "raahi_products") => {
    try {
        if (!localFilePath || !fs.existsSync(localFilePath)) return null;

        // Optimization process
        const finalFilePath = await optimizeImage(localFilePath);

        const response = await cloudinary.uploader.upload(finalFilePath, {
            resource_type: "auto",
            folder: folder
        });

        // Cleanup
        if (fs.existsSync(finalFilePath)) fs.unlinkSync(finalFilePath);

        return response;
    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error.message);
        if (localFilePath && fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
        throw error; // Controller mein error catch karne ke liye throw karein
    }
};

export const uploadMultipleOnCloudinary = async (localFilePaths, folder = "raahi_products") => {
    const uploadPromises = localFilePaths.map(filePath => uploadOnCloudinary(filePath, folder));
    return await Promise.all(uploadPromises);
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        return false;
    }
};

export const deleteMultipleFromCloudinary = async (publicIds) => {
    const promises = publicIds.map(id => deleteFromCloudinary(id));
    return await Promise.all(promises);
};

export const getPublicIdFromUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('.')[0];
};

export { cloudinary };