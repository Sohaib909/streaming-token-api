const express = require("express");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(express.json());

// Setup log directory
const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

// Create a write stream (append mode)
const accessLogStream = fs.createWriteStream(path.join(logDirectory, `${new Date().toISOString().split("T")[0]}.log`), { flags: "a" });

// Use morgan for logging
app.use(morgan("combined", { stream: accessLogStream }));

// Load environment variables
const SECRET_KEY = process.env.SECRET_KEY;
const APP_ID = process.env.APP_ID;
const APP_SIGN = process.env.APP_SIGN;

if (!SECRET_KEY || !APP_ID || !APP_SIGN) {
    console.error("Missing required environment variables.");
    process.exit(1);
}

// Health check route
app.get("/", (req, res) => {
    console.log("API is running...");
    res.send("Streaming Token API is running...");
});

// API to generate token
app.post("/generate-token/:userID", (req, res) => {
    console.log("Incoming request to /generate-token");

    const { userID } = req.params;
    if (!userID) {
        console.error("Missing userID in request parameter");
        return res.status(400).json({ error: "User ID is required" });
    }

    const payload = { app_id: APP_ID, user_id: userID, app_sign: APP_SIGN };
    try {
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

        // Log the response
        fs.appendFileSync(path.join(logDirectory, `${new Date().toISOString().split("T")[0]}.log`), 
            `Generated token for user ${userID}: ${token}\n`
        );

        return res.json({ token });
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
