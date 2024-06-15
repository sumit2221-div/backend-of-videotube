import { Router } from 'express';
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    Getsubscribervideos
} from "../contorller/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
    .route("/")
    .get(getAllVideos)
    .post(
        verifyJWT, // Apply verifyJWT middleware to this route
        upload.fields([
            {
                name: "videofile"
            }, 
            {
                name: "thumbnail",
                maxCount: 1,
            }
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(verifyJWT, deleteVideo) // Apply verifyJWT middleware to this route
    .patch(verifyJWT, upload.single("thumbnail"), updateVideo); // Apply verifyJWT middleware to this route

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus); // Apply verifyJWT middleware to this route
router.route("/v/subscriber").get(verifyJWT, Getsubscribervideos); // Apply verifyJWT middleware to this route

export default router;
