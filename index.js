const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());  

const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; 

 app.post("/generate-token", (req, res) => {
    const { sessionId, userId } = req.body;

     if (!sessionId || !userId) {
        return res.status(400).json({ error: "Session ID and User ID are required" });
    }

     const payload = { sessionId, userId, timestamp: Date.now() };

     const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1h" });

    return res.json({ token });
});

 const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
