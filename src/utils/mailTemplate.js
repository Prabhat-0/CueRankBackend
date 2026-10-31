const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

const CLIENT_URL = process.env.CLIENT_URL || "https://cuerank.in";

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// ---------- Reusable pieces ----------

// Filled green button / outline button
const button = (label, url, variant = "filled") => {
  const filled = variant === "filled";
  return `
    <a href="${escapeHtml(url)}" target="_blank"
       style="display:block; text-align:center; text-decoration:none; font-family:${FONT}; font-size:17px; font-weight:600;
              padding:15px 20px; border-radius:999px;
              ${filled
                ? "background-color:#6FD27B; background-image:linear-gradient(90deg,#7EDD8A,#4A9E4F); color:#0B1A12; border:1px solid #4A9E4F;"
                : "background-color:#ffffff; color:#2F8F3A; border:1px solid #2F8F3A;"}">
      ${escapeHtml(label)}
    </a>`;
};

// Grey details card: rows = [["Label", "Value"], ...]
const detailsCard = (rows) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
         style="background-color:#EDF0EF; border-radius:24px; margin:28px 0;">
    <tr><td style="padding:24px 28px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        ${rows.map(([label, value]) => `
          <tr>
            <td style="padding:8px 0; font-family:${FONT}; font-size:16px; color:#2B3430;">${escapeHtml(label)}</td>
            <td align="right" style="padding:8px 0; font-family:${FONT}; font-size:16px; font-weight:600; color:#111815;">${escapeHtml(value)}</td>
          </tr>`).join("")}
      </table>
    </td></tr>
  </table>`;

const heading = (text) =>
  `<h1 style="margin:0 0 16px 0; font-family:${FONT}; font-size:32px; line-height:1.15; font-weight:800; color:#0F1A14; letter-spacing:-0.5px;">${escapeHtml(text)}</h1>`;

const paragraph = (html) =>
  `<p style="margin:0 0 16px 0; font-family:${FONT}; font-size:16px; line-height:1.6; color:#4B5563;">${html}</p>`;

// ---------- Main layout ----------
const layout = ({ preheader = "", body }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light only">
  <title>CueRank</title>
</head>
<body style="margin:0; padding:0; background-color:#0B1410;">
  <!-- Preheader (inbox preview text) -->
  <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:transparent;">${escapeHtml(preheader)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0B1410;">
    <tr><td align="center" style="padding:24px 12px;">

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; background-color:#ffffff;">

        <!-- Header -->
        <tr>
          <td style="background-color:#141E19; padding:26px 28px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="left">
                  <a href="${escapeHtml(CLIENT_URL)}" target="_blank"
                     style="text-decoration:none; font-family:${FONT}; font-size:26px; font-weight:800; letter-spacing:-0.5px; color:#F0C14B;">
                    Cue<span style="color:#FFFFFF;">Rank</span>
                  </a>
                </td>
                <td align="right" style="font-family:${FONT}; font-size:15px; color:#E5E7EB;">cuerank.com</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Green bar -->
        <tr><td style="background-color:#78D982; height:8px; line-height:8px; font-size:0;">&nbsp;</td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 28px 40px 28px; background-color:#ffffff;">
            ${body}
          </td>
        </tr>

        <!-- Yellow bar -->
        <tr><td style="background-color:#F0C14B; height:8px; line-height:8px; font-size:0;">&nbsp;</td></tr>

        <!-- Footer -->
        <tr>
          <td style="background-color:#08150F; padding:26px 28px;">
            <p style="margin:0 0 12px 0; font-family:${FONT}; font-size:14px; line-height:1.5; color:#9CA3AF;">
              You are receiving this email because you registered on cuerank.in.
            </p>
            <p style="margin:0 0 12px 0; font-family:${FONT}; font-size:14px; color:#4ADE80;">
              <a href="${escapeHtml(CLIENT_URL)}/settings" style="color:#4ADE80; text-decoration:none;">Notification settings</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(CLIENT_URL)}/help" style="color:#4ADE80; text-decoration:none;">Help</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(CLIENT_URL)}/terms" style="color:#4ADE80; text-decoration:none;">Terms</a>
              &nbsp;·&nbsp;
              <a href="${escapeHtml(CLIENT_URL)}/privacy" style="color:#4ADE80; text-decoration:none;">Privacy</a>
            </p>
            <p style="margin:0; font-family:${FONT}; font-size:14px; color:#9CA3AF;">CueRank</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ---------- Templates ----------

const loginAlert = (firstName) => ({
  subject: "New login to your CueRank account",
  html: layout({
    preheader: "Your account was just logged in.",
    body: `
      ${heading("New login detected")}
      ${paragraph(`Hi ${escapeHtml(firstName)}, your account was just logged in.`)}
      ${paragraph("If this wasn't you, please change your password right away.")}
      <div style="margin-top:24px;">${button("Change password", `${CLIENT_URL}/forgot-password`)}</div>`,
  }),
  text: `Hi ${firstName}, your account was just logged in. If this wasn't you, please change your password.`,
});

