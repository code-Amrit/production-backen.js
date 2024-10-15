import mongoose from "mongoose";
import {Video} from "../models/video.models.js";
import { deleteImageFromCloudinary, deleteVideoFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js";
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

    return res
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
        const cloudinaryThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

        if (!cloudinaryThumbnail) {
            throw new ApiError(500, "Something went wrong while uploading on cloudinary")
        }

        //delete old thumbnail
        
        if (video.thumbnail) {
            const parts = video.thumbnail.split("/");
            const thumbnailId = parts[parts.length - 1].split(".")[0];

            await deleteImageFromCloudinary(thumbnailId);
        }

        video.thumbnail = cloudinaryThumbnail.url;

    }

    // update database
    const updatedVideo = await video.save()

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            updatedVideo,
            "Video updated successfully"
        )
    )



})

const deleteVideo = asyncHandler(async (req,res) => {
    
    const {videoId} = req.params

    if (!videoId) {
        throw new ApiError(401, "Video Id is missing")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    const video_parts = video.videofile.split("/");
    const video_id = video_parts[video_parts.length - 1].split(".")[0];

    const thumbnail_parts = video.thumbnail.split("/");
    const thumbnail_id = thumbnail_parts[thumbnail_parts.length - 1].split(".")[0];


    //delete video from cloudinary
    await deleteVideoFromCloudinary(video_id)

    //delete thumbnail from cloudinary
    await deleteImageFromCloudinary(thumbnail_id)


    await Video.findByIdAndDelete(videoId);

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Video deleted successfully"
        )
    )

})  

const togglePublishStatus = asyncHandler(async (req,res) => {

    const {videoId} = req.params

    if (!videoId) {
        throw new ApiError(401, "Video Id is missing")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    video.isPublished = !video.isPublished

    // console.log(video.isPublished);
    

    await video.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            video,
            `Video publish status updated to ${video.isPublished ? 'published' : 'unpublished'}`
        )
    )

})

const getAllVideos = asyncHandler(async (req,res) => {
    const {
        page = 1,
        limit = 10,
        query = "",
        sortBy = "createdAt",
        sortType = "desc",
        userId,
      } = req.query;

      const pageNum = Math.max(1, parseInt(page));  // Ensure page is at least 1
      const limitNum = Math.max(1, parseInt(limit));  // Ensure limit is at least 1

      const matchStage = {
        $match: {
          $or: [
            {
              title: {
                $regex: query,
                $options: "i", // Case-insensitive search
              },
            },
          ],
        },
      };
    
      if (userId) {
        matchStage.$match.$and = [
          { owner: userId },  // Filter by userId if provided
        ];
      }
    
      const videos = await Video.aggregate([
        matchStage,
        {
          $lookup: {
            from: "users",
            localField: "owner",
            foreignField: "_id",
            as: "owner",
            pipeline: [
              {
                $project: {
                  fullname: 1,
                  username: 1,
                  avatar: 1,
                },
              },
            ],
          },
        },
        {
          $unwind: "$owner",
        },
        {
          $sort: {
            [sortBy]: sortType === "asc" ? 1 : -1,
          },
        },
        {
          $skip: (pageNum - 1) * limitNum,
        },
        {
          $limit: limitNum,
        },
      ]);
    
      return res.status(200).json(new ApiResponse(200, videos, "Results"));
    

})

export {
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
    
}