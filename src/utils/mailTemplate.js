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

const otpMail = (otp) => ({
  subject: "Your CueRank verification code",
  html: `<p>Your verification code is:</p>
         <h2 style="letter-spacing:4px">${escapeHtml(otp)}</h2>
         <p>It expires in 10 minutes. If you didn't request it, you can ignore this email.</p>`,
  text: `Your CueRank verification code is ${otp}. It expires in 10 minutes.`,
});

module.exports = { loginAlert, passwordChanged,otpMail };