const express = require("express");
const cors = require("cors");
const { AccessToken } = require("livekit-server-sdk");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://mycoach.website"
  ]
}));
app.use(express.json());

app.post("/create-visio-token", async (req, res) => {
  try {
    const { sessionId, userId, userName, role } = req.body;

    if (!sessionId || !userId) {
      return res.status(400).json({
        error: "sessionId et userId sont obligatoires",
      });
    }

    const roomName = `seance-${sessionId}`;

    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: userId,
        name: userName || userId,
      }
    );

    token.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    res.json({
      livekitUrl: process.env.LIVEKIT_URL,
      roomName,
      token: jwt,
      role: role || "user",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la création du token LiveKit",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Backend visio LiveKit actif");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
app.get("/openapi.json", (req, res) => {
  res.sendFile(__dirname + "/openapi.json");
});