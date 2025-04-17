import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.modles.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    return res.status(400).json({ message: "Channel ID is not valid" });
  }

  const subscriberId = req.user?._id;

  let subscription = await Subscription.findOne({ Subscriber: subscriberId, channel: channelId });

  if (subscription) {
    await Subscription.findByIdAndDelete(subscription._id);
    return res.status(200).json({ message: "Unsubscribed successfully" });
  } else {
    // If not subscribed, subscribe
    const subscriberData = await Subscription.create({ Subscriber: subscriberId, channel: channelId });
    return res.status(200).json({ data: subscriberData, message: "Subscribed successfully" });
  }
});

// Controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    return res.status(400).json({ message: "Invalid channel ID" });
  }

  const subscribers = await Subscription.find({ channel: channelId }).populate('Subscriber', '_id username');

  return res.status(200).json({ data: subscribers, message: "Subscribers retrieved successfully" });
});

// Controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    return res.status(400).json({ message: "Invalid subscriber ID" });
  }

  const subscribedChannels = await Subscription.find({ Subscriber: subscriberId }).populate('channel', '_id name');

  return res.status(200).json({ data: subscribedChannels, message: "Subscribed channels retrieved successfully" });
});

export {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
};