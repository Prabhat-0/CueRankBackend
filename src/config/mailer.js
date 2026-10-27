const nodemailer = require("nodemailer");

const required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "MAIL_FROM"];
const missing = required.filter((key) => !process.env[key]);

let transporter = null;
let configurationError = null;

if (missing.length > 0) {
  configurationError = `missing ${missing.join(", ")} in .env`;
} else {
  const port = Number(process.env.SMTP_PORT) || 465;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,   // true for 465 (SSL), false for 587 (STARTTLS)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

module.exports = { transporter, configurationError };