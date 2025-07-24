import User from "../models/user.model.js";
import { redis } from "../lib/redis.js";
import jwt from "jsonwebtoken";

const generateTokens = async (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 60 * 60 * 24); // 7 Days
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // xss
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // CSRF
        maxAge: 15 * 60 * 1000, // 15 minutes
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // xss
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// Signup function
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const userCheck = await User.findOne({ email });
        if (userCheck) {
            return res.status(400).json({ message: "User Already Exists" });
        }

        const user = await User.create({ name, email, password });
        if (user) {
            const { accessToken, refreshToken } = await generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            return res.status(201).json({
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                message: "Successfully signed up",
            });
        }
    } catch (error) {
        console.error("Error during signup:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Login function
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const checkPassword = await user.comparePassword(password);
        if (checkPassword) {
            const { accessToken, refreshToken } = await generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);

            return res.status(200).json({
                user: { id: user._id, name: user.name, email: user.email, role: user.role },
                message: "Successfully Logged In",
            });
        } else {
            return res.status(400).json({ message: "Invalid Credentials" });
        }
    } catch (error) {
        console.error("Error during login:", error.message);
        res.status(500).json({ message: error.message });
    }
};

// Logout function
export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decodedRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refresh_token:${decodedRefreshToken.userId}`);
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            return res.status(200).json({ message: "Logout Successfully" });
        } else {
            return res.status(404).json({ message: "Tokens Not Found" });
        }
    } catch (error) {
        console.error("Error during logout:", error.message);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// Token refresh function
export const token = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token found" });
        }

        const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const redisStoredToken = await redis.get(`refresh_token:${decodedToken.userId}`);
        if (decodedToken !== redisStoredToken) {
            return res.status(400).json({ message: "Invalid Token" });
        }

        const accessToken = jwt.sign({ userId: decodedToken.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
        res.cookie("accessToken", accessToken, {
            httpOnly: true, // xss
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict", // CSRF
            maxAge: 15 * 60 * 1000, // 15 minutes
        });

        return res.json({ message: "Token refreshed successfully" });
    } catch (error) {
        console.error("Error in token controller:", error.message);
        res.status(500).json({ message: "Server Error in Token Controller", error: error.message });
    }
};
export const getProfile = async (req, res) => {
	try {
		res.json(req.user);
	} catch (error) {
		res.status(500).json({ message: "Server error", error: error.message });
	}
};