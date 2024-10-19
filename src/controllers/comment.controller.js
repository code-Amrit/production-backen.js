import mongoose, {isValidObjectId} from "mongoose"
import {Comment} from "../models/comment.models.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/video.models.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    const aggregate = Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
            }
        },
        {
            $unwind: { // Ensure ownerDetails is an object, if no user is found this can be skipped
                path: "$ownerDetails",
                preserveNullAndEmptyArrays: true // Keep comments without owners
            }
        },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "ownerDetails.username": 1,
                "ownerDetails.avatar": 1
            },
        }
    ]);

    //paginate the results
    const options = {
        page: parseInt(page),
        limit: parseInt(limit),    
    };

    const comments = await Comment.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Comments fetched successfully"));


})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video id is invalid")
    }

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found")
    }


    const newComment = await Comment.create({
        content,
        video: videoId,
        owner: req.user?._id
    })

    if (!newComment) {
        throw new ApiError(500, "Failed to add comment please try again")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, newComment, "Comment added successfully"))

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id is invalid")
    }

    if (!content) {
        throw new ApiError(400, "Content is required")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    comment.content = content
    const updatedComment = await comment.save()

    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"))

})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment id is invalid")
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found")
    }

    if (!comment.owner.equals(req.user?._id)) {
        throw new ApiError(403, "You are not authorized to delete this comment")
    }

    await comment.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"))


})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }