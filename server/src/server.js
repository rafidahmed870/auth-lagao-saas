const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import Routes
const authRoute = require("./Routes/AuthRoute");

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
        "http://localhost:5173", 
        "http://localhost:3000"
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

/* USE ROUTES */
app.use("/api/v1/auth", authRoute);

module.exports = app;
