import Product from "../models/product.model.js";

export const addTocart = async (req, res) => {
    try {
        const { productID } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(item => item.id === productID);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ id: productID, quantity: 1 });
        }

        await user.save();
        res.status(200).json(user.cartItems);
    } catch (error) {
        console.error("[ErroraddToCartController]", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const removeAllFromcart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(item => item.id !== productId);
        }

        await user.save();
        res.json(user.cartItems);
    } catch (error) {
        console.error("[ErrorremoveAllFromcartController]", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params;
        const { quantity } = req.body;
        const user = req.user;

        const existingItem = user.cartItems.find(item => item.id === productId);

        if (existingItem) {
            if (quantity === 0) {
                user.cartItems = user.cartItems.filter(item => item.id !== productId);
                await user.save();
                return res.json(user.cartItems);
            }
            existingItem.quantity = quantity;
            await user.save();
            res.json(user.cartItems);
        } else {
            res.status(404).json({ message: "product not found" });
        }
    } catch (error) {
        console.error("[ErrorupdateQuantityController]", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const getCartProducts = async (req, res) => {
    try {
        const cartItemIDs = req.user.cartItems.map(item => item.id);
        const products = await Product.find({ _id: { $in: cartItemIDs } });

        const cartItems = products.map(product => {
            const item = req.user.cartItems.find(cartItem => cartItem.id === product.id);
            return {
                ...product.toJSON(),
                quantity: item?.quantity || 0
            };
        });

        res.json(cartItems);
    } catch (error) {
        console.error("[ErrorgetCartProductsController]", error.message);
        res.status(500).json({ message: error.message });
    }
};
