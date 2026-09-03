const User = require("../models/User");
const { fetchMatchedJobs } = require("../controllers/jobController");

async function buildDigestForUser(user) {
  const jobs = await fetchMatchedJobs(user.skills || [], user.career || "");

  return {
    to: user.email,
    name: user.name,
    jobs: jobs.slice(0, 5),
  };
}

async function buildAllDigests() {
  const users = await User.find({});
  const digests = [];
  for (const user of users) {
    try {
      digests.push(await buildDigestForUser(user));
    } catch (err) {
      console.error(`Digest failed for ${user._id}:`, err.message);
    }
  }
  return digests;
}

module.exports = { buildDigestForUser, buildAllDigests };