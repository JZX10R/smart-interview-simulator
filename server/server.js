const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");
const interviewRoutes = require("./routes/interviewRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors({
  origin: "*",
  credentials: false,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Too many requests, please try again later." },
});
app.use("/api", limiter);

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api", interviewRoutes);
app.use("/api/voice",   require("./routes/voiceRoutes"));

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Interview Simulator API Running 🚀" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err.stack);
  res.status(500).json({ error: "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));