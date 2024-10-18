import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
  getLikedVideos,
  countVideoLikes,
  countCommentLikes,
  countTweetLikes,
} from "../controllers/like.controller.js";

const router = Router();
router.use(verifyJWT);

router.route("/toggle/v/:videoId").post(toggleVideoLike);
router.route("/toggle/c/:commentId").post(toggleCommentLike);
router.route("/toggle/t/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getLikedVideos);

router.get("/v/likecount/:videoId", countVideoLikes);
router.get("/c/likecount/:commentId", countCommentLikes);
router.get("/t/likecount/:tweetId", countTweetLikes);


export default router;
