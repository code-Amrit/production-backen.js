import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.models.js"
import { Subscription } from "../models/subscription.models.js"
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
    const {subscriberId} = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid channel id")
    }

    const channel = await User.findById(subscriberId)

    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(subscriberId)
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            fullName: 1,
                            username: 1,
                        }
                    }
                ]
            }
        }
    ]);

    if (!subscribers.length) {
        throw new ApiError(404, "No subscribers found")
    }

    const subscriberDetails = {
        subscribers: subscribers || [],
        count: subscribers.length,
      };

    return res
    .status(200)
    .json(new ApiResponse(200, subscriberDetails, "Subscribers list"))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    console.log('Received channel id:', channelId)
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid subscriber id")
    }

    const subscriber = await User.findById(channelId)

    if (!subscriber) {
        throw new ApiError(404, "Subscriber not found")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(channelId)
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
                pipeline: [
                    {
                        $project: {
                            avatar: 1,
                            fullName: 1,
                            username: 1,
                        }
                    }
                ]
            }
        }
    ]);

    if (!subscribedChannels.length) {
        throw new ApiError(404, "No channels found")
    }

    const channelsDetails = {
        channels: subscribedChannels || [],
        count: subscribedChannels.length,
      };

      return res
      .status(200)
      .json(new ApiResponse(200, channelsDetails, "Subscribed channels list"))


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}