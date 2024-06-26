import { Router } from 'express';
import {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    Getsubscribervideos
}
 from "../contorller/video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();


router
    .route("/")
    .get(getAllVideos)
    .post(
        verifyJWT,
        upload.fields([
            {
                name: "videofile"
            
        
            }, {
                name: "thumbnail",
                maxCount : 1, 
                
            },
            
        ]),
        publishAVideo
    );

router
    .route("/:videoId")
    .get(getVideoById)
    .delete(verifyJWT,deleteVideo)
    .patch(upload.single("thumbnail"),verifyJWT, updateVideo);

router.route("/toggle/publish/:videoId").patch(togglePublishStatus);
router.route("/v/subscriber").get(verifyJWT,Getsubscribervideos)

export default router