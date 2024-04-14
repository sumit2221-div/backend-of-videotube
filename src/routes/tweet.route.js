import { Router } from 'express';
import {createTweet,deleteTweet,updateTweet,getUserTweets, getAllTweets} from "../contorller/tweet.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import { upload } from '../middlewares/multer.middleware.js';
const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/").get(getAllTweets)
.post(upload.single("picture"),createTweet);
router.route("/user/:userId").get(getUserTweets);
router.route("/:tweetId").patch(updateTweet).delete(deleteTweet);

 export default router