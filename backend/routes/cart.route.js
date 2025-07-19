import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getCartProducts,addTocart,removeAllFromcart, updateQuantity } from "../controllers/cart.controller.js";

const router =express.Router();
router.get("/",protectRoute,getCartProducts);
router.post("/",protectRoute,addTocart);
router.delete("/",protectRoute,removeAllFromcart);
router.put("/:id",protectRoute,updateQuantity);



export default router