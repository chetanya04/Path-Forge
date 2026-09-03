// routes/digestRoute.js
const express = require("express");
const router = express.Router();
const auth = require("../middlewares/authMiddleware");
const { buildDigestForUser, buildAllDigests } = require("../services/digestServices");
const { sendDigest } = require("../services/mailer");
const User = require("../models/User");

// Test: send digest to the logged-in user only
router.get("/test", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const digest = await buildDigestForUser(user);
    await sendDigest(digest);

    res.json({ success: true, sentTo: digest.to, digest });
  } catch (err) {
    console.error("Digest test error:", err.message);
    res.status(500).json({ error: "Digest test failed" });
  }
});

// Test: run the full batch job for all users (careful — sends real emails to everyone)
router.get("/test-all", auth, async (req, res) => {
  try {
    const digests = await buildAllDigests();
    for (const digest of digests) {
      await sendDigest(digest);
    }
    res.json({ success: true, count: digests.length });
  } catch (err) {
    console.error("Digest test-all error:", err.message);
    res.status(500).json({ error: "Digest batch test failed" });
  }
});

router.patch("/schedule", auth, async (req, res) => {
  try {
    const { digestDay, digestHour, digestMinute } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { digestDay, digestHour, digestMinute } },
      { new: true }
    );
    res.json({ success: true, schedule: { digestDay, digestHour, digestMinute } });
  } catch (err) {
    res.status(500).json({ error: "Failed to update schedule" });
  }
});

module.exports = router;