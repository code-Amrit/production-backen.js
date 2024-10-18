import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { countVideoDisLikes, toggleVideoDislike, toggleTweetDislike, countTweetDisLikes } from "../controllers/dislike.controller.js";


const router = Router();
router.use(verifyJWT);


router.route("/toggle/v/d/:videoId").post(toggleVideoDislike);
router.route("/toggle/t/d/:tweetId").post(toggleTweetDislike);

router.get("/v/dislikecount/:videoId", countVideoDisLikes);
router.get("/t/dislikecount/:tweetId", countTweetDisLikes);

export default router