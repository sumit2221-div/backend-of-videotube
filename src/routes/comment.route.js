import { Router } from 'express';
import {
    addComment,
    getVideoComments,
    deleteComment,
    updateComment
} from "../contorller/comment.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();



router.route("/:videoId").get(getVideoComments).post(verifyJWT,addComment);
router.route("/c/:commentId").delete(verifyJWT,deleteComment).patch(verifyJWT,updateComment);

export default router