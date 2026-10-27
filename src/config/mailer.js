const nodemailer = require("nodemailer");

const host = process.env.SMTP_HOST?.trim();
const portValue = process.env.SMTP_PORT?.trim();
const port = portValue ? Number(portValue) : 587;
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS;
const hasUser = Boolean(user);
const hasPass = Boolean(pass);
const errors = [];

if (!host) {
  errors.push("SMTP_HOST is required");
}
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  errors.push("SMTP_PORT must be a valid port number");
}
if (!process.env.MAIL_FROM?.trim()) {
  errors.push("MAIL_FROM is required");
}
if (hasUser !== hasPass) {
  errors.push("SMTP_USER and SMTP_PASS must both be provided or both omitted");
}

const isConfigured = errors.length === 0;
const transporter = host && Number.isInteger(port) && port >= 1 && port <= 65535 && hasUser === hasPass
  ? nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      ...(hasUser ? { auth: { user, pass } } : {}),
    })
  : null;

module.exports = {
  transporter,
  isConfigured,
  configurationError: errors.join("; "),
};