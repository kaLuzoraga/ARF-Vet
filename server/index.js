import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connect from "./database/mongodb-connect.js";

const port = process.env.PORT || 3000;
const app = express();

app.get("/", (req, res) => {
  res.send("Hello Todo App!!!");
});

// Connect DB
connect();

app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});