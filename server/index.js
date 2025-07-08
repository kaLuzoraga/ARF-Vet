import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import connect from "./database/mongodb-connect.js";
import authRouter from "./routes/users/users.js";
import path from "path";
import { fileURLToPath } from "url";

// For __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
const app = express();

// Connect DB
connect();

// Middleware for JSON and URL Encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || "secret123",  // .env recommended
  resave: false,
  saveUninitialized: false
}));

// Static files (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public")));

// View engine (EJS)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Auth routes
app.use("/auth", authRouter);

// Default route (optional)
app.get("/", (req, res) => {
  res.redirect("/auth/registration");
});

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});