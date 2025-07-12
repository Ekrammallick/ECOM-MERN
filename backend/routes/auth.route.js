import { Router } from "express";
import { signup, login, logout, token } from '../controllers/auth.controller.js';
const router = Router();

router.post("/signup",signup)
router.post("/login",login)
router.post("/logout",logout)
router.post("/token",token)

export default router;


