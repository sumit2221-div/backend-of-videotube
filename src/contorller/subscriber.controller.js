import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription} from "../models/subscription.modles.js"
import {ApiError} from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) throw new ApiError(401, "Invalid channel Id");
    if (!req.user?._id) throw new ApiError(401, "Unauthorized user");
    const subscriberId = req.user?._id;

    const isSubscribed = await Subscription.findOne({ channel: channelId, subscriber: subscriberId });
    var response;
    try {
        response = isSubscribed
            ?
            await Subscription.deleteOne({ channel: channelId, subscriber: subscriberId })
            :
            await Subscription.create({ channel: channelId, subscriber: subscriberId });
    } catch (error) {
        console.log("toggleSubscription error ::", error)
        throw new ApiError(500, error?.message || "Internal server error in toggleSubscription")

    }

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                response,
                isSubscribed === null ? "Subscribed successfully" : "Unsubscribed successfully"

            )
        )




})


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "channelid invalid")
    }
    const subscriber =  await Subscription.find({channel : channelId}).populate('Subscriber', '_id username')
    res.status(200).json(new ApiResponse(200, subscriber , "subscriber retrive sucessfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "invalid subscriberId")
    }
    const Subscribed = await Subscription.find({subscriber : subscriberId}).populate('channel', '_id name')
    res.status(200).json(new ApiResponse(200, Subscribed, "subscriber find sucessfully"))

})


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}