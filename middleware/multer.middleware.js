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
    console.log("✅ Temp directory created:", tempDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        cb(null, file.fieldname + '-' + baseName + '-' + uniqueSuffix + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (JPEG, PNG, GIF, WEBP)'), false);
    }
};

// ===================== MULTER INSTANCE =====================
export const upload = multer({ 
    storage: storage,
    limits: { 
        fileSize: 20 * 1024 * 1024 // 20MB per file
    },
    fileFilter: fileFilter
});

// ===================== AGGRESSIVE IMAGE COMPRESSION =====================
const compressImage = async (filePath, maxWidth = 1200, quality = 70) => {
    try {
        const ext = path.extname(filePath).toLowerCase();
        const outputPath = filePath.replace(ext, `-compressed${ext}`);
        
        let image = sharp(filePath);
        const metadata = await image.metadata();
        
        let width = metadata.width;
        if (width > maxWidth) {
            width = maxWidth;
        }
        
        let currentQuality = quality;
        let compressedPath = outputPath;
        
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                let processedImage = image.clone().resize(width, null, {
                    fit: 'inside',
                    withoutEnlargement: true
                });
                
                if (ext === '.png') {
                    await processedImage.png({ 
                        quality: currentQuality, 
                        compressionLevel: 9,
                        palette: true
                    }).toFile(compressedPath);
                } else if (ext === '.webp') {
                    await processedImage.webp({ 
                        quality: currentQuality 
                    }).toFile(compressedPath);
                } else {
                    await processedImage.jpeg({ 
                        quality: currentQuality, 
                        mozjpeg: true,
                        progressive: true
                    }).toFile(compressedPath);
                }
                
                const stats = fs.statSync(compressedPath);
                const sizeInMB = stats.size / (1024 * 1024);
                
                if (sizeInMB <= 4.5) {
                    console.log(`✅ Compression successful: ${sizeInMB.toFixed(2)}MB`);
                    return compressedPath;
                }
                
                currentQuality = Math.max(30, currentQuality - 20);
                width = Math.max(600, width - 200);
                
            } catch (err) {
                console.error(`❌ Compression attempt ${attempt + 1} failed:`, err.message);
                continue;
            }
        }
        
        // Final attempt with very low quality
        try {
            await sharp(filePath)
                .resize(600, null, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 30, mozjpeg: true, progressive: true })
                .toFile(compressedPath);
                
            const stats = fs.statSync(compressedPath);
            const sizeInMB = stats.size / (1024 * 1024);
            console.log(`✅ Final compression: ${sizeInMB.toFixed(2)}MB`);
            return compressedPath;
        } catch (err) {
            console.error("❌ Final compression failed:", err.message);
            return filePath;
        }
        
    } catch (error) {
        console.error("❌ Compression error:", error.message);
        return filePath;
    }
};

// ===================== CLOUDINARY UPLOAD =====================
export const uploadOnCloudinary = async (localFilePath, folder = "raahi_products", retries = 2) => {
    let currentPath = localFilePath;
    let lastError = null;
    
    try {
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            console.error("❌ File not found:", localFilePath);
            return null;
        }

        const stats = fs.statSync(localFilePath);
        let fileSizeInMB = stats.size / (1024 * 1024);
        console.log(`📊 Original file size: ${fileSizeInMB.toFixed(2)}MB`);

        // Compress if file is large
        if (fileSizeInMB > 1) {
            try {
                const compressedPath = await compressImage(localFilePath);
                if (compressedPath !== localFilePath) {
                    currentPath = compressedPath;
                    const newStats = fs.statSync(currentPath);
                    fileSizeInMB = newStats.size / (1024 * 1024);
                    console.log(`📊 Compressed file size: ${fileSizeInMB.toFixed(2)}MB`);
                }
            } catch (compressError) {
                console.error("❌ Compression failed:", compressError.message);
                currentPath = localFilePath;
            }
        }

        const finalStats = fs.statSync(currentPath);
        const finalSizeInMB = finalStats.size / (1024 * 1024);
        
        if (finalSizeInMB > 9) {
            console.error(`❌ File too large: ${finalSizeInMB.toFixed(2)}MB`);
            // Try super compression
            try {
                const ext = path.extname(currentPath);
                const superCompressedPath = currentPath.replace(ext, `-super${ext}`);
                await sharp(currentPath)
                    .resize(800, null, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 40, mozjpeg: true })
                    .toFile(superCompressedPath);
                    
                const superStats = fs.statSync(superCompressedPath);
                const superSizeInMB = superStats.size / (1024 * 1024);
                console.log(`📊 Super compressed file size: ${superSizeInMB.toFixed(2)}MB`);
                
                if (superSizeInMB < 9) {
                    currentPath = superCompressedPath;
                } else {
                    throw new Error(`Image too large: ${superSizeInMB.toFixed(2)}MB`);
                }
            } catch (finalError) {
                console.error("❌ Final compression failed:", finalError.message);
                if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
                if (currentPath !== localFilePath && fs.existsSync(currentPath)) fs.unlinkSync(currentPath);
                return null;
            }
        }

        console.log("📤 Uploading to Cloudinary...");
        
        // Upload with retry logic
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await cloudinary.uploader.upload(currentPath, {
                    resource_type: "auto",
                    folder: folder,
                    timeout: 60000,
                });
                
                console.log("✅ Cloudinary Upload Success:", response.secure_url);
                
                // Clean up local files
                if (fs.existsSync(localFilePath)) {
                    fs.unlinkSync(localFilePath);
                }
                if (currentPath !== localFilePath && fs.existsSync(currentPath)) {
                    fs.unlinkSync(currentPath);
                }
                
                return response;
                
            } catch (uploadError) {
                lastError = uploadError;
                console.error(`❌ Upload attempt ${attempt}/${retries} failed:`, uploadError.message);
                
                if (attempt < retries) {
                    const waitTime = attempt * 1500;
                    console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }
            }
        }
        
        throw lastError || new Error("Upload failed after multiple attempts");
        
    } catch (error) {
        console.error("❌ Cloudinary Upload Error:", error.message);
        
        // Clean up local files on error
        if (fs.existsSync(localFilePath)) {
            try {
                fs.unlinkSync(localFilePath);
            } catch (unlinkError) {
                console.error("⚠️ Error deleting local file:", unlinkError.message);
            }
        }
        if (currentPath !== localFilePath && fs.existsSync(currentPath)) {
            try {
                fs.unlinkSync(currentPath);
            } catch (unlinkError) {
                console.error("⚠️ Error deleting compressed file:", unlinkError.message);
            }
        }
        
        return null;
    }
};

export const uploadMultipleOnCloudinary = async (localFilePaths, folder = "raahi_products") => {
    const results = [];
    for (const filePath of localFilePaths) {
        const result = await uploadOnCloudinary(filePath, folder);
        results.push(result);
    }
    return results;
};

export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) {
            console.error("❌ No public ID provided");
            return false;
        }
        const result = await cloudinary.uploader.destroy(publicId);
        console.log(`🗑️ Delete result for ${publicId}:`, result.result);
        return result.result === 'ok';
    } catch (error) {
        console.error("❌ Delete error:", error);
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