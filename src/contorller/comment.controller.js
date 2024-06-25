import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { Tweet } from "../models/tweet.model.js"
const getVideoComments = asyncHandler(async (req, res) => {
    
    const { videoId } = req.params;

    const comments =  await Comment.find({ video : videoId });
   
  
    
    if (!comments.length > 0) {
      throw new ApiError(404, "No comments found for this video.");
    }
  
    // Send a response with the retrieved comments
    res.status(200).json(new ApiResponse(200, { comments }, "Comments fetched successfully."));
  });
  
const addComment = asyncHandler(async (req, res) => {
    const {videoId} =  req.params
    const {content} = req.body
    const user = req.user._id

    if(!content){
        throw new ApiError(400, "content is required to post a comment")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "invalid videoId")

    }
    const video =  await Video.findById(videoId)

    const addedcomment = await Comment.create({
        content ,
        video : video,
        owner : user
    })
    if(!addedcomment){
        throw new ApiError(400,addedcomment, "something went wrong while adding the comment")
    }

    res.status(200).json(new ApiResponse(200, {addedcomment},"comment added sucessfully"))

})

const Tweetcomment = asyncHandler(async (req, res)=> {
    const {TweetId} = req.params;
    const {content} = req.body;
    const user = req.user._id;

    if(!content){
        throw new ApiError(400, "content is required to post a comment")
    }
    if(!isValidObjectId(TweetId)){
        throw new ApiError(401, "invalid tweet!")

    }
    const tweet = await Tweet.findById(TweetId)
    if(!tweet){
        throw new ApiError(400, "tweet not found")
    }

    const addedcomment = await Comment.create({
        content,
        Tweet : tweet,
        owner : user
    })
    if(!addedcomment){
        throw new ApiError(400, "something went wrong while adding this comment")
    }

    res.status(200).json(new ApiResponse(200, {addedcomment}," comment added sucessfully"))
})

const getTweetComments = asyncHandler(async (req, res) => {
    
    const { TweetId} = req.params;

    const comments =  await Comment.find({ Tweet : TweetId});
   
  
    
    if (!comments.length > 0) {
      throw new ApiError(404, "No comments found for this tweet.");
    }
  
    // Send a response with the retrieved comments
    res.status(200).json(new ApiResponse(200, { comments }, "Comments fetched successfully."));
  });

const updateComment = asyncHandler(async (req, res) => {
    const {commentId}= req.params
    const {newcontent} = req.body
    const user = req.user._id

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "invalid commentId")
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found!");
    }
    if (!comment.owner.equals(user)) {
        throw new ApiError(403, "You do not have permission to update this comment!");
    }

    if(!newcontent){
        throw new ApiError(400, "newcontent is  required")
    }

    const updatedComment =  await Comment.findByIdAndUpdate(commentId, {
        $set : {
            content : newcontent
        }
    })

    if(!updateComment){
        throw new ApiError(400, "Something went wrong while updating comment!")
    }

    res.status(200,{updatedComment}, "update comment sucessfully")
})




const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    const userId = req.user._id; // Assuming req.user contains the _id field

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found!");
    }

    if (!comment.owner.equals(userId)) {
        throw new ApiError(403, "You do not have permission to delete this comment!");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId);

    if (!deletedComment) {
        throw new ApiError(404, "Something went wrong while deleting this comment");
    }

    res.status(200).json(new ApiResponse(200, "Comment deleted successfully"));
});




export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment,
     Tweetcomment,
     getTweetComments
    }