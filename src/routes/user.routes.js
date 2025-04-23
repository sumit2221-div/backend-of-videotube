import { Router } from "express";
import   {RegisterUser,
    LoginUser,
    logoutuser,
    refreshAcessToken,
    changecurrentpassword,
    getCurrentUser,
    getUserChannelDetails,

 
 

    getuserById}  from "../contorller/user.controller.js"
    import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    RegisterUser)

    router.route("/login").post(LoginUser)

    router.route("/logout").post(verifyJWT,  logoutuser)
    router.route("/refresh-token").post(refreshAcessToken)
    
router.route("/change-password").post(verifyJWT, changecurrentpassword)
router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/:userId").get( getuserById)
router.route("/c/:userId").get(verifyJWT, getUserChannelDetails)





export default router