const axios = require("axios");
const User = require("../models/User");

async function fetchMatchedJobs(skills = [], career = "") {
  const query = career || skills.join(" ");
  if (!query) throw new Error("No skills or career found to search jobs");

  const skillSet = skills.map(s => s.toLowerCase());

  const { data } = await axios.get(
    `https://api.adzuna.com/v1/api/jobs/${process.env.ADZUNA_COUNTRY}/search/1`,
    {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        what_or: skillSet.join(" "),
        results_per_page: 20,
      },
    }
  );

  return data.results
    .map(job => {
      const desc = (job.description || "").toLowerCase();
      const matchCount = skillSet.filter(s => desc.includes(s)).length;
      return {
        title: job.title,
        company: job.company?.display_name,
        location: job.location?.display_name,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        url: job.redirect_url,
        matchScore: skillSet.length ? Math.round((matchCount / skillSet.length) * 100) : null,
      };
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
}

exports.fetchMatchedJobs = fetchMatchedJobs;

exports.getMatchedJobs = async (req, res) => {
  try {
    let skills = [], career = "";
    if (req.query.skills) {
      skills = req.query.skills.split(",");
      career = req.query.career || "";
    } else {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).json({ error: "User not found" });
      skills = user.skills || [];
      career = user.career || "";
    }
    const jobs = await fetchMatchedJobs(skills, career);
    res.json({ count: jobs.length, jobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};