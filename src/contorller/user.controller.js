import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apierror.js";
import {User}  from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudnary.js"
import {ApiResponse} from "../utils/apiresponse.js"
import  Jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const RegisterUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;
  
    if (
      [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
      throw new ApiError(400, "All fields are required");
    }
  
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });
  
    if (existedUser) {
      throw new ApiError(409, "User with email or username already exists");
    }
  
    const files = req.files;
    
  
    const avatarLocalPath = files.avatar[0].path;
    //const coverImageLocalPath = files.coverImage[0].path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    
  
    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");


    }
  
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage =  await uploadOnCloudinary(coverImageLocalPath);
  
    if (!avatar) {
      throw new ApiError(400, "Error while uploading avatar");
    }
   
  
    const user = await User.create({
      fullName,
      avatar: avatar.url ,
     coverImage: coverImage.url ,
      email,
      password,
      username: username.toLowerCase(),
    });
  
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
  
    if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user");
    }
  
    return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
    );
  });


const LoginUser = asyncHandler(async (req, res) => {

    const {email, password} = req.body
    if(!email && !password){
        throw new ApiError(400,"email or password is required")
    }

    const user= await  User.findOne({email})

    if(!user){
        throw new ApiError(404,"user does not exist")
    }


  const isPasswordvalid =  await  user.isPasswordCorrect(password)
  if(!isPasswordvalid){
    throw new ApiError(401,"invalid password")
  }
 const {accessToken,refreshToken}=await generateAccessAndRefereshTokens(user._id)

 const loggedinuser = await User.findById(user._id).

 select("-password -refreshToken")
 const option= {
    httponly:true,
    secure : true
 }
 return res
    .status(200)
    .cookie("accessToken", accessToken, option)
    .cookie("refreshToken", refreshToken, option)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedinuser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

const logoutuser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAcessToken =  asyncHandler(async(req, res)=> {
     const incomingRefreshToken = req.cookies.refreshToken  || req.body.refreshToken
    if(!incomingRefreshToken) {
        throw new ApiError(401, "unauthrized request")
    }

        try {
            const decodedToken = Jwt.verify(
                incomingRefreshToken,
                process.env.REFRESH_TOKEN_SECRET
            )
        
            const user = await User.findById(decodedToken?._id)
        
            if (!user) {
                throw new ApiError(401, "Invalid refresh token")
            }
        
            if (incomingRefreshToken !== user?.refreshToken) {
                throw new ApiError(401, "Refresh token is expired or used")
                
            }
        
            const options = {
                httpOnly: true,
                secure: true
            }
        
            const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
        
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {accessToken, refreshToken: newRefreshToken},
            "Access token refreshed"
        )
    )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token")
}

})

const changecurrentpassword = asyncHandler(async(req, res)=>{
    const {oldpassword , newpassword} = req.body
    const user =  await User.findById(req.user?._id)
   const ispasswordcorrect=  await  user.isPasswordCorrect(oldpassword)

   if(!ispasswordcorrect){
    throw new ApiError(400,"invalid old password")
   }
   user.password = newpassword
   await user.save({validateBeforeSave : false})
   return res.status(200)
   .json(new ApiResponse(200, {}, "password change sucessfully"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})
const getuserById = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
  
    if (!mongoose.isValidObjectId(userId)) {
      return next(new ApiError(400, "Invalid user ID"));
    }
  
    const user = await User.findById(userId);
  
    if (!user) {
      return next(new ApiError(400, "user not found"));
    }
  
    res.status(200).json(new ApiResponse(200, user, "user found successfully"));
  });


const updateaccountdetail = asyncHandler(async(req, res)=> {
    const {fullName, email} = req.body
    if(!fullName  || !email){
        throw new ApiError(400,"all field are required")
    }
    User.findByIdAndUpdate(
        req.user?._id,{
            $set :  
                fullName,
                email : email



            },
            {new : true}

        ).select("-password")

        return res.status(200)
        .json(new ApiResponse(200, User, "account updated sucessfully"))
    }

)

