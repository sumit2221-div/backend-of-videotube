import { Router } from 'express';
import {
    getLikedVideos,
    toggleCommentLike,
    toggleVideoLike,
    toggleTweetLike,
    getVideoAllLikes,
} from "../contorller/like.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();


router.route("/toggle/v/:videoId").post(verifyJWT,toggleVideoLike);
router.route("/toggle/c/:commentId").post(verifyJWT,toggleCommentLike);
router.route("/toggle/t/:tweetId").post(verifyJWT,toggleTweetLike);
router.route("/videos").get(getLikedVideos);
router.route("/v/:videoId").get(getVideoAllLikes)

export default router