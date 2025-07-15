import express from "express";
import { getAllProducts,getFeaturedProducts} from "../controllers/product.controller.js";
import { protectRoute,adminRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();
router.get("/",protectRoute,adminRoute,getAllProducts);
router.get("/featured",getFeaturedProducts);
// router.post("/",getFeaturedProducts);



export default router;