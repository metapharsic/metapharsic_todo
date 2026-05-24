// backend/notifications/scheduler.js
const cron = require('node-cron');
const { sendEmail, buildDigestEmail } = require('./email');
const { sendWhatsApp, buildDigestWhatsAppMessage } = require('./whatsapp');

const APP_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

/**
 * Initialize all scheduled tasks
 * @param {import('pg').Pool} pool 
 */
function initScheduler(pool) {
  // 9:00 AM, 2:00 PM, 8:00 PM
  const times = ['0 9 * * *', '0 14 * * *', '0 20 * * *'];
  
  times.forEach(schedule => {
    cron.schedule(schedule, async () => {
      console.log(`[Scheduler] 🕒 Running daily digest for schedule: ${schedule}`);
      await sendDailyDigests(pool);
    });
  });
  
  // For testing purposes, we could add a shorter interval if needed, but 3 specific times were requested.
  // cron.schedule('*/30 * * * *', () => { ... });

  console.log('[Scheduler] 🚀 Daily digests scheduled for 9:00 AM, 2:00 PM, and 8:00 PM.');
}

/**
 * Fetch open tasks and notify users
 */
async function sendDailyDigests(pool) {
  try {
    // 1. Fetch all active users who have notifications enabled
    const usersRes = await pool.query(`
      SELECT id, name, email, phone, phone_verified, callmebot_apikey, notification_email, notification_whatsapp 
      FROM users 
      WHERE active = true
    `);
    const users = usersRes.rows;

    // 2. Fetch all open issues (not Done)
    const issuesRes = await pool.query(`
      SELECT key, title, priority, status, assignee_id 
      FROM issues 
      WHERE status != 'Done'
      ORDER BY priority DESC, created_at ASC
    `);
    const allIssues = issuesRes.rows;

    for (const user of users) {
      // Filter issues for this user (assigned to them)
      const userTasks = allIssues.filter(i => i.assignee_id === user.id);
      
      // Admin (id 1) gets a full summary of all open tasks in the system
      const isAdmin = (user.id === 1);
      const tasksToSend = isAdmin ? allIssues : userTasks;

      // Skip if no tasks and not an admin
      if (tasksToSend.length === 0 && !isAdmin) continue;

      // ── Email ──────────────────────────────────────────────────────────────
      if (user.notification_email !== false && user.email) {
        const html = buildDigestEmail({ 
          userName: user.name, 
          tasks: tasksToSend, 
          appUrl: APP_URL 
        });
        await sendEmail({ 
          to: user.email, 
          subject: `📅 ${isAdmin ? 'System-wide' : 'Your'} Daily Task Digest`, 
          html 
        });
      }

      // ── WhatsApp ───────────────────────────────────────────────────────────
      if (user.notification_whatsapp && user.phone_verified && user.phone && user.callmebot_apikey) {
        const message = buildDigestWhatsAppMessage({ 
          userName: user.name, 
          tasks: tasksToSend, 
          appUrl: APP_URL 
        });
        await sendWhatsApp({ 
          phone: user.phone, 
          apiKey: user.callmebot_apikey, 
          message 
        });
      }
    }
  } catch (err) {
    console.error('[Scheduler] ❌ Error in daily digest loop:', err);
  }
}

module.exports = { initScheduler };
