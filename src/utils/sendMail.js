const { transporter, configurationError } = require("../config/mailer");

const sendMail = async ({ to, subject, html, text }) => {
  if (configurationError) {
    throw new Error(`Mail is not configured: ${configurationError}`);
  }

  if (!transporter) {
    throw new Error("Mail transport is unavailable");
  }

  const info = await transporter.sendMail({
    from: process.env.MAIL_FROM.trim(),
    to,
    subject,
    html,
    text,
  });
  return info.messageId;
};

module.exports = sendMail;