import {asyncHandler} from "../utils/asyncHandler.js"
import {ApiError} from '../utils/ApiError.js'
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/Cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


const registerUser = asyncHandler(async (req,res)=>{
   // get user details from frontend
   // validation - not empty
   // check if user already exists -username, email
   // images is there or not, check avatar
   // upload them to cloudinary, avatar
   // create user object - create entry in db
   // remove password and refresh token field from response
   // check for user creation in response
   // hogya to return response
   


   const {fullName, email, username, password}=req.body
//    console.log(
//     "email:",email,
//     "fullName:",fullName,
//     "username:",username,
//     "password:",password
   
//    );
    //   console.log(req.body);

if(
    [fullName,email,username,password].some((field)=> field?.trim() === "")
){
    throw new ApiError (400, "All field are required")
}
//email validation
//  if(!email.includes("@") || !email.includes(".")){
//     throw new ApiError (401, "Use proper email")
//  }
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    throw new ApiError(401, "Use proper email");
}
//    if(fullName === ""){
//      throw new ApiError(400,"fullname is required")
//    }


//checking if user exists on our db
const existedUser = await User.findOne({
    $or: [{ username },{ email }]
})

    if (existedUser) {
        throw new ApiError(409, "User with same email or username already exists")
    }


    // console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required")
    }
//cloudinary upload
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400,"Avatar file is required !")
    }

// create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User registered Successfully")
    )
    


    // res.status(200).json({
    //     message: "ok"
    // })
})


//je is taran export karia tan import vich apna maan chaha naam nhi de sakde
export {registerUser}