import express from "express";
import User from "../../../models/users.js";
import bcrypt from "bcrypt";

const router = express.Router();

// GET all users (excluding passwords)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// POST create new user
router.post("/", async (req, res) => {
  const { fullName, email, password, address, phone, userType } = req.body;

  if (!fullName || !email || !password || !address || !phone || !userType) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
      address,
      phone,
      userType,
      isMainAdmin: false,
    });

    await newUser.save();
    res.status(201).json({ message: "User created." });
  } catch (err) {
    res.status(500).json({ error: "Failed to save user." });
  }
});

// PUT update user
router.put("/:id", async (req, res) => {
  const { fullName, email, password, address, phone, userType } = req.body;

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    user.fullName = fullName;
    user.email = email;
    user.address = address;
    user.phone = phone;
    user.userType = userType;

    if (password && password.length >= 6) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();
    res.json({ message: "User updated." });
  } catch (err) {
    res.status(500).json({ error: "Failed to update user." });
  }
});

// DELETE user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    if (user.isMainAdmin) return res.status(403).json({ error: "Cannot delete main admin." });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user." });
  }
});

export default router;
