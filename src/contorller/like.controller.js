import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/apierror.js";
import { ApiResponse } from "../utils/apiresponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import {Tweet} from "../models/tweet.model.js"


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

    const likedvideo = await Like.findOne({ video: videoId , likedby: userId });

    if (likedvideo) {
        await Like.findByIdAndDelete(Like._id);
        res.status(200).json(new ApiResponse(200, null, 'video dislike successfully'));
    } else {
        // If not subscribed, subscribe
        const Likedata = await Like.create({  video : videoId ,  likedBy: userId });
      
        res.status(200).json(new ApiResponse(200, Likedata, 'video Like successfully'));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentid");
    }

    const comment = await Comment.findById( commentId);
    if (!comment) {
        throw new ApiError(404, "comment not found!");
    }

    const likedcomment = await Like.findOne({ Comment: commentId });

    let unlike;

    if (likedcomment) {
        unlike = await Like.deleteOne({ Comment: commentId });
    
    } else {
        await Like.create({
            comment : commentId,
            likedby: userId
        });
        
    }

    await Comment.save();

    res.status(200).json(new ApiResponse(
        200,
        {},
        `comment ${unlike ? "unlike" : "like"} successfully`
    ));
});



const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;

    if (!mongoose.isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweetId");
    }

    const tweet = await Tweet.findById( tweetId);
    if (!tweet) {
        throw new ApiError(404, "tweet not found!");
    }

    const likedtweet = await Like.findOne({ Tweet :  tweetId });

    let unlike;

    if (likedtweet) {
        unlike = await Like.deleteOne({ Tweet : tweetId});
    
    } else {
        await Like.create({
            tweet : tweetId,
            likedby: userId
        });
        
    }



    res.status(200).json(new ApiResponse(
        200,
        {},
        `tweet ${unlike ? "unlike" : "like"} successfully`
    ));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user?._id;

    // Find all likes by the user
    const userLikes = await Like.find({ likedBy: userId });

    // Extract video IDs from user likes
    const videoIds = userLikes.map(Like => Like.video);

    // Find videos based on the extracted video IDs
    const likedVideos = await Video.find({ _id:  videoIds});



    res.status(200).json(new ApiResponse(
        200,
        { likedVideos},
        "Liked videos retrieved successfully"
    ));
});

const getVideoAllLikes = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found!");
    }

    const allLikes = await Like.find({ video: videoId });

    res.status(200).json(new ApiResponse(200, { allLikes }, "All likes for the video retrieved successfully"));
});











export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos,
    getVideoAllLikes
   
};
