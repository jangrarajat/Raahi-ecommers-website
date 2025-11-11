
import { v2 as cloudinary } from 'cloudinary'
import fs from "fs";




import multer from "multer";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "./public/temp"),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

export const upload = multer({ storage });



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});






const uploadOnCloudinary = async (localFilePath) => {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, { resource_type: 'auto' })
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return result;
    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        throw error
    }
}

const deleteImageOnCloudinary = async (public_id) => {
    const result = await cloudinary.uploader.destroy(public_id)
    if (!result) return result.status(200).json({ success: false, message: "image destroy failed" })
    console.log(result)
    return result
}

export { uploadOnCloudinary, deleteImageOnCloudinary }
