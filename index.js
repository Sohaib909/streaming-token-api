const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use((req, res, next) => {
    if (req.method === "POST" || req.method === "PUT") {
        express.json()(req, res, next);
    } else {
        next();
    }
});

const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, `${new Date().toISOString().split("T")[0]}.log`), 
    { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

const SECRET_KEY = process.env.SECRET_KEY;
const APP_ID = process.env.APP_ID;
const APP_SIGN = process.env.APP_SIGN;
if (!SECRET_KEY || !APP_ID || !APP_SIGN) {
    console.error("Missing required environment variables.");
    process.exit(1);
}

app.get("/", (req, res) => {
    res.send("Streaming Token API is running...");
});

app.get("/generate-token/:userID", (req, res) => {
    const { userID } = req.params;
    if (!userID) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const payload = {
        app_id: APP_ID,
        user_id: userID,
        app_sign:APP_SIGN,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    };

    try {
        const token = jwt.sign(payload, SECRET_KEY);
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