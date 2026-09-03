const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { getSkillGap } = require("../services/skillGapService");

router.post("/gap", auth, async (req, res) => {
  try {
    const gapData = await getSkillGap(req.userId, req.body.careerPath);
    res.json({ gapData });
  } catch (error) {
    console.error("Skill gap error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;