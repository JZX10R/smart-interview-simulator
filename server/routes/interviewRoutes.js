const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const {
  startSession, submitAnswer, endSession,
  getSession, getUserHistory,
} = require("../controllers/interviewController");

router.post("/session/start",       protect, startSession);
router.post("/session/answer",      protect, submitAnswer);
router.post("/session/end",         protect, endSession);
router.get("/session/:sessionId",   protect, getSession);
router.get("/history/:userId",      protect, getUserHistory);

module.exports = router;