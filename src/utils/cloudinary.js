import { v2 as cloudinary } from "cloudinary"
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View Credentials' below to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) =>{
    try {
        if(!localFilePath){
            return "File not found"
         }
         const response = await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
        //  console.log("File is uploaded successfully on cloudinary",response)
         fs.unlinkSync(localFilePath)
         return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove temporary file locally as the file upload operation got failed
        return "Error uploading"
    }
}

export default uploadOnCloudinary