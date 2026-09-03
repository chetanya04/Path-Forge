const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

function digestHtml({ name, jobs }) {
  const jobsHtml = jobs.map(j => `<li><a href="${j.url}">${j.title}</a> @ ${j.company}</li>`).join("");
  return `
    <h2>Hi ${name}, your weekly career digest</h2>
    <h3>Matching jobs</h3><ul>${jobsHtml}</ul>
  `;
}

async function sendDigest(digest) {
  await transporter.sendMail({
    from: process.env.DIGEST_FROM_EMAIL,
    to: digest.to,
    subject: "Your Weekly Career Digest",
    html: digestHtml(digest),
  });
}

module.exports = { sendDigest };