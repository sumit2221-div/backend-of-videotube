import mongoose, { isValidObjectId } from "mongoose"
import {Comment} from "../models/comment.model.js"
import { Video } from "../models/video.model.js"
import { ApiError } from "../utils/apierror.js"
import { ApiResponse } from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"
const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    let comments =  await Comment.aggregate([
        {
            $match : {
                videoId : videoId
            }
        },
        {
            $sort : {
                createdAt: -1
            }
        },
        {
            $skip : limit * (page -1)
        },
        {
            $limit : li4
        }

    ]).exec()

    if(!comments.length > 0){
        throw new ApiError(404, "no comment on this video")
    }

    const totalcomments =  (await Comment.countDocuments({videoId : videoId})).exec()

    res.status(200).json(new ApiResponse(200, {"comments" : comments, "totalcomments" : totalcomments}, "comments fetch sucessfully"))

})

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
    const videos =  await Video.findById(videoId)

    const addedcomment = await Comment.create({
        content ,
        video : videos,
        owner : user
    })
    if(!addedcomment){
        throw new ApiError(400, "something went wrong while adding the comment")
    }

    res.status(200).json(new ApiResponse(200, {addedcomment},"comment added sucessfully"))

})

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
    if (comment.owner.toString() !== user) {
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
    const {commentId} = req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "invalid commentId")
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "Comment not found!");
    }
    if (comment.owner.toString() !== user) {
        throw new ApiError(403, "You do not have permission to delete this comment!");
    }

    const deletedComment = await Comment.findByIdAndDelete(commentId)

    if(!deletedComment){
        throw new ApiError(404, "something went wrong while deleting this video")

    }

   res.status(200).json(new ApiResponse(200, "comment deleted sucessfully"))



})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }