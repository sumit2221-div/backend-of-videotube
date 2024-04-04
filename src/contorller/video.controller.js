import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apierror.js"
import {ApiResponse} from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import moment from "moment"


const getAllVideos = asyncHandler(async (req, res) => {
  const { query, sortBy, sortType, userId, page = 1, limit = 10 } = req.query;
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
  
    if (!mongoose.isValidObjectId(videoId)) {
      return next(new ApiError(400, "Invalid video ID"));
    }
  
    const video = await Video.findById(videoId);
  
    if (!video) {
      return next(new ApiError(400, "Video not found"));
    }
  
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
    togglePublishStatus
}