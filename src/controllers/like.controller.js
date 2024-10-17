import { Comment } from "../models/comment.models.js";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";
import mongoose, {isValidObjectId} from "mongoose"

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle like on video

  if (!videoId) {
    throw new ApiError(401, "Video Id is missing from params");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Like removed successfully"));
  }

  const newLike = await Like.create({
    video: videoId,
    likedBy: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newLike, "Like added successfully"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
     throw new ApiError(401, "Comment Id is missing from params");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Comment like removed successfully"));
  } else {  
    const newLike = await Like.create({
        comment: commentId,
        likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Comment liked successfully"));

  }

});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {   
    throw new ApiError(401, "Tweet Id is missing from params");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const existingLike =  await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  if (existingLike) {
    await existingLike.deleteOne();
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet like removed successfully"));

  } else {

    const newLike = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, newLike, "Tweet liked successfully"));
  }

});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get liked videos
  
    console.log(req.user?._id);
    

    const videos = await Like.aggregate([
        {
            $match: {
                likedBy: req.user._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
                pipeline: [
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",      
                        },
                    },
                    {
                        $unwind: "$owner",
                    },
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1,
                            videoFile: 1,
                            description: 1,
                            duration: 1,
                            views: 1,
                            "owner.username": 1,
                            "owner.fullname": 1,
                            "owner.avatar": 1,
                    }
                }
                ]

            },
            
        },{
            $unwind: "$video",
        }
        
    ])

    return res
    .status(200)
    .json(new ApiResponse(200, videos, "Fetched liked videos"))

});


export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos
}