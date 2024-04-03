import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/apierror.js"
import {ApiResponse} from "../utils/apiresponse.js"
import asyncHandler from "../utils/asyncHandler.js"
import { app } from "../app.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    const userId =  req.user._id;

    const newplaylist = await Playlist.create({

        name,
        description,
        owner : userId

    })

    if(!newplaylist){
        throw new ApiError(500, "something went wrong while creating playlist")
    }

    res.status(200).json(new ApiResponse(200,{newplaylist}, "playlist created sucessfully"))

    
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const userplaylist = await Playlist.find({owner : userId})
    .populate('videos', 'title')
    .exec()

    if(userplaylist.length === 0){
        throw new ApiError(400, "no playlist found")
    }

    res.status(200).json(new ApiResponse(200,{userplaylist}, "userplaylist retrive scuessfully"))
      
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(200, "playlist not found")
    }

    res.status(200).json(new ApiResponse(200,{playlist}, "playlist fetch sucessfully"))


   
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params


    if(!playlistId || !videoId){
        throw new ApiError(400, "invalid videoid or playlistid")
    }

const video =  await Video.findById(videoId)


  

    const addedvideo = await Playlist.findByIdAndUpdate(playlistId);

    // Add the video details to the playlist
    addedvideo.videos.push(video._id);
    
    // Save the updated playlist
    await addedvideo.save();
    

    if(!addedvideo){
        throw new ApiError(400, "something went wrong while adding video on playlist")
    }

    res.status(200).json(new ApiResponse(200,{addedvideo}, "video added sucessfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId || !videoId){
        throw new ApiError(400, "invalid videoid or playlistid")
    }

    const video =  await Video.findById(videoId)

    

    const removedvideo = await Playlist.findByIdAndUpdate(playlistId);


    removedvideo.videos.pull(Video._id);
    
    await removedvideo.save();
    

    if(!removedvideo){
        throw new ApiError(400, "something went wrong while removing video on playlist")
    }

    res.status(200).json(new ApiResponse(200,{}, "video removed sucessfully"))
})



const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid playlist id")
    }

    const deletePlay = await Playlist.findByIdAndDelete(playlistId);

    if(!deletePlay){
        throw new ApiError(400, "something went wrong while deleting this playlist")
    }

    res.status(200).json(200, {deletePlay}, "playlist deleted sucessfully")

})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlistId!");
    }

    const updatedplaylist = await Playlist.findByIdAndUpdate(playlistId, {
      $set: {
            name,
            description
        }
      })

      if(!updatedplaylist){
        throw new ApiError(400, "something went wrong while updating playlist")

      }

      res.status(200).json(200, {},"playlist updated sucessfully")
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}