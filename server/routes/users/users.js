import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import User from "../../models/users.js";
import Order from "../../models/orders.js";
import redirectIfLoggedIn from "../../middlewares/redirectIfLoggedIn.js";
import redirectIfNotLoggedIn from "../../middlewares/redirectIfNotLoggedIn.js";

const authRouter = express.Router();

// Render login and register pages
authRouter.get("/login", redirectIfLoggedIn, (req, res) => {
    res.render("auth/login");
});

authRouter.get("/registration", redirectIfLoggedIn, (req, res) => {
    res.render("auth/registration");
});

// Handle user registration
authRouter.post("/registration", async (req, res) => {
    console.log("= Incoming data:", req.body); // Check received values
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

authRouter.get("/profile", redirectIfNotLoggedIn, async (req, res) => {
  try {
    if (!req.session.user || !req.session.user.id) {
      return res.redirect("/auth/login");
    }

    const userId = new mongoose.Types.ObjectId(req.session.user.id);

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found.");
    }

    const orders = await Order.find({ user_id: userId })
      .populate("items.productId")
      .sort({ order_date: -1 });

    console.log("User ID:", userId.toString());
    console.log("Orders found for user:", orders.length);

    res.render("users/profile", {
      user,
      orders
    });

  } catch (error) {
    console.error("Error loading profile:", error);
    res.status(500).send("Server error loading profile.");
  }
});

authRouter.post("/profile/update", redirectIfNotLoggedIn, async (req, res) => {
  const { fullName, email, address, phone } = req.body;
  try {
    await User.findByIdAndUpdate(req.session.user.id, {
      fullName,
      email,
      address,
      phone
    });
    req.session.user.fullName = fullName;
    req.session.user.email = email;
    req.session.user.address = address;
    req.session.user.phone = phone;
    res.redirect("/profile");
  } catch (err) {
    console.error("Failed to update profile:", err);
    res.status(500).send("Failed to update profile");
  }
});

authRouter.post("/profile/password", redirectIfNotLoggedIn, async (req, res) => {
  const userId = req.session.user.id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.status(400).send("Passwords do not match");
  }

  try {
    const user = await User.findById(userId);
    const match = await bcrypt.compare(currentPassword, user.password);

    if (!match) return res.status(403).send("Current password is incorrect");

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.redirect("/profile");
  } catch (err) {
    console.error("Password change error:", err);
    res.status(500).send("Error changing password");
  }
});

// Handle user logout
authRouter.post("/logout", redirectIfNotLoggedIn, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send("Logout failed");
    }

    res.redirect("/auth/login"); // Redirect to login for both user and admin
  });
});

export default authRouter;