const { PDFParse } = require("pdf-parse");
const Groq = require("groq-sdk");
const User = require("../models/User");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.parseResume = async (req, res) => {
  let parser;
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    parser = new PDFParse({ data: req.file.buffer });
    const result = await parser.getText();
    const text = result.text;

    const prompt = `Extract structured info from this resume text. 
Return ONLY valid JSON, no markdown, no explanation, in this exact shape:
{
  "name": string,
  "skills": string[],
  "education": string[],
  "experience": string[]
}

Resume text:
"""${text.slice(0, 6000)}"""`;

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return res.status(500).json({ error: "AI returned invalid JSON", raw });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          skills: parsed.skills || [],
          education: parsed.education || [],
          experience: parsed.experience || [],
        },
      },
      { new: true }
    );

    res.json({ success: true, extracted: parsed, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Resume parsing failed" });
  } finally {
    if (parser) await parser.destroy();
  }
};