import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;

  const newPlaylist = await Playlist.create({
    name,
    description,
    owner: userId,
  });

  if (!newPlaylist) {
    return res.status(500).json({ message: "Something went wrong while creating the playlist" });
  }

  res.status(201).json({ data: newPlaylist, message: "Playlist created successfully" });
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const userPlaylists = await Playlist.find({ owner: userId })
    .populate("videos", "title")
    .exec();

  if (userPlaylists.length === 0) {
    return res.status(404).json({ message: "No playlists found" });
  }

  res.status(200).json({ data: userPlaylists, message: "User playlists retrieved successfully" });
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    return res.status(400).json({ message: "Invalid playlist ID" });
  }

  const playlist = await Playlist.findById(playlistId);

  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  res.status(200).json({ data: playlist, message: "Playlist retrieved successfully" });
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    return res.status(400).json({ message: "Invalid video ID or playlist ID" });
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.status(404).json({ message: "Video not found" });
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  playlist.videos.push(video._id);
  await playlist.save();

  res.status(200).json({ data: playlist, message: "Video added to playlist successfully" });
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;

  if (!playlistId || !videoId) {
    return res.status(400).json({ message: "Invalid video ID or playlist ID" });
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  playlist.videos.pull(videoId);
  await playlist.save();

  res.status(200).json({ message: "Video removed from playlist successfully" });
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!isValidObjectId(playlistId)) {
    return res.status(400).json({ message: "Invalid playlist ID" });
  }

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) {
    return res.status(404).json({ message: "Something went wrong while deleting the playlist" });
  }

  res.status(200).json({ message: "Playlist deleted successfully" });
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!isValidObjectId(playlistId)) {
    return res.status(400).json({ message: "Invalid playlist ID" });
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { name, description },
    { new: true }
  );

  if (!updatedPlaylist) {
    return res.status(404).json({ message: "Something went wrong while updating the playlist" });
  }

  res.status(200).json({ data: updatedPlaylist, message: "Playlist updated successfully" });
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};