import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"


const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,  // faltu spaces end krne ke liye
            index: true, //searching
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        avatar: {
            type: String, //cloudinary url
            required: true,
        },
        coverImage: {
          type: String, //cloudinary url  
        },
        watchHistory: [
            {
                type: Schema.type.objectId,
                ref: "Video",
            }
        ],
        password: {
            type: String,
            required: [true,'Password is required'],
            trim: true,
        },
        refreshToken: {
            type: String,
        }


    }
,{timestamps: true})

//kyon ki middleware hai is lyi next() use karna last ch to flag next process and
// arrow func ni use hunda as callback here kyonki usko context ni pata hunda this ch
userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password, this.password) //true or false deta hai
}

userSchema.methods.generateAccessToken = function(){
     return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){

    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )

}


export const User = mongoose.model("User",userSchema)