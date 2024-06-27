import { Router } from "express";
import   {RegisterUser,
    LoginUser,
    logoutuser,
    refreshAcessToken,
    changecurrentpassword,
    getCurrentUser,
    updateaccountdetail,
    updateUserAvatar,
    updateUsercoverimage,
    getUserChannelProfile,
    getWatchHistory,
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
router.route("/update-account").patch(verifyJWT, updateaccountdetail)
router.route("/:userId").get( getuserById)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/coverImage").patch( upload.single("coverImage"),verifyJWT, updateUsercoverimage)

router.route("/c/:userId").get(getUserChannelProfile)
router.route("/v/history").get(verifyJWT, getWatchHistory)


export default router