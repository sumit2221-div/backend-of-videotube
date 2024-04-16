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

    const likedvideo = await Like.findOne({ Video: videoId });

    let unlike;

    if (likedvideo) {
        unlike = await Like.deleteOne({ Video: videoId });
    
    } else {
        await Like.create({
            video: videoId,
            likedby: userId
        });
        
    }

    await video.save();

    res.status(200).json(new ApiResponse(
        200,
        {},
        `Video ${unlike ? "unlike" : "like"} successfully`
    ));
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

    await Comment.save();

    res.status(200).json(new ApiResponse(
        200,
        {},
        `tweet ${unlike ? "unlike" : "like"} successfully`
    ));
});

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id
    

    const videoPipeline =
        [
            {
                $match: {
                    likedBy: new mongoose.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullName: 1,
                                            username: 1,
                                            avatar: "$avatar.url",
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$owner",
                                },
                            },
                        },
                        {
                            $addFields: {
                                videoFile: "$videoFile.url"
                            },
                        },
                        {
                            $addFields: {
                                thumbnail: "$thumbnail.url"
                            },
                        },
                    ],
                },
            },

            {
                $unwind: "$video"
            },

            {
                $replaceRoot: {
                    newRoot: "$video",
                },
            },
        ]


    try {
        const likedVideos = await Like.aggregate(videoPipeline);
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    likedVideos,
                    "liked videos fetched successfully"
                )
            )

    } catch (error) {
        console.error("getLikedVideos error ::", error);
        throw new ApiError(500, error?.message || "Internal server error in getLikedVideos")
    }

})






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
