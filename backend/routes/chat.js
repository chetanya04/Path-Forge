const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");
const Conversation = require("../models/conversationSchema");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post("/", async (req, res) => {
  try {
    const { userId, careerPath, message } = req.body;

    if (!message || !userId || !careerPath) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let conversation = await Conversation.findOne({ userId, careerPath });
    
    if (!conversation) {
      conversation = new Conversation({
        userId,
        careerPath,
        messages: []
      });
    }

    const messageHistory = [
      { 
        role: "system", 
        content: `You are a career consultant for ${careerPath}. Give short, helpful answers. Keep responses under 100 words. Be friendly and practical.` 
      }
    ];

    conversation.messages.forEach(msg => {
      messageHistory.push({ role: msg.role, content: msg.content });
    });

    messageHistory.push({ role: "user", content: message });

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: messageHistory,
      temperature: 0.7,
      max_tokens: 300
    });

    const reply = chatCompletion.choices[0]?.message?.content || "No reply";

    conversation.messages.push({ role: "user", content: message });
    conversation.messages.push({ role: "assistant", content: reply });
    await conversation.save();

    res.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error.message);
    res.status(500).json({ error: "Failed to generate response" });
  }
});

module.exports = router;