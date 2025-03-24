const express = require("express");
const cors = require("cors");
const { generateToken04 } = require("./zegoTokenGenerator"); // Import token generator
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const APP_ID = Number(process.env.APP_ID);
const SECRET_KEY = process.env.SECRET_KEY; // Ensure this is a 32-character string

if (!APP_ID || !SECRET_KEY) {
    console.error("Missing required environment variables.");
    process.exit(1);
}

app.get("/", (req, res) => {
    res.send("Zego Streaming API is running...");
});

app.get("/generate-token/:userID", (req, res) => {
    const { userID } = req.params;
    if (!userID) {
        return res.status(400).json({ error: "User ID is required" });
    }

    try {
        const effectiveTimeInSeconds = 3600; // Token valid for 1 hour
        const token = generateToken04(APP_ID, userID, SECRET_KEY, effectiveTimeInSeconds, "");

        return res.json({ token });
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
