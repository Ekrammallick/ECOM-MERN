import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware";

import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controller";
const router = Router();

router.post("/create-checkout-session", protectRoute,createCheckoutSession);
router.post("/checkout-success", protectRoute,checkoutSuccess);

export default router;
