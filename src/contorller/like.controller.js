import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid video ID" });
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  const likedVideo = await Like.findOne({ video: videoId, likedBy: userId });

  if (likedVideo) {
    await Like.deleteOne({ video: videoId, likedBy: userId });
    return res.status(200).json({ message: "Video unliked successfully" });
  } else {
    await Like.create({ video: videoId, likedBy: userId });
    return res.status(200).json({ message: "Video liked successfully" });
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID" });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found" });
  }

  const likedComment = await Like.findOne({ comment: commentId, likedBy: userId });

  if (likedComment) {
    await Like.deleteOne({ comment: commentId, likedBy: userId });
    return res.status(200).json({ message: "Comment unliked successfully" });
  } else {
    await Like.create({ comment: commentId, likedBy: userId });
    return res.status(200).json({ message: "Comment liked successfully" });
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;

  if (!mongoose.isValidObjectId(tweetId)) {
    return res.status(400).json({ message: "Invalid tweet ID" });
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    return res.status(404).json({ message: "Tweet not found" });
  }

  const likedTweet = await Like.findOne({ tweet: tweetId, likedBy: userId });

  if (likedTweet) {
    await Like.deleteOne({ tweet: tweetId, likedBy: userId });
    return res.status(200).json({ message: "Tweet unliked successfully" });
  } else {
    await Like.create({ tweet: tweetId, likedBy: userId });
    return res.status(200).json({ message: "Tweet liked successfully" });
  }
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const userLikes = await Like.find({ likedBy: userId, video: { $exists: true } });
  const videoIds = userLikes.map((like) => like.video);

  const likedVideos = await Video.find({ _id: { $in: videoIds } });

  res.status(200).json({ data: likedVideos, message: "Liked videos retrieved successfully" });
});

const getVideoAllLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid video ID" });
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  const allLikes = await Like.find({ video: videoId });

  res.status(200).json({ data: allLikes, message: "All likes for the video retrieved successfully" });
});

export {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  getVideoAllLikes,
};
