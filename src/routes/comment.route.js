import { Router } from 'express';
import {
    addComment,
    getVideoComments,
    deleteComment,
    updateComment,
    Tweetcomment,
    getTweetComments
} from "../contorller/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();



router.route("/v/:videoId").get(getVideoComments).post(verifyJWT,addComment);
router.route("/c/:commentId").delete(verifyJWT,deleteComment).patch(verifyJWT,updateComment);
router.route("/t/:TweetId").get(getTweetComments).post(verifyJWT, Tweetcomment)

export default router