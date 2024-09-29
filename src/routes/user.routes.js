import { Router } from "express";
import { registerUser } from "../controllers/user.controller.js";

const router = Router()


router.route("/register").post(registerUser)
// router.route("/login").post(login)



//je is taran export karia tan import vich apna maan chaha naam de sakde ne
export default router