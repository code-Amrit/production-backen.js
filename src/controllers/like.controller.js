import { Comment } from "../models/comment.models.js";
import { Like } from "../models/like.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { action } = req.body; // Expecting 'like' or 'dislike' in request body

  // Validate input parameters
  if (!videoId || !action || !['like', 'dislike'].includes(action)) {
    throw new ApiError(400, "Invalid parameters");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Check if the user already liked or disliked the video
  const existingInteraction = await Like.findOne({
    video: videoId,
    likedBy: req.user._id,
  });

  // console.log('Existing Interaction:', existingInteraction);


  if (existingInteraction) {
    if (existingInteraction.type === action) {
      // If the action matches the existing one (e.g., user tries to like again)
      // Remove the existing interaction (toggle off)
      await existingInteraction.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, null, `${action.charAt(0).toUpperCase() + action.slice(1)} removed successfully`));
    } else {
      // If the user is switching from like to dislike or vice versa, update the existing record
      existingInteraction.type = action; // Change the type to the new action
      await existingInteraction.save();
      return res
        .status(200)
        .json(new ApiResponse(200, existingInteraction, `Switched to ${action.charAt(0).toUpperCase() + action.slice(1)} successfully`));
    }
  } else {
    // No existing interaction, create a new one for the current action
    const newInteraction = await Like.create({
      video: videoId,
      likedBy: req.user._id,
      type: action,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, newInteraction, `${action.charAt(0).toUpperCase() + action.slice(1)} added successfully`));
  }
});




const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { type } = req.body; // Expecting 'like' or 'dislike' from the request body

  if (!commentId) {
    throw new ApiError(401, "Comment Id is missing from params");
  }

  if (!type || (type !== 'like' && type !== 'dislike')) {
    throw new ApiError(400, "Invalid type. Must be 'like' or 'dislike'");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Find the existing like or dislike by the user on the comment
  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  // If there's already a like or dislike
  if (existingLike) {
    // If the existing interaction matches the requested one, remove it (toggle off)
    if (existingLike.type === type) {
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, null, `${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully`));
    } else {
      // If the existing interaction is different, switch it
      existingLike.type = type;
      await existingLike.save();
      return res
        .status(200)
        .json(new ApiResponse(200, existingLike, `Switched to ${type} successfully`));
    }
  }

  // Create a new like or dislike if no existing interaction
  const newLike = await Like.create({
    comment: commentId,
    likedBy: req.user._id,
    type: type, // 'like' or 'dislike'
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newLike, `Comment ${type}d successfully`));
});


const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { type } = req.body; // Expecting 'like' or 'dislike' from the request body

  if (!tweetId) {
    throw new ApiError(401, "Tweet Id is missing from params");
  }

  if (!type || (type !== 'like' && type !== 'dislike')) {
    throw new ApiError(400, "Invalid type. Must be 'like' or 'dislike'");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Find the existing like or dislike by the user on the tweet
  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user._id,
  });

  // If there's already a like or dislike
  if (existingLike) {
    // If the existing interaction matches the requested one, remove it (toggle off)
    if (existingLike.type === type) {
      await existingLike.deleteOne();
      return res
        .status(200)
        .json(new ApiResponse(200, null, `${type.charAt(0).toUpperCase() + type.slice(1)} removed successfully`));
    } else {
      // If the existing interaction is different, switch it
      existingLike.type = type;
      await existingLike.save();
      return res
        .status(200)
        .json(new ApiResponse(200, existingLike, `Switched to ${type} successfully`));
    }
  }

  // Create a new like or dislike if no existing interaction
  const newLike = await Like.create({
    tweet: tweetId,
    likedBy: req.user._id,
    type: type, // 'like' or 'dislike'
  });

  return res
    .status(200)
    .json(new ApiResponse(200, newLike, `Tweet ${type}d successfully`));
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

const countVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(401, "Video Id is missing from params");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  // Count likes and dislikes separately
  const videoLikeCount = await Like.countDocuments({
    video: videoId,
    type: 'like', // Assuming 'type' field indicates the interaction type
  });

  const videoDislikeCount = await Like.countDocuments({
    video: videoId,
    type: 'dislike',
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { videoLikeCount, videoDislikeCount }, "Video likes and dislikes count fetched successfully")
    );
});


const countCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(401, "Comment Id is missing from params");
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new ApiError(404, "Comment not found");
  }

  // Count likes and dislikes separately for the comment
  const commentLikeCount = await Like.countDocuments({
    comment: commentId,
    type: 'like', // Assuming 'type' field indicates the interaction type
  });

  const commentDislikeCount = await Like.countDocuments({
    comment: commentId,
    type: 'dislike',
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { commentLikeCount, commentDislikeCount }, "Comment likes and dislikes count fetched successfully")
    );
});


const countTweetLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(401, "Tweet Id is missing from params");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  // Count likes and dislikes separately for the tweet
  const tweetLikeCount = await Like.countDocuments({
    tweet: tweetId,
    type: 'like', // Assuming 'type' field indicates the interaction type
  });

  const tweetDislikeCount = await Like.countDocuments({
    tweet: tweetId,
    type: 'dislike',
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { tweetLikeCount, tweetDislikeCount }, "Tweet likes and dislikes count fetched successfully")
    );
});





export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  getLikedVideos,
  countCommentLikes,
  countVideoLikes,
  countTweetLikes
}