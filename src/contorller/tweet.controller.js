import mongoose from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { Like } from "../models/like.model.js";

const getAllTweets = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query;
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);

  const filter = {};
  if (query) filter.title = { $regex: query, $options: "i" };
  if (userId) filter.owner = userId;

  let sort = {};
  if (sortBy && sortType === "asc") sort[sortBy] = 1;
  if (sortBy && sortType === "desc") sort[sortBy] = -1;
  if (!sortBy || !sortType) sort = { createdAt: -1 };

  const skip = (page - 1) * limit;

  try {
    const tweets = await Tweet.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).exec();
    const totalTweetCount = await Tweet.countDocuments(filter);
    const totalPages = Math.ceil(totalTweetCount / limit);

    if (tweets.length === 0) {
      return res.status(404).json({ message: "No tweets found" });
    }

    res.status(200).json({ data: { tweets, totalPages }, message: "Tweets retrieved successfully" });
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return res.status(400).json({ message: "Please provide content" });
  }

  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "Please provide a picture" });
  }

  const pictureLocalPath = req.file.path;

  // Upload picture to Cloudinary
  const uploadResponse = await uploadOnCloudinary(pictureLocalPath);

  // Extract the URL from the Cloudinary upload response
  const pictureUrl = uploadResponse.secure_url;

  // Create new tweet with the picture URL
  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
    picture: pictureUrl, // Assign the picture URL
  });

  res.status(201).json({ data: tweet, message: "Tweet uploaded successfully" });
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const tweets = await Tweet.find({ owner: userId });

  if (!tweets || tweets.length === 0) {
    return res.status(404).json({ message: "No tweets found for this user" });
  }

  res.status(200).json({ data: tweets, message: "Tweets retrieved successfully" });
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { content } = req.body;

  const updatedTweet = await Tweet.findByIdAndUpdate(tweetId, { content }, { new: true });

  if (!updatedTweet) {
    return res.status(404).json({ message: "Unable to update tweet" });
  }

  res.status(200).json({ data: updatedTweet, message: "Tweet updated successfully" });
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

  if (!deletedTweet) {
    return res.status(404).json({ message: "Error while deleting the tweet" });
  }

  res.status(200).json({ message: "Tweet deleted successfully" });
});

export {
  createTweet,
  getUserTweets,
  updateTweet,
  deleteTweet,
  getAllTweets,
};