import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getVideoById, publishVideo, updateVideo, deleteVideo, togglePublishStatus, getAllVideos } from "../controllers/video.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router()

router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file


router.route("/").get(getAllVideos)


router.route("/upload").post(
    upload.fields([
        {
            name: "video",
            maxCount: 1,
        },
        {
            name: "thumbnail",
            maxCount: 1,
        },
    ]),
    publishVideo
)

router
    .route("/:videoId")
    .get(getVideoById)
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(deleteVideo)


router.route("/toggle/publish/:videoId").patch(togglePublishStatus)


export default router