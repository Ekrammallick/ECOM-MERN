import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { signup, login, logout, token,getProfile} from '../controllers/auth.controller.js';
const router = Router();

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/token",token)
router.get("/profile", protectRoute, getProfile);

export default router;


