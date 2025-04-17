import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { Like } from "../models/like.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import moment from "moment";
import { Subscription } from "../models/subscription.modles.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query;
  let { page = 1, limit = 12 } = req.query;
  page = parseInt(page);

  const filter = {};
  if (query) filter.title = { $regex: query, $options: "i" };
  if (userId) filter.owner = userId;

  let sort = {};
  if (sortBy && sortType === "asc") sort[sortBy] = 1;
  if (sortBy && sortType === "desc") sort[sortBy] = -1;
  if (!sortBy || !sortType) sort = { createdAt: -1 };

  const skip = (page - 1) * limit;

  const videos = await Video.find(filter).sort(sort).skip(skip).limit(parseInt(limit)).exec();
  const totalVideosCount = await Video.countDocuments(filter);
  const totalPages = Math.ceil(totalVideosCount / limit);

  res.status(200).json({ data: { videos, totalPages }, message: "Videos found successfully" });
});

const Getsubscribervideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const subscriptions = await Subscription.find({ Subscriber: userId });

  const channelIds = subscriptions.map((subscription) => subscription.channel);
  const videos = await Video.find({ owner: { $in: channelIds } });

  if (!videos) {
    return res.status(400).json({ message: "Something went wrong" });
  }

  res.status(200).json({ data: videos, message: "Videos found successfully" });
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({ message: "Provide both title and description" });
  }

  const thumbnailLocalPath = req.files["thumbnail"][0].path;
  const videoLocalPath = req.files["videofile"][0].path;

  const videofile = await uploadOnCloudinary(videoLocalPath);
  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  const ownerId = req.user._id;

  const video = await Video.create({
    title,
    duration: moment.duration(videofile, "seconds"),
    owner: ownerId,
    description,
    thumbnail: thumbnail?.url || "",
    videofile: videofile.url,
  });

  if (!video) {
    return res.status(500).json({ message: "Something went wrong while publishing the video" });
  }

  res.status(201).json({ data: video, message: "Video uploaded successfully" });
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId)) {
    return res.status(400).json({ message: "Invalid video ID" });
  }

  const video = await Video.findById(videoId);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  const likedByCurrentUser = req.user ? await Like.findOne({ video: videoId, likedBy: req.user._id }) : null;
  const likestatus = !!likedByCurrentUser;

  const subscriber = req.user ? await Subscription.findOne({ channel: video.owner, Subscriber: req.user._id }) : null;
  const isSubscriber = !!subscriber;

  res.status(200).json({ data: { video, likestatus, isSubscriber }, message: "Video retrieved successfully" });
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description, thumbnail } = req.body;

  const updatedVideo = await Video.findByIdAndUpdate(videoId, { title, description, thumbnail }, { new: true });

  if (!updatedVideo) {
    return res.status(404).json({ message: "Video not found" });
  }

  res.status(200).json({ data: updatedVideo, message: "Video updated successfully" });
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const deletedVideo = await Video.findByIdAndDelete(videoId);

  if (!deletedVideo) {
    return res.status(404).json({ message: "Unable to delete video" });
  }

  res.status(200).json({ message: "Video deleted successfully" });
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);

  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  video.isPublished = !video.isPublished;
  await video.save();

  res.status(200).json({ data: video, message: "Video publish status updated successfully" });
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
  Getsubscribervideos,
};