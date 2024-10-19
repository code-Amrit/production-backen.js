import mongoose from "mongoose"
import {Video} from "../models/video.models.js"
import {Subscription} from "../models/subscription.models.js"
import {Like} from "../models/like.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    const totalVideos = await Video.countDocuments({
        owner: new mongoose.Types.ObjectId(req.user?._id)
    });

    const totalSubscribers = await Subscription.countDocuments({
        channel: new mongoose.Types.ObjectId(req.user?._id)
    });

    const totalLikesViews = await Video.aggregate([
        {
            $match: {
                owner: req.user?._id
            }
        },
        {
            $lookup:{
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "liked",
            }
        },
        {
            $addFields: {
                likes: {
                    $size: "$liked"
                }
            }
        },
        {
            $group: {
                _id: null,
                totalLikes: {
                  $sum: "$likes",
                },
                totalViews: {
                  $sum: "$views",
                },
              },
            },
          ]);
        
          return res.status(200).json(
            new ApiResponse(200, {
              totalVideos,
              totalSubscribers,
              totalLikes: totalLikesViews[0]?.totalLikes || 0,
              totalViews: totalLikesViews[0]?.totalViews || 0,
            })
          );
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    const video = await Video.find({
        owner: new mongoose.Types.ObjectId(req.user?._id)
    });

    if (!video) {
        throw new ApiError(404, "No videos available !!!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully of this channel"));

})

export {
    getChannelStats, 
    getChannelVideos
    }