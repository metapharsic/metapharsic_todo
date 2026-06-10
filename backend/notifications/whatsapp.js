// backend/notifications/whatsapp.js
// Sends WhatsApp messages via CallMeBot API
// Each user must self-register their CallMeBot API key via the verification flow

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');

const CALLMEBOT_BASE = process.env.CALLMEBOT_BASE_URL || 'https://api.callmebot.com/whatsapp.php';

/**
 * Send a WhatsApp message via CallMeBot
 * @param {string} phone  - international format e.g. +919876543210
 * @param {string} apiKey - user's personal CallMeBot API key
 * @param {string} message
 */
async function sendWhatsApp({ phone, apiKey, message }) {
  if (!phone || !apiKey) {
    console.warn('[WhatsApp] Missing phone or apiKey. Skipping.');
    return;
  }
  try {
    const encodedMsg = encodeURIComponent(message);
    const url = `${CALLMEBOT_BASE}?phone=${phone}&text=${encodedMsg}&apikey=${apiKey}`;
    const resp = await axios.get(url, { timeout: 10000 });
    console.log(`[WhatsApp]  Sent to ${phone} - status: ${resp.status}`);
  } catch (err) {
    console.error(`[WhatsApp]  Failed to send to ${phone}:`, err.message);
  }
}

/**
 * Send verification OTP to a phone number via CallMeBot
 * For OTP verification we use a fixed test apikey.
 * CallMeBot requires the user to have sent the activation message first:
 *   "I allow callmebot to send me messages"  to +34 644 78 81 73 on WhatsApp
 * After that, CallMeBot replies with the user's personal apikey.
 * 
 * This function sends the OTP message. The user must have already activated CallMeBot
 * (the UI guides them through this).
 *
 * @param {string} phone - international format
 * @param {string} apiKey - user's CallMeBot apikey (provided after activation)
 * @param {string} otp - 6-digit code
 */
async function sendOtpWhatsApp({ phone, apiKey, otp }) {
  const message = ` *Metapharsic ERP Verification*\n\nYour verification code is:\n\n*${otp}*\n\nThis code expires in 10 minutes.\nDo not share this code with anyone.`;
  return sendWhatsApp({ phone, apiKey, message });
}

/**
 * Build a task notification WhatsApp message
 */
function buildTaskWhatsAppMessage({ action, key, title, priority, status, assigneeName, reporterName, dueDate, comment, appUrl }) {
  const priorityEmoji = { high: '', medium: '', low: '', critical: '' };
  const emoji = priorityEmoji[priority?.toLowerCase()] || '';

  let lines = [
    ` *${action}*`,
    `*${key} - ${title}*`,
    ``,
    `${emoji} Priority: ${priority || 'Medium'}`,
    ` Status: ${status || 'To Do'}`,
    ` Assignee: ${assigneeName || 'Unassigned'}`,
  ];

  if (dueDate) lines.push(` Due: ${dueDate}`);
  if (reporterName) lines.push(` By: ${reporterName}`);
  if (comment) lines.push(``, ` Comment: _"${comment}"_`);
  if (appUrl) lines.push(``, ` ${appUrl}`);

  return lines.join('\n');
}

/**
 * Build a digest WhatsApp message
 */
function buildDigestWhatsAppMessage({ userName, tasks, appUrl }) {
  let lines = [
    ` *Daily Task Digest*`,
    `Hello ${userName}, here is your summary for today:`,
    ``
  ];

  if (tasks.length === 0) {
    lines.push(` No active tasks. Enjoy your day!`);
  } else {
    tasks.forEach(t => {
      const priorityEmoji = { high: '', medium: '', low: '', critical: '' }[t.priority?.toLowerCase()] || '';
      lines.push(`${priorityEmoji} *${t.key}*: ${t.title} (${t.status})`);
    });
  }

  if (appUrl) {
    lines.push(``, ` Dashboard: ${appUrl}`);
  }

  return lines.join('\n');
}

module.exports = { sendWhatsApp, sendOtpWhatsApp, buildTaskWhatsAppMessage, buildDigestWhatsAppMessage };
