import cloudinary from "../lib/cloudinary.js";
import Product from "../models/product.model.js";
import {redis} from "../lib/redis.js";
import { deleteCloudinaryImage } from "../utils/cloudinary.utils.js";
import { updateFeaturedProductsCache } from "../utils/redis.utils.js";

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ products });
    } catch (error) {
        console.error("[getAllProductsController]:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get featured products (with Redis cache)
export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await redis.get("featured_products");

        if (featuredProducts) {
            return res.json(JSON.parse(featuredProducts));
        }

        featuredProducts = await Product.find({ isFeatured: true }).lean();

        // ✅ Don't return 404 for empty results — return an empty array
        await redis.set("featured_products", JSON.stringify(featuredProducts));
        res.json(featuredProducts);
    } catch (error) {
        console.error("[getFeaturedProductsController]:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Create a new product
export const createProducts = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;

        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url || "",
            category,
        });

        res.status(201).json(product);
    } catch (error) {
        console.error("[createProductsController]:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete one or multiple products
export const deleteProduct = async (req, res) => {
    try {
        const { ids } = req.body;
        let shouldUpdateCache = false;

        // Bulk delete
        if (Array.isArray(ids) && ids.length > 0) {
            await Promise.all(
                ids.map(async (id) => {
                    const product = await Product.findById(id);
                    if (!product) return;

                    if (product.isFeatured) {
                        shouldUpdateCache = true;
                    }

                    if (product.image) {
                        await deleteCloudinaryImage(product.image);
                    }

                    await Product.findByIdAndDelete(id);
                })
            );

            if (shouldUpdateCache) {
                await updateFeaturedProductsCache();
            }

            return res.json({ message: "Selected products deleted successfully" });
        }

        // Single delete
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Product ID is required for deletion" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.isFeatured) {
            shouldUpdateCache = true;
        }

        if (product.image) {
            await deleteCloudinaryImage(product.image);
        }

        await Product.findByIdAndDelete(id);

        if (shouldUpdateCache) {
            await updateFeaturedProductsCache();
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("[deleteProductController]:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
    try {
        const { name, description, price, image, category, isFeatured } = req.body;
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const wasFeatured = product.isFeatured;

        // Image update
        let imageUrl = product.image;
        if (image && image !== product.image) {
            if (product.image) {
                await deleteCloudinaryImage(product.image);
            }

            const cloudinaryResponse = await cloudinary.uploader.upload(image, {
                folder: "products",
            });

            imageUrl = cloudinaryResponse.secure_url;
        }

        // Update fields
        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.price = price ?? product.price;
        product.category = category ?? product.category;
        product.image = imageUrl;
        product.isFeatured = isFeatured ?? product.isFeatured;

        const updatedProduct = await product.save();

        // Only refresh cache if featured status changed
        if (wasFeatured !== product.isFeatured) {
            await updateFeaturedProductsCache();
        }

        res.json(updatedProduct);
    } catch (error) {
        console.error("[updateProductController]:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Toggle featured flag
export const toggleFeaturedProducts = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isFeatured = !product.isFeatured;
        await product.save();

        await updateFeaturedProductsCache();

        res.status(200).json({
            message: `Product isFeatured status toggled to ${product.isFeatured}`,
            product
        });
    } catch (error) {
        console.error("[toggleFeaturedProductsController]:", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get 3 random recommended products
export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 3 } },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1
                }
            }
        ]);
        res.json(products);
    } catch (error) {
        console.error('[recommendedProductController]:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;

        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const products = await Product.find({ category });

        res.status(200).json(products);
    } catch (error) {
        console.error('[getProductsByCategoryController]:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
