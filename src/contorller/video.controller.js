import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import { Like } from "../models/like.model.js"
import {ApiError} from "../utils/apierror.js"
import {ApiResponse} from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import moment from "moment"
import { Subscription } from "../models/subscription.modles.js"


const getAllVideos = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId } = req.query;
  let { page = 1, limit = 12 } = req.query; // Use req.query instead of req.params
  page = parseInt(page); // Ensure page is a number

  const filter = {};
  if (query) filter.title = { $regex: query, $options: 'i' };
  if (userId) filter.owner = userId;

  let sort = {};
  if (sortBy && sortType === 'asc') sort[sortBy] = 1;
  if (sortBy && sortType === 'desc') sort[sortBy] = -1;
  if (!sortBy || !sortType) sort = { createdAt: -1 };

  const skip = (page - 1) * limit;

  const videos = await Video.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .exec();

  const totalVideosCount = await Video.countDocuments(filter);
  const totalPages = Math.ceil(totalVideosCount / limit);

  res.status(200).json(new ApiResponse(200, { videos, totalPages }, "Videos found"));
});

const Getsubscribervideos = asyncHandler(async(req,res)=>{
  const userId = req.user._id
  const subscriptios = await Subscription.find({ Subscriber : userId})

  const channelIds = subscriptios.map(Subscription => Subscription.channel);
  const videos = await Video.find({ owner: channelIds });

  if(!videos){
    throw new ApiError(400, "somwthing went wrong")
  }

  res.status(200).json(new ApiResponse(200, videos, "video find sucessfully"))

})



const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    

    if(!title || ! description){
        throw new ApiError(400,"provide title and description both")


    }

    
      
  
    // Process the uploaded files as needed
    const thumbnailLocalPath = req.files['thumbnail'][0].path;
    const videoLocalPath = req.files['videofile'][0].path;
   

    

    const videofile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const ownerId = req.user._id;

  


    const video =  await Video.create({
        title,
        duration : moment.duration(videofile, 'seconds'),
      
        owner : ownerId,
        description,
        thumbnail : thumbnail?.url || "",
        videofile : videofile.url


    })

  

    if (!video) {
      throw new ApiError(500, "something went wrong in publishing video");
    }

    return res.status(201).json(
        new ApiResponse(200, video,"video uploaded sucessfully")
    )

    


})
   



  




const getVideoById = asyncHandler(async (req, res, next) => {
    const { videoId } = req.params;
     const userId = req.user._id
  
    if (!mongoose.isValidObjectId(videoId)) {
      return next(new ApiError(400, "Invalid video ID"));
    }
  
    const video = await Video.findById(videoId);
  
    if (!video) {
      return next(new ApiError(400, "Video not found"));
    
    }
    const likedByCurrentUser = await Like.findOne({ video: videoId, likedBy:userId });
    const likestatus =   likedByCurrentUser ? true : false;
  
    res.status(200).json(new ApiResponse(200, video, "Video retrieved successfully"));
  });

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const {title, description, thumbnail} = req.body

    const update =  await Video.findByIdAndUpdate(videoId, {title, description,thumbnail}, {new : true})

    if(!update){
        throw new ApiError(400, " video not found")
    }

    res.status(200, update, "video updated sucessfully")



})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const deleteVideo = await Video.findByIdAndDelete(videoId)

    if(!deleteVideo){
        throw new ApiError(400, "unable to delete video")
    }

    res.status(200).json(new ApiResponse(200, {}, "video deleted sucessfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
  
    // Find the video by ID
    const video = await Video.findById(videoId);
  
    if (!video) {
      throw new ApiError(400, "Video not found");
    }
  
    // Toggle the publish status
    video.isPublished = !video.isPublished;
  
    // Save the updated video
    await video.save();
  
    res.status(200).json(new ApiResponse(200, video, "Video publish status updated successfully"));
  });

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    Getsubscribervideos
}