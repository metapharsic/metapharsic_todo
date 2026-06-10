// backend/notifications/email.js
// Sends HTML emails via Gmail SMTP using Nodemailer

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

/**
 * Send an HTML email
 * @param {string} to - recipient email
 * @param {string} subject
 * @param {string} html - HTML body
 */
async function sendEmail({ to, subject, html }) {
  if (!process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD === 'PASTE_YOUR_16_CHAR_APP_PASSWORD_HERE') {
    console.warn('[Email] Gmail App Password not configured. Skipping email to:', to);
    return;
  }
  try {
    await transporter.sendMail({
      from: `"Metapharsic ERP" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email]  Sent to ${to} - ${subject}`);
  } catch (err) {
    console.error(`[Email]  Failed to send to ${to}:`, err.message);
  }
}

// --- HTML Template ------------------------------------------------------------
function buildTaskEmail({ title, key, priority, dueDate, status, assigneeName, reporterName, action, comment, appUrl }) {
  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981', critical: '#7c3aed' };
  const priorityColor  = priorityColors[priority?.toLowerCase()] || '#6366f1';
  const actionLine     = comment
    ? `<p style="margin:0 0 8px"> New comment: <em>"${comment}"</em></p>`
    : '';

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:32px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;border:1px solid #30363d;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1c4ed8,#6366f1);padding:24px 32px;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Metapharsic ERP</h1>
              <p style="margin:4px 0 0;color:#c7d2fe;font-size:13px;">Task Notification</p>
            </td>
          </tr>
          <!-- Action Banner -->
          <tr>
            <td style="padding:24px 32px 0;">
              <p style="margin:0 0 16px;color:#8b949e;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${action}</p>
              <h2 style="margin:0 0 8px;color:#e6edf3;font-size:18px;font-weight:700;">${key} - ${title}</h2>
              ${actionLine}
            </td>
          </tr>
          <!-- Meta Grid -->
          <tr>
            <td style="padding:20px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:8px 12px;background:#0d1117;border-radius:8px;border:1px solid #30363d;width:48%;">
                    <p style="margin:0;color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Priority</p>
                    <p style="margin:4px 0 0;color:${priorityColor};font-size:14px;font-weight:700;"> ${priority || 'Medium'}</p>
                  </td>
                  <td width="4%"></td>
                  <td style="padding:8px 12px;background:#0d1117;border-radius:8px;border:1px solid #30363d;width:48%;">
                    <p style="margin:0;color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Status</p>
                    <p style="margin:4px 0 0;color:#e6edf3;font-size:14px;font-weight:700;">${status || 'To Do'}</p>
                  </td>
                </tr>
                <tr><td colspan="3" height="12"></td></tr>
                <tr>
                  <td style="padding:8px 12px;background:#0d1117;border-radius:8px;border:1px solid #30363d;width:48%;">
                    <p style="margin:0;color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Assignee</p>
                    <p style="margin:4px 0 0;color:#e6edf3;font-size:14px;font-weight:700;">${assigneeName || 'Unassigned'}</p>
                  </td>
                  <td width="4%"></td>
                  <td style="padding:8px 12px;background:#0d1117;border-radius:8px;border:1px solid #30363d;width:48%;">
                    <p style="margin:0;color:#8b949e;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Due Date</p>
                    <p style="margin:4px 0 0;color:#e6edf3;font-size:14px;font-weight:700;">${dueDate || 'No due date'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- CTA Button -->
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${appUrl || '#'}" style="display:inline-block;background:linear-gradient(135deg,#1c4ed8,#6366f1);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:700;margin-top:8px;">
                 View Task
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #30363d;text-align:center;">
              <p style="margin:0;color:#484f58;font-size:12px;">Metapharsic ERP  You received this because you are subscribed to task notifications.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
}

function buildDigestEmail({ userName, tasks, appUrl }) {
  const taskRows = tasks.map(t => {
    const pColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981', critical: '#7c3aed' };
    const pColor  = pColors[t.priority?.toLowerCase()] || '#6366f1';
    return `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #30363d;">
          <div style="color:#e6edf3;font-size:14px;font-weight:700;">${t.key}: ${t.title}</div>
          <div style="font-size:12px;margin-top:4px;">
            <span style="color:${pColor};font-weight:600;"> ${t.priority}</span>
            <span style="color:#8b949e;margin:0 8px;">|</span>
            <span style="color:#c9d1d9;">${t.status}</span>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:32px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;border:1px solid #30363d;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#1c4ed8,#6366f1);padding:24px 32px;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Metapharsic ERP</h1>
              <p style="margin:4px 0 0;color:#c7d2fe;font-size:13px;">Daily Task Digest</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0;">
              <h2 style="margin:0 0 8px;color:#e6edf3;font-size:18px;font-weight:700;">Hello, ${userName}</h2>
              <p style="margin:0 0 16px;color:#8b949e;font-size:14px;">Here is a summary of tasks requiring your attention today:</p>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #30363d;border-radius:8px;overflow:hidden;">
                ${taskRows.length > 0 ? taskRows : '<tr><td style="padding:24px;color:#8b949e;text-align:center;">No active tasks found. Well done!</td></tr>'}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 32px;text-align:center;">
              <a href="${appUrl || '#'}" style="display:inline-block;background:linear-gradient(135deg,#1c4ed8,#6366f1);color:#fff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:700;margin-top:8px;">
                 Go to Dashboard
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #30363d;text-align:center;">
              <p style="margin:0;color:#484f58;font-size:12px;">Metapharsic ERP  Scheduled Summary Notification</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
}

function buildPasswordResetEmail({ name, resetUrl, expiresIn }) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#0d1117;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:32px 0;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#161b22;border-radius:12px;border:1px solid #30363d;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#1c4ed8,#6366f1);padding:24px 32px;">
              <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700;">Metapharsic ERP</h1>
              <p style="margin:4px 0 0;color:#c7d2fe;font-size:13px;">Security  Password Reset</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 24px;">
              <h2 style="margin:0 0 16px;color:#e6edf3;font-size:18px;font-weight:700;">Password Reset Request</h2>
              <p style="margin:0 0 8px;color:#8b949e;font-size:14px;">Hello <strong style="color:#e6edf3;">${name}</strong>,</p>
              <p style="margin:0 0 24px;color:#8b949e;font-size:14px;">We received a request to reset your Metapharsic ERP password. Click the button below to choose a new password:</p>
              <div style="text-align:center;margin:0 0 28px;">
                <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#1c4ed8,#6366f1);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                   Reset My Password
                </a>
              </div>
              <div style="background:#0d1117;border:1px solid #30363d;border-radius:8px;padding:12px 16px;margin-bottom:20px;">
                <p style="margin:0 0 4px;color:#768390;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;font-weight:700;">Or copy this link</p>
                <p style="margin:0;color:#58a6ff;font-size:12px;word-break:break-all;">${resetUrl}</p>
              </div>
              <p style="margin:0 0 6px;color:#768390;font-size:12px;"> This link expires in <strong>${expiresIn}</strong>.</p>
              <p style="margin:0;color:#768390;font-size:12px;"> If you did not request a password reset, please ignore this email - your password will not be changed.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #30363d;text-align:center;">
              <p style="margin:0;color:#484f58;font-size:12px;">Metapharsic ERP  For security, this link can only be used once.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;
}

module.exports = { sendEmail, buildTaskEmail, buildDigestEmail, buildPasswordResetEmail };
