const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middlewares/authMiddleware");

router.post("/profile", auth, async (req, res) => {
  try {
    const { name, description, skills } = req.body;

    if (!name || !description || !skills) {
      return res.status(400).json({ message: "All fields are required" });
    }

    await User.findByIdAndUpdate(req.userId, { name, skills });

    res.status(201).json({
      message: "Profile saved successfully",
      data: { name, description, skills },
    });
  } catch (error) {
    console.error("Error in /student/profile:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;