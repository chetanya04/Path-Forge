const Groq = require("groq-sdk");
const User = require("../models/User");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getSkillGap(userId, careerPath) {
  const user = await User.findById(userId);

  const prompt = `List 6 specific technical tools/skills required for a ${careerPath} (e.g., Docker, AWS, Linux, Kubernetes, Python, Git — actual tool/tech names, NOT abstract categories like "Automation" or "Containerization"). 
Return ONLY comma-separated names, nothing else.`;

  const response = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [{ role: "user", content: prompt }],
  });

  const required = response.choices[0]?.message?.content
    .split(",")
    .map(s => s.trim());

  const userSkills = (user.skills || []).map(s => s.toLowerCase());

  return required.map(skill => ({
    skill,
    hasSkill: userSkills.includes(skill.toLowerCase()),
  }));
}

module.exports = { getSkillGap };