const updateUserAvatar =  asyncHandler(async(req, res) => {

    const avatarLocalPath = req.file?.path

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar file is missing")


    }
    const avatar =  await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"error while uploading avatar")
    }
     await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                avatar : avatar.url
            }
        },
        {new : true}
     ).select("-password")

     return res
     .status(200)
     .json(new ApiResponse(200, "avatar updates sucessfully"))

})
const updateUsercoverimage =  asyncHandler(async(req, res) => {

    const coverImageLocalPath = req.file?.path

    if(!coverImageLocalPath){
        throw new ApiError(400, "coverimage file is missing")


    }
    const coverImage =  await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"error while uploading coverimage")
    }
     await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set : {
                coverImage: coverImage.url
            }
        },
        {new : true}
     ).select("-password")
     return res
     .status(200)
     .json(new ApiResponse(200, "coverimage updates sucessfully"))


})
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
  
    if (!userId) {
      throw new ApiError(400, "User is missing");
    }
  
    // Ensure the userId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid User ID");
    }
  
    const channel = await User.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "channel",
          as: "subscribers"
        }
      },
      {
        $lookup: {
          from: "subscriptions",
          localField: "_id",
          foreignField: "subscriber",
          as: "subscribedTo"
        }
      },
      {
        $addFields: {
          subscribersCount: { $size: "$subscribers" },
          channelsSubscribedToCount: { $size: "$subscribedTo" },
          isSubscribed: {
            $cond: {
              if: { $in: [new mongoose.Types.ObjectId(req.user?._id), "$subscribers.subscriber"] },
              then: true,
              else: false
            }
          }
        }
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "owner",
          as: "uploadedVideos"
        }
      },
      {
        $addFields: {
          uploadedVideosCount: { $size: "$uploadedVideos" }
        }
      },
      {
        $project: {
          fullName: 1,
          username: 1,
          subscribersCount: 1,
          channelsSubscribedToCount: 1,
          isSubscribed: 1,
          avatar: 1,
          coverImage: 1,
          email: 1,
          uploadedVideosCount: 1,
          uploadedVideos: 1
        }
      }
    ]);
  
    if (!channel.length) {
      throw new ApiError(404, "Channel does not exist");
    }

  
    return res.status(200).json(new ApiResponse(200, channel[0], "User channel fetched successfully"));
  });
  
const getWatchHistory = asyncHandler(async(req, res) => {
    try {
        // 1. Ensure req.user exists and has a valid _id
        if (!req.user || !req.user._id) {
            return res.status(400).json(new ApiResponse(400, null, "Invalid user"));
        }

        // 2. Use aggregation pipeline to fetch user's watch history with video details
        const user = await User.aggregate([
            {
                $match: {
                    _id:  new mongoose.Types.ObjectId(req.user._id) // Use mongoose.Types.ObjectId directly
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory"
                }
            },
            {
                $unwind: "$watchHistory" // Unwind watchHistory array if needed
            },
            {
                $lookup: {
                    from: "users",
                    localField: "watchHistory.owner",
                    foreignField: "_id",
                    as: "owner"
                }
            },
            {
                $addFields: {
                    "watchHistory.owner": { $arrayElemAt: ["$owner", 0] } // Get the first element from owner array
                }
            },
            {
                $project: {
                    "_id": 0, // Exclude _id field
                    "watchHistory._id": 0, // Exclude _id field from nested watchHistory
                    "owner": 0 // Exclude owner array
                }
            }
        ]);

        // 3. Check if user watch history is empty
        if (!user || user.length === 0 || !user[0].watchHistory) {
            return res.status(404).json(new ApiResponse(404, null, "Watch history not found"));
        }

        // 4. Return watch history with success response
        return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
    } catch (error) {
        // 5. Handle errors
        console.error("Error fetching watch history:", error);
        return res.status(500).json(new ApiResponse(500, null, "Internal server error"));
    }
});




 export { RegisterUser,
 LoginUser,
 logoutuser,
 refreshAcessToken,
 changecurrentpassword,
 getCurrentUser,
 updateaccountdetail,
 updateUserAvatar,
 updateUsercoverimage,
 getWatchHistory,
 getUserChannelProfile,
 getuserById
 
 }
 