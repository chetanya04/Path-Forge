const router = require("express").Router();
const { getMatchedJobs } = require("../controllers/jobController");
const auth = require("../middlewares/authMiddleware");

router.get("/jobs", auth, getMatchedJobs);

module.exports = router;