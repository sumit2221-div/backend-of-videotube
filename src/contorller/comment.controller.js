import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Tweet } from "../models/tweet.model.js";
import asyncHandler from "../utils/asyncHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const comments = await Comment.find({ video: videoId });

  if (!comments.length) {
    return res.status(404).json({ message: "No comments found for this video." });
  }

  res.status(200).json({ data: comments, message: "Comments fetched successfully." });
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const user = req.user._id;

  if (!content) {
    return res.status(400).json({ message: "Content is required to post a comment." });
  }

  if (!isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid video ID." });
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({ message: "Video not found." });
  }

  const addedComment = await Comment.create({
    content,
    video: video._id,
    owner: user,
  });

  res.status(201).json({ data: addedComment, message: "Comment added successfully." });
});

const Tweetcomment = asyncHandler(async (req, res) => {
  const { TweetId } = req.params;
  const { content } = req.body;
  const user = req.user._id;

  if (!content) {
    return res.status(400).json({ message: "Content is required to post a comment." });
  }

  if (!isValidObjectId(TweetId)) {
    return res.status(400).json({ message: "Invalid tweet ID." });
  }

  const tweet = await Tweet.findById(TweetId);
  if (!tweet) {
    return res.status(404).json({ message: "Tweet not found." });
  }

  const addedComment = await Comment.create({
    content,
    tweet: tweet._id,
    owner: user,
  });

  res.status(201).json({ data: addedComment, message: "Comment added successfully." });
});

const getTweetComments = asyncHandler(async (req, res) => {
  const { TweetId } = req.params;

  const comments = await Comment.find({ tweet: TweetId });

  if (!comments.length) {
    return res.status(404).json({ message: "No comments found for this tweet." });
  }

  res.status(200).json({ data: comments, message: "Comments fetched successfully." });
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { newcontent } = req.body;
  const user = req.user._id;

  if (!isValidObjectId(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID." });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found." });
  }

  if (!comment.owner.equals(user)) {
    return res.status(403).json({ message: "You do not have permission to update this comment." });
  }

  if (!newcontent) {
    return res.status(400).json({ message: "New content is required." });
  }

  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { content: newcontent },
    { new: true }
  );

  res.status(200).json({ data: updatedComment, message: "Comment updated successfully." });
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(commentId)) {
    return res.status(400).json({ message: "Invalid comment ID." });
  }

  const comment = await Comment.findById(commentId);
  if (!comment) {
    return res.status(404).json({ message: "Comment not found." });
  }

  if (!comment.owner.equals(userId)) {
    return res.status(403).json({ message: "You do not have permission to delete this comment." });
  }

  await Comment.findByIdAndDelete(commentId);

  res.status(200).json({ message: "Comment deleted successfully." });
});

export {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
  Tweetcomment,
  getTweetComments,
};