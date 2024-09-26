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

export {app}