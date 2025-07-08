import express from "express";
import bcrypt from "bcrypt";
import User from "../../models/users.js";


const authRouter = express.Router();

// Render login and register pages
authRouter.get("/login", (req, res) => {
    res.render("auth/login");
});

authRouter.get("/registration", (req, res) => {
    res.render("auth/registration");
});

// Handle user registration
authRouter.post("/registration", async (req, res) => {
    console.log("📦 Incoming data:", req.body); // ✅ check received values
    const {
        userType,
        fullName,
        email,
        phone,
        password,
        address
    } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            userType,
            fullName,
            email,
            phone,
            password: hashedPassword,
            address,
        });

        console.log("new user _id")

        res.status(201).json({
            message: "User created successfully",
            userId: newUser._id
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Registration failed",
            error: error.message,
        });
    }
});

// Handle user login
authRouter.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Store in server session
        req.session.user = {
            id: user._id,
            name: user.fullName,
            email: user.email,
            userType: user.userType
        };

        console.log("User session after login:", req.session.user); // Debugging line to check session data

        // Store back to frontend
        res.status(200).json({
            message: "Login successful",
            user: {
                id: user._id,
                name: user.fullName,
                email: user.email,
                userType: user.userType
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


// Handle user logout
authRouter.post("/logout", (req, res) => {
    req.session?.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
    });
});

export default authRouter;