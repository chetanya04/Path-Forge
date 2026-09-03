const cron = require("node-cron");
const User = require("../models/User");
const { buildDigestForUser } = require("./digestServices");
const { sendDigest } = require("../services/mailer");

function startDigestCron() {
  cron.schedule("* * * * *", async () => {
    const now = new Date();
const istOffset = 5.5 * 60 * 60 * 1000;
const istTime = new Date(now.getTime() + istOffset);

const day = istTime.getUTCDay();
const hour = istTime.getUTCHours();
const minute = istTime.getUTCMinutes();

    const users = await User.find({ digestDay: day, digestHour: hour, digestMinute: minute });
    for (const user of users) {
      try {
        const digest = await buildDigestForUser(user);
        await sendDigest(digest);
        console.log(`Digest sent to ${user.email}`);
      } catch (err) {
        console.error(`Digest failed for ${user._id}:`, err.message);
      }
    }
  });
}

module.exports = { startDigestCron };