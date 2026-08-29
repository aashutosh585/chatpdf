import express from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/user.js"
import { isAuth } from "../middleware/isAuth.js"

const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists with this email"
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword
        });

        console.log('Creating user:', { name: user.name, email: user.email });
        await user.save();
        console.log('User created successfully:', user._id);

        // Generate JWT token
        console.log('SECRET_KEY available:', !!process.env.SECRET_KEY);
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET_KEY || 'fallback_secret_key',
            { expiresIn: "7d" }
        );
        console.log('JWT token generated successfully');

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Login user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found. Please sign up first."
            });
        }

        // Check password
        console.log('Checking password for user:', user.email);
        const isPasswordValid = await user.comparePassword(password);
        console.log('Password valid:', isPasswordValid);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid password. Please try again."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.SECRET_KEY || 'fallback_secret_key',
            { expiresIn: "7d" }
        );
        console.log('Login successful for user:', user.email);

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Get current user
router.get("/me", isAuth, (req, res) => {
    console.log("Auth /me called, user:", req.user);
    res.json({
        success: true,
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
});

// Logout
router.post("/logout", isAuth, async (req, res) => {
    try {
        res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router