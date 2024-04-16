import  express  from "express";
import cookieParser from "cookie-parser";
import cors from "cors"

const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN ,
    credentials:true
}))

app.use(express.json({limit : "500kb"}))
app.use(express.urlencoded({extended : true, limit : "500kb"}))
app.use(express.static("public"))
app.use(cookieParser())

import  userRouter from "./routes/user.routes.js";
import videoRouter from "./routes/video.router.js";
import tweetRouter from "./routes/tweet.route.js";
import playlistRouter from "./routes/playlist.router.js";
import likeRouter from "./routes/like.router.js";
import commentRouter from "./routes/comment.route.js";
import subscriberRoute from "./routes/subscription.route.js"



app.use("/api/v1/users", userRouter)
app.use("/api/v1/video", videoRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/like", likeRouter)
app.use("/api/v1/comment", commentRouter)
app.use("api/v1/subscription", subscriberRoute)


export {app}