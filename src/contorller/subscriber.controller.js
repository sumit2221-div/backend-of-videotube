import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription} from "../models/subscription.modles.js"
import {ApiError} from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Channel ID is not valid");
    }

    const subscriberId = req.user?._id;

    let subscription = await Subscription.findOne({  Subscriber: subscriberId, channel: channelId })
                                       

    if (subscription) {
        await Subscription.findByIdAndDelete(subscription._id);
        res.status(200).json(new ApiResponse(200, null, 'Unsubscribed successfully'));
    } else {
        // If not subscribed, subscribe
        const subscriberData = await Subscription.create({  Subscriber: subscriberId, channel: channelId });
      
        res.status(200).json(new ApiResponse(200, subscriberData, 'Subscribed successfully'));
    }
    
    
});

  

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