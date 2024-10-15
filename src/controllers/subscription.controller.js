import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const channel = await User.findById(channelId)
    const user = req.user._id

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    const existingSubscription = await Subscription.findOne({
        subscriber: user,
        channel: channelId
    })

    if (existingSubscription) {
        await existingSubscription.remove();

        return res
        .status(200)
        .json(new ApiResponse(200, null, "Unsubscribed from channel"))
    } else {
            const newSubscription = await Subscription.create({
                subscriber: user,
                channel: channelId
            })
    

        return res
        .status(200)
        .json(new ApiResponse(200, newSubscription, "Subscribed to channel"))
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}