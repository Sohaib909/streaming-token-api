const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json()); // Proper JSON body parsing

const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory);
}

const accessLogStream = fs.createWriteStream(
    path.join(logDirectory, `${new Date().toISOString().split("T")[0]}.log`), 
    { flags: "a" }
);

app.use(morgan("combined", { stream: accessLogStream }));

const APP_ID = Number(process.env.APP_ID); // Convert to number
const APP_SIGN = process.env.APP_SIGN;
const SECRET_KEY = process.env.SECRET_KEY;
if (!APP_ID || !APP_SIGN || !SECRET_KEY) {
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

    const nonce = Math.floor(Math.random() * 1000000);
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const expireTimestamp = currentTimestamp + 3600; // Token valid for 1 hour

    const payload = {
        app_id: APP_ID,
        user_id: userID,
        server_secret:SECRET_KEY,
        nonce: nonce,
        expired_ts: expireTimestamp,
    };

    const payloadString = JSON.stringify(payload);

    try {
        const token = crypto.createHmac("sha256", Buffer.from(APP_SIGN, "hex"))
            .update(payloadString)
            .digest("hex");

        const responseToken = { ...payload, token };

        fs.appendFileSync(path.join(logDirectory, `${new Date().toISOString().split("T")[0]}.log`), 
            `Generated token for user ${userID}: ${JSON.stringify(responseToken)}\n`
        );

        return res.json(responseToken);
    } catch (error) {
        console.error("Error generating token:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
