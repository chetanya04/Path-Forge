const express = require("express");
const router = express.Router();


router.post("/profile", async (req, res) => {
  try {
    const { name, description, skills } = req.body;

    if (!name || !description || !skills) {
      return res.status(400).json({ message: "All fields are required" });
    }
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
