const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { parseResume } = require("../controllers/resumeController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/parse", authMiddleware, upload.single("resume"), parseResume);

module.exports = router;