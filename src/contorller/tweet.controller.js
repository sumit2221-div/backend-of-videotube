import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apierror.js"
import {ApiResponse} from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
const {content}=  req.body

if(!content){
    throw new ApiError(400, "pls provide content")
}



const tweet =  await  Tweet.create({
    content,
    owner : new mongoose.Types.ObjectId(req.user?._id),


})
const newtweet = await Tweet.findById(tweet._id).select("-owner");

    if (!newtweet) {
      throw new ApiError(500, "something went wrong in uploading tweet");
    }

    return res.status(201).json(
        new ApiResponse(200, newtweet,"tweet uploaded sucessfully")
    )

})
const getUserTweets = asyncHandler(async (req, res) => {
    const {tweetId}= req.params
    if (!mongoose.isValidObjectId(tweetId)) {
        return next(new ApiError(400, "Invalid tweet ID"));
      }
    
      const video = await Tweet.findById(tweetId);
    
      if (!video) {
        return next(new ApiError(400, "Video not found"));
      }
    
      res.status(200).json(new ApiResponse(200, video, "Video retrieved successfully"));
    });



const updateTweet = asyncHandler(async (req, res) => {
    const {tweetId}= req.params
    const {tweet} = req.body

    const update =  await Tweet.findOneAndUpdate(tweetId,{tweet}, {new :true})

    if(!update){
        throw new ApiError(400,"uable to update")
    }

    res.status(200).json(new ApiResponse(200, "tweet updated sucessfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId}= req.params

    const deletetweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletetweet){
        throw new ApiError(200, "error while deleting this tweet")
    }

    res.status(200).json(new ApiResponse(200, "tweet deleted sucessfully"))
    


    
    
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}