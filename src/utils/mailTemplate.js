const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const loginAlert = (firstName) => ({
  subject: "New login to your CueRank account",
  html: `<p>Hi ${escapeHtml(firstName)},</p>
         <p>Your account was just logged in. If this wasn't you, please change your password.</p>`,
  text: `Hi ${firstName}, your account was just logged in. If this wasn't you, please change your password.`,
});

const passwordChanged = (firstName) => ({
  subject: "Your CueRank password was changed",
  html: `<p>Hi ${escapeHtml(firstName)},</p>
         <p>Your password was changed successfully. If this wasn't you, contact support immediately.</p>`,
  text: `Hi ${firstName}, your password was changed successfully. If this wasn't you, contact support immediately.`,
});

module.exports = { loginAlert, passwordChanged };