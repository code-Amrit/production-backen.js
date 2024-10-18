import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";
import { User } from "../models/user.models.js";
import { Video } from "../models/video.models.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if (!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id,
    });

    if (!playlist) {
        throw new ApiError(400, "Failed to create playlist")
    }

    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"))

});

const getUserPlaylists = asyncHandler(async (req, res) => {

    const {userId} = req.params;

    if (!userId) {
        throw new ApiError(400, "User Id is missing")
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const userPlaylists = await Playlist.find({
        owner: new mongoose.Types.ObjectId(userId)
    });

    return res
        .status(200)
        .json(new ApiResponse(200, userPlaylists, "User playlists fetched successfully"))

});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;

    if (!playlistId) {
        throw new ApiError(400, "Playlist Id is missing")
    }

    const playlist = await Playlist.findById(playlistId);                

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params;

    if (!playlistId || !videoId) {
        throw new ApiError(400, "Playlist Id and video Id are required")
    }

    const playlist = await Playlist.findById(playlistId);                

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in playlist")
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found")
    }
    
    if (!playlist.owner.equals(req.user?._id)) {
        throw new ApiError(401, "Unauthorized request !!!") 
    }

    playlist.videos.push(videoId);

    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist successfully"))


});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {

    const {playlistId, videoId} = req.params;

    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Playlist Id and video Id are inalid")
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {    
        throw new ApiError(404, "Playlist not found")
    }

    if (!playlist.owner.equals(req.user?._id)) {
        throw new ApiError(401, "Unauthorized request !!!")
    }

    if (!playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video not in playlist")
    }

    await playlist.videos.pull(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist successfully"))

});

const deletePlaylist = asyncHandler(async (req, res) => {

    const {playlistId} = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist Id is invalid")
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (!playlist.owner.equals(req.user?._id)) {
        throw new ApiError(401, "Unauthorized request !!!")
    }

    await Playlist.findByIdAndDelete(playlistId);

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully"))

});

const updatePlaylist = asyncHandler(async (req, res) => {

    const {playlistId} = req.params;
    const {name, description} = req.body;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Playlist Id is invalid")
    }

    if(!name || !description) {
        throw new ApiError(400, "Name and description are required")
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    if (!playlist.owner.equals(req.user?._id)) {
        throw new ApiError(401, "Unauthorized request !!!")
    }

    if (name) playlist.name = name;
    if (description) playlist.description = description;

    const updatedPlaylist = await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))


});




export {createPlaylist, getPlaylistById, getUserPlaylists, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist}