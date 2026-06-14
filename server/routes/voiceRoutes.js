const express = require("express");
const router  = express.Router();
const axios   = require("axios");

router.post("/ask", async (req, res) => {
  try {
    const { userQuestion, sessionContext } = req.body;
    if (!userQuestion) return res.status(400).json({ error: "userQuestion is required" });

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model:      "llama-3.1-8b-instant",
        max_tokens: 250,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a friendly, experienced technical interviewer in a voice interview session.
Context: ${sessionContext || "Technical interview practice"}
Reply naturally and conversationally in 2 to 3 sentences maximum.
If the candidate wants a hint, give a small nudge without the full answer.
If they want a definition, explain simply.
Speak as if talking, not writing — no bullet points, no markdown, no special characters.
Be warm and encouraging.`,
          },
          {
            role:    "user",
            content: userQuestion,
          },
        ],
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type":  "application/json",
        },
        timeout: 10000,
      }
    );

    const text = response.data.choices?.[0]?.message?.content ||
      "That is a great question. Let me think about how to best help you here.";

    res.json({ reply: text });
  } catch (err) {
    console.error("Voice ask error:", err.response?.data || err.message);
    res.status(500).json({
      reply: "I am having a brief technical issue. Please try again in a moment."
    });
  }
});

module.exports = router;