import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    updateTweet,
    getUserTweets,
    getAllTweets
} from "../contorller/tweet.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router
    .route("/")
    .get(getAllTweets)
    .post(verifyJWT, upload.single("picture"), createTweet); // Apply verifyJWT middleware to this route

router
    .route("/user/:userId")
    .get(getUserTweets); // No verifyJWT middleware for this route

router
    .route("/:tweetId")
    .patch(verifyJWT, updateTweet) // Apply verifyJWT middleware to this route
    .delete(verifyJWT, deleteTweet); // Apply verifyJWT middleware to this route

export default router;
