const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Import Routes
const authRoute = require("./Routes/AuthRoute");
const applicationRoute = require("./Routes/ApplicationRoute");
const appClientRoute = require("./Routes/AppClientRoute");
const teamRoute = require("./Routes/TeamRoute");

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
app.use("/api/v1/applications", applicationRoute);
app.use("/api/v1/applications/:appId/team", teamRoute);
app.use("/api/v1/client", appClientRoute);

module.exports = app;
