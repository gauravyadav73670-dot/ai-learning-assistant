import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import authRouter from "./routes/auth.js";
import contentRouter from "./routes/content.js";
import quizRouter from "./routes/quiz.js";

dotenv.config();

const app = express();

const allowedOrigins = ["http://localhost:5173", "http://127.0.0.1:5173"];

// ✅ CORS FIX (IMPORTANT)
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST"],
}));

// ✅ Middleware
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api", contentRouter);
app.use("/api", quizRouter);

// ✅ OpenAI setup
const getOpenAIClient = () =>
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

// ✅ Test route (optional)
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ✅ Chat API
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log("User:", message);

    const response = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful AI tutor." },
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0].message.content;

    console.log("AI:", reply);

    res.json({ reply });

  } catch (error) {
    console.error("ERROR:", error.message);

    res.status(500).json({
      error: "Live tutor chat is unavailable right now",
      reply:
        "The live tutor is not available right now. Start with one focus topic, write one example, then test yourself with a short quiz.",
    });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5137;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
