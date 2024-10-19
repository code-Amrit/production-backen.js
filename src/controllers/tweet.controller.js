import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.models.js"
import {User} from "../models/user.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { deleteImageFromCloudinary, uploadOnCloudinary } from "../utils/Cloudinary.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content} = req.body;

    if (!content || content.toLowerCase().trim() === "") {
        throw new ApiError(400, "Content is required")
    }

    const tweetImageLocalPath = req.file?.path

    let newTweetImage;

    if (tweetImageLocalPath) {
        newTweetImage = await uploadOnCloudinary(tweetImageLocalPath)
    

    if (!newTweetImage) {
        throw new ApiError(400, "Failed to upload image")
      }
    }   

    const newTweet = await Tweet.create({
        owner: req.user._id,
        content,
        tweetImage: newTweetImage?.url || "",
    });

    if (!newTweet) {
        throw new ApiError(500, "Failed to create tweet")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newTweet, "Tweet created successfully"))


})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId} = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "User id is invalid")
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "tweetAuthor",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            fullName: 1,
                            username: 1
                        }
                    }
                ]
            }
        }
    ]);

    if (!userTweets || userTweets.length === 0) {
        throw new ApiError(404, "User tweets not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, userTweets, "User tweets fetched successfully"))

})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const {tweetId} = req.params;
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const {content} = req.body;
    
    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const tweetImageLocalPath = req.file?.path;

    let newTweetImage;

    if (tweetImageLocalPath) {
        newTweetImage = await uploadOnCloudinary(tweetImageLocalPath)
    

    if (!newTweetImage) {
        throw new ApiError(400, "Failed to upload image")
    }
     // delete old image
     const parts = tweet.tweetImage.split("/");
     const tweetImageId = parts[parts.length - 1].split(".")[0];

     await deleteImageFromCloudinary(tweetImageId)
    }

    //update database
    const updatedTweetDetails = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {
                content,
                tweetImage: newTweetImage?.url || tweet.tweetImage,
            }
        },
        {new: true}
    );

    if (!updatedTweetDetails) {
        throw new ApiError(500, "Failed to update tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweetDetails, "Tweet updated successfully"))

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet

    const {tweetId} = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet id is invalid")
    }

    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    // extract image_id
    const tweet_parts = tweet.tweetImage.split("/");
    const tweetImageId = tweet_parts[tweet_parts.length - 1].split(".")[0];

    // delete image from cloudinary
    await deleteImageFromCloudinary(tweetImageId);

    // delete tweet from database
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    if (!deletedTweet) {
        throw new ApiError(500, "Failed to delete tweet")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully"))

})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}