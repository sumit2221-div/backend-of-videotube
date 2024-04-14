import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found!");
    }

    const likedvideo = await Like.findOne({ Video: videoId });

    let unlike;

    if (likedvideo) {
        unlike = await Like.deleteOne({ Video: videoId });
        video.likes -= 1; // Decrement like count
    } else {
        await Like.create({
            video: videoId,
            likedby: userId
        });
        Video.likes += 1; // Increment like count
    }

    await video.save();

    res.status(200).json(new ApiResponse(
        200,
        {},
        `Video ${unlike ? "unlike" : "like"} successfully`
    ));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    // Your existing toggleCommentLike function
});

const toggleTweetLike = asyncHandler(async (req, res) => {
    // Your existing toggleTweetLike function
});

const getLikedVideos = asyncHandler(async (req, res) => {
    // Your existing getLikedVideos function
});

const getallLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Count likes
    const likeCount = await Like.countDocuments({ video: videoId, Like: true });

    // Count dislikes
    const dislikeCount = await Like.countDocuments({ video: videoId, Like : false });

    res.status(200).json(new ApiResponse(200, { likes: likeCount, dislikes: dislikeCount }, "Likes and Dislikes found"));
});



export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getallLikes
};
