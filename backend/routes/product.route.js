import express from "express";
import {
  createProducts,
  getAllProducts,
  getFeaturedProducts,
  deleteProduct,  // Unified delete
  updateProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProducts
} from "../controllers/product.controller.js";
import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured-products", getFeaturedProducts);
router.get("/recommended-products", getRecommendedProducts);
router.get("/category/:category",getProductsByCategory);
router.post("/create-product", protectRoute, adminRoute, createProducts);
router.put("/:id", protectRoute, adminRoute, updateProduct);
router.patch("/:id", protectRoute, adminRoute, toggleFeaturedProducts);
router.delete("/:id?", protectRoute, adminRoute, deleteProduct); // ? makes :id optional for bulk

export default router;
