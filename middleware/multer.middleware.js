
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
        console.log("Error in  uploadOnCloudinary", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed uplaod image on cloud",
                error: error.message
            })
    }
}

const deleteImageOnCloudinary = async (public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id)
        if (!result) return result.status(200).json({ success: false, message: "image destroy failed" })
        console.log(result)
        return result
    } catch (error) {
        console.log("Error in  deleteImageOnCloudinary ", error.message)
        res.status(500)
            .json({
                success: false,
                message: "Failed Delete image on Cloud",
                error: error.message
            })
    }
}

export { uploadOnCloudinary, deleteImageOnCloudinary }
