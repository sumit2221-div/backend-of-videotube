import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { Comment } from "../models/comment.model.js"
const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

   const userId = req.user._id
   if(!videoId){
    throw new ApiError(200, "invalid videoId")
   }

   const video =  await Video.findById(videoId)
   if (!video) {
    throw new ApiError(404, "Video not found!");
}
const likedvideo = await Like.findOne({video : videoId})

let like;
let unlike;



if(likedvideo){
   unlike =  await Like.deleteOne({ video: videoId });
}
else{
     like = await Like.create({
        video :videoId,
        likedby : userId
    })
}
 res.status(200).json(new ApiResponse(
    200,
    {},
    `Video ${ unlike? "unlike" : "like"} successfully`
));
});




const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id
    if(!commentId){
     throw new ApiError(200, "invalid commentId")
    }
 
    const comment =  await Comment.findById(commentId)
    if (!comment) {
     throw new ApiError(404, "comment not found!");
 }
 const likedcomment = await Like.findOne({comment : commentId})
 
 let like;
 let unlike;
 
 
 
 if(likedcomment){
    unlike =  await Like.deleteOne({ comment: commentId });
 }
 else{
      like = await Like.create({
         comment : commentId,
         likedby : userId
     })
 }
  res.status(200).json(new ApiResponse(
     200,
     {},
     `comment ${ unlike? "unlike" : "like"} successfully`
 ));
 });
 


const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}