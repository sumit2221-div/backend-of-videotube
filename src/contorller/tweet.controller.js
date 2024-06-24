import mongoose, { isValidObjectId } from "mongoose"
import { Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apierror.js"
import {ApiResponse} from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudnary.js"
import { Like } from "../models/like.model.js"

const getAllTweets = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query;
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);

  const filter = {};
  if (query) filter.title = { $regex: query, $options: 'i' };
  if (userId) filter.owner = userId;

  let sort = {};
  if (sortBy && sortType === 'asc') sort[sortBy] = 1;
  if (sortBy && sortType === 'desc') sort[sortBy] = -1;
  if (!sortBy || !sortType) sort = { createdAt: -1 };

  const skip = (page - 1) * limit;

  const tweets = await Tweet.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .exec();

  const totalTweetCount = await Tweet.countDocuments(filter);
  const totalPages = Math.ceil(totalTweetCount / limit);

  if (tweets.length === 0) {
    throw ApiError(400, "Tweets not found");
  }

  const tweetIds = tweets.map(tweet => tweet._id);
  const likes = req.user ? await Like.find({ tweet: { $in: tweetIds }, likedBy: req.user._id }).exec() : [];
  const likestatus = likes ? true : false ; 


 


  res.status(200).json(new ApiResponse(200, { tweets , likestatus, totalPages }, "Tweets found"));
});

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;

    if (!content) {
      throw new ApiError(400, "Please provide content");
    }

    if (!req.file || !req.file.path) {
      throw new ApiError(400, "Please provide a picture");
    }

    const pictureLocalPath = req.file.path;

    // Upload picture to Cloudinary
    const uploadResponse = await uploadOnCloudinary(pictureLocalPath);

    // Extract the URL from the Cloudinary upload response
    const pictureUrl = uploadResponse.secure_url;

    // Create new tweet with the picture URL
    const tweet = await Tweet.create({
      content,
      owner: req.user?._id,
      picture: pictureUrl // Assign the picture URL
    });


    

    return res.status(201).json(
      new ApiResponse(200, tweet, "Tweet uploaded successfully")
    );
});



  
const getUserTweets = asyncHandler(async (req, res) => {
    const {userId}= req.params
    if (!mongoose.isValidObjectId(userId)) {
        return next(new ApiError(400, "Invalid user ID"));
      }
    
      const Tweet = await Tweet.find({owner : userId})
    
      if (!Tweet) {
        return next(new ApiError(400, "Tweet not found"));
      }
    
      res.status(200).json(new ApiResponse(200, Tweet, "tweet retrieved successfully"));
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
    deleteTweet,
    getAllTweets
}