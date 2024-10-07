import mongoose from "mongoose";
import {Video} from "../models/video.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken"
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";


const publishVideo = asyncHandler(async (req, res) => {
  const{title, description} = req.body;
 
  
    if([title, description].some((field)=> field?.trim() === "")) {
        throw new ApiError(400, "title and description are required")
    }
    // console.log(req.files)
    const videoLocalPath = req.files?.video[0]?.path
    // console.log(title);
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    
    if (!videoLocalPath) {
        throw new ApiError(400, "Video is required")
    }

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbanail is required")
    }

    //cloudinary upload
    const video = await uploadOnCloudinary(videoLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if (!video) {
        throw new ApiError(500, "Something went wrong while uploading on cloudinary")
    }
    if (!thumbnail) {
        throw new ApiError(500, "Something went wrong while uploading on cloudinary")
    }
    // console.log("------------------video------------------",video);
    // console.log("------------------thumbnail------------------",thumbnail);
    

    // const owner = await User.findById(req.user?._id);
    // console.log(owner);
    

    // create entry in db 

    const videoDB = await Video.create({
        title,
        description,
        videofile: video.url,
        thumbnail: thumbnail.url,
        duration: video.duration,
        owner: req.user?._id
    })

    // console.log(video);
    

    const uploadedVideo = await Video.findById(videoDB._id)


    if (!uploadedVideo) {
        throw new ApiError(500, "Something went wrong while uploading on DB")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            201,
            uploadedVideo,
            "Video uploaded successfully"
        )
    )
})

const getVideoById = asyncHandler(async (req,res) => {

    const {videoId} = req.params

    if (!videoId) {
        throw new ApiError(400, "Video id missing")
    }
    
    const video = await Video.findById(videoId) 

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    return req
    .status(200)
    .json(new ApiResponse(200, video , "fetched video by Id"))

})

const updateVideo = asyncHandler(async(req,res) =>{
    const {videoId} = req.params

    if (!videoId) {
        throw new ApiError(401, "Video Id is missing")
    }

    const video = await Video.findById(videoId)
    
    if (!video) {
        throw new ApiError(401, "Cannot fetch video by id")
    }

    const{title, description} = req.body
    const thumbnailLocalPath = req.file?.path

    if (!title && !description && !thumbnailLocalPath) {
        throw new ApiError(402, "Please provide at least one field: title, description, or thumbnail.")
    }


    if (title) {
        video.title = title
    }

    if (description) {
        video.description = description
    }


    if (thumbnailLocalPath) {
        const cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    }

})


export {
    publishVideo,
    getVideoById,
    updateVideo
    
}