const passwordChanged = (firstName) => ({
  subject: "Your CueRank password was changed",
  html: layout({
    preheader: "Your password was changed successfully.",
    body: `
      ${heading("Password changed")}
      ${paragraph(`Hi ${escapeHtml(firstName)}, your password was changed successfully.`)}
      ${paragraph("If this wasn't you, contact support immediately.")}
      <div style="margin-top:24px;">${button("Contact support", `${CLIENT_URL}/help`)}</div>`,
  }),
  text: `Hi ${firstName}, your password was changed successfully. If this wasn't you, contact support immediately.`,
});

const clubApproved = (clubName, email, password) => ({
  subject: "Your CueRank club account is approved",
  html: layout({
    preheader: "Your club account is approved. Sign in with your temporary password.",
    body: `
      ${heading("Club account approved")}
      ${paragraph(`Hi ${escapeHtml(clubName)}, your club registration has been approved.`)}
      ${detailsCard([
        ["Login email", email],
        ["Temporary password", password],
      ])}
      ${paragraph("Sign in with these credentials and change your password from your account as soon as possible. Do not share this password.")}
      <div style="margin-top:24px;">${button("Visit CueRank", CLIENT_URL)}</div>`,
  }),
  text: `Your CueRank club account (${email}) has been approved. Temporary password: ${password}. Sign in and change your password immediately. Do not share this password.`,
});

const clubUnApproved = (clubName, email) => ({
  subject: "Your CueRank club account registration has been cancelled",
  html: layout({
    preheader: "Your club Registration has been cencelled.Due to violations of privacy and policies",
    body: `
      ${heading("Club Registration cancelled")}
      ${paragraph(`Hi ${escapeHtml(clubName)}, your club registration has been cancelled.`)}
      ${detailsCard([
        [ email],
      ])}
      <div style="margin-top:24px;">${button("Visit CueRank", CLIENT_URL)} </div>
     <a
  href="mailto:help@cuerank.in"
  style="
    color: #78D982;
    font-weight: 600;
    text-decoration: none;
    border-bottom: 1px solid #78D982;
    padding-bottom: 2px;
    padding-top:40px;
    margin-top:10px;
    
  "
>
  Contact Us for more information
</a>`,
  }),
  text: `Your CueRank club account (${email}) registration has been cacelled.`,
});

const otpMail = (otp) => ({
  subject: "Your CueRank verification code",
  html: layout({
    preheader: `Your verification code is ${otp}`,
    body: `
      ${heading("Verification code")}
      ${paragraph("Use the code below to continue. Do not share it with anyone.")}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
             style="background-color:#EDF0EF; border-radius:24px; margin:24px 0;">
        <tr><td align="center" style="padding:24px;">
          <span style="font-family:'Courier New', monospace; font-size:36px; font-weight:700; letter-spacing:10px; color:#166534; padding-left:10px;">${escapeHtml(otp)}</span>
        </td></tr>
      </table>
      ${paragraph(`This code expires in <strong style="color:#111827;">10 minutes</strong>.`)}
      ${paragraph("If you did not request this code, you can safely ignore this email.")}`,
  }),
  text: `Your CueRank verification code is ${otp}. It expires in 10 minutes.`,
});

// Tournament confirmation (image wala template)
const tournamentConfirmed = ({
  firstName,
  tournamentName,
  clubName,
  city,
  startDate,
  endDate,
  entryFee,
  receiptNo,
  paymentId,
  lastEntryDate,
  tournamentUrl,
  receiptUrl,
}) => ({
  subject: `You're in! Entry confirmed for ${tournamentName}`,
  html: layout({
    preheader: `Your entry for ${tournamentName} is confirmed.`,
    body: `
      ${heading("You’re in!")}
      ${paragraph(`Hi ${escapeHtml(firstName)}, your entry for ${escapeHtml(tournamentName)} is confirmed. We have added it to My Tournaments.`)}

      ${detailsCard([
        ["Tournament", tournamentName],
        ["Club", `${clubName}, ${city}`],
        ["Dates", `${startDate} - ${endDate}`],
        ["Entry fee paid", `₹${entryFee}`],
        ["Receipt no.", receiptNo],
        ["Payment ID", paymentId],
      ])}

      ${paragraph(`Fixtures are published after the last entry date, ${escapeHtml(lastEntryDate)}. We will email you as soon as they are ready.`)}

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:28px;">
        <tr>
          <td width="50%" style="padding-right:8px;">${button("View my tournament", tournamentUrl, "filled")}</td>
          <td width="50%" style="padding-left:8px;">${button("Download receipt", receiptUrl, "outline")}</td>
        </tr>
      </table>`,
  }),
  text: `Hi ${firstName}, your entry for ${tournamentName} is confirmed.
Club: ${clubName}, ${city}
Dates: ${startDate} - ${endDate}
Entry fee paid: ${entryFee}
Receipt no.: ${receiptNo}
Payment ID: ${paymentId}
Fixtures are published after ${lastEntryDate}.
View tournament: ${tournamentUrl}
Download receipt: ${receiptUrl}`,
});

module.exports = { loginAlert, passwordChanged, clubApproved, otpMail, tournamentConfirmed ,clubUnApproved};