import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

 // Configuration
 cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY , 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async (localFilePath)=> {

    try {
        
        if (!localFilePath) return null;
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: 'auto'
        })
        // file has been uploaded successfully
        // console.log("file uploaded on cloudinary",response.url);
        // console.log("file uploaded on cloudinary",response);
        fs.unlinkSync(localFilePath) //delete from local
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath)  //remove the locally saved temporary file as the upload operation got failed 
        return null;
    }

}

const deleteImageFromCloudinary = async (publicId) => {
    try {

        if (!publicId) return null;

        const response = await cloudinary.uploader
                            .destroy(publicId)
                            .catch((err)=> console.log("Thumbnail deletion failed :",err))
                            
                return response
    }catch(error){
            console.log("Error in deleting Thumbnail",error);
            
            return null;
    }
}

const deleteVideoFromCloudinary = async (publicId) => {
    try {
        
        if (!publicId) return null;

        const response = await cloudinary.uploader
                            .destroy(publicId, {resource_type: 'video'})
                            .catch((err)=> console.log("Video deletion failed :",err))
                            
                            console.log("Video deleted from cloudinary",response);
                            return response;

    } catch (error) {
        console.log("Error in deleting Video",error);        
    }
}

export {
    uploadOnCloudinary,
    deleteImageFromCloudinary,
    deleteVideoFromCloudinary
}