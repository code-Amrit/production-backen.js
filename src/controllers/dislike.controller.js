import { Dislike } from "../models/dislike.models.js";
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoDislike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: toggle dislike on video

  if (!videoId) {
    throw new ApiError(401, "Video Id is missing from params");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const existingDislike = await Dislike.findOne({
    video: videoId,
    dislikedBy: req.user._id,
  });

  if (existingDislike) {
    await existingDislike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video disliked removed successfully"));
  } else {
    const newDislike = await Dislike.create({
      video: videoId,
      dislikedBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Video disliked successfully"));
  }
});

const toggleTweetDislike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {   
    throw new ApiError(401, "Tweet Id is missing from params");
  }

  const tweet = await Tweet.findById(tweetId);

  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }

  const existingDislike =  await Dislike.findOne({
    tweet: tweetId,
    dislikedBy: req.user._id,
  });

  if (existingDislike) {
    await existingDislike.deleteOne();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet disliked removed successfully"));
  } else {
    const newDislike = await Dislike.create({
      tweet: tweetId,
      dislikedBy: req.user._id,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Tweet disliked successfully"));
  }
  });

const countVideoDisLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(401, "Video Id is missing from params");
  }
  const videoDisLikeCount = await Dislike.countDocuments({ video: videoId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videoDisLikeCount },
        "Video dislikes count fetched successfully"
      )
    );
});

const countTweetDisLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(401, "Tweet Id is missing from params");
  }
  const tweetDisLikeCount = await Dislike.countDocuments({ tweet: tweetId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { tweetDisLikeCount },
        "Tweet dislikes count fetched successfully"
      )
    );
});
    

export { toggleVideoDislike, countVideoDisLikes, toggleTweetDislike, countTweetDisLikes };
