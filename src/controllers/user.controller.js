import {asyncHandler} from "../utils/asyncHandler.js"

const registerUser = asyncHandler(async (req,res)=>{
    res.status(200).json({
        message: "ok"
    })
})


//je is taran export karia tan import vich apna maan chaha naam nhi de sakde
export {registerUser}