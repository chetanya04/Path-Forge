const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/suggest', async (req, res) => {
  try {
    const { description, studentClass, skills } = req.body;

    const prompt = `
      Student Class: ${studentClass}
      Description: ${description}
      Skills: ${Array.isArray(skills) ? skills.join(', ') : skills}
      
      Give me exactly 3 career suggestions. Just write the career names separated by commas.
      Example: Software Engineer, Data Analyst, UX Designer
    `;

    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "user", content: prompt }
      ]
    });

    const suggestion = response.choices[0]?.message?.content || "";
    
    // Clean up and split
    const careers = suggestion
      .replace(/\d+\./g, '')
      .replace(/\*/g, '')
      .split(',')
      .map(s => s.trim());

    res.json({ careerSuggestions: careers });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;