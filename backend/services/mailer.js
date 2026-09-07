const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

function digestHtml({ name, jobs }) {
  const jobsHtml = jobs.map(j => `<li><a href="${j.url}">${j.title}</a> @ ${j.company}</li>`).join("");
  return `
    <h2>Hi ${name}, your weekly career digest</h2>
    <h3>Matching jobs</h3><ul>${jobsHtml}</ul>
  `;
}

async function sendDigest(digest) {
  const { error } = await resend.emails.send({
    from: process.env.DIGEST_FROM_EMAIL,
    to: digest.to,
    subject: "Your Weekly Career Digest",
    html: digestHtml(digest),
  });
  if (error) throw new Error(error.message);
}

module.exports = { sendDigest };