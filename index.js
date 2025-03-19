const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());

// Load environment variables
const SECRET_KEY = process.env.SECRET_KEY;
const APP_ID = process.env.APP_ID;
const APP_SIGN = process.env.APP_SIGN;

if (!SECRET_KEY || !APP_ID || !APP_SIGN) {
    console.error("Missing required environment variables. Please set SECRET_KEY, APP_ID, and APP_SIGN.");
    process.exit(1);
}

 app.get("/", (req, res) => {
    console.log("Checking: API is running...");
    res.send("Streaming Token API is running...");
});

 app.post("/generate-token/:userID", (req, res) => {
    console.log("Incoming request to /generate-token");

    const { userID } = req.params; // Extract userID from URL parameter

    if (!userID) {
        console.error("Missing userID in request parameter");
        return res.status(400).json({ error: "User ID is required" });
    }

    const payload = {
        app_id: APP_ID,
        user_id: userID,
        app_sign: APP_SIGN,
    };

    try {
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "24h" });
        return res.json({ token });
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
