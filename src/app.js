import cookieParser from 'cookie-parser'
import express from 'express'
import cors from 'cors'

const app =express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

//config karna hai // pehle body parser use hota tha // multer se file uploading
app.use(express.json({limit: "16kb"}))

//url se data aye to ye use karo kyonki google/amritpal Singh => google/amritpal%20Singh //extended means obj ke andar obj optional
app.use(express.urlencoded({extended: true, limit:"16kb"}))

//files folder store rakhna chahata hun 
app.use(express.static("public"))

app.use(cookieParser())


//routes import
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import subscriptionRouter from "./routes/subscription.routes.js"
import likeRouter from "./routes/like.routes.js"
// import dislikeRouter from "./routes/dislike.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import commentRouter from "./routes/comment.routes.js"
import tweetRouter from "./routes/tweet.routes.js"
import healthcheckRouter from "./routes/healthcheck.routes.js"
// import dashboardRouter from "./routes/dashboard.routes.js"



//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/likes", likeRouter)
// app.use("/api/v1/dislikes", dislikeRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/tweets", tweetRouter)
app.use("/api/v1/healthcheck", healthcheckRouter)
// app.use("/api/v1/dashboard", dashboardRouter)

// http://localhost:8000/api/v1/users/register


export {app}