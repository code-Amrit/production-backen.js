import mongoose from "mongoose";

const dislikeSchema = new mongoose.Schema({

    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video"
    },
    comment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },
    tweet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
    },
    
    dislikedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }

},{timestamps: true})


export const Dislike = mongoose.model("Dislike", dislikeSchema)