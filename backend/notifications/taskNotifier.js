// backend/notifications/taskNotifier.js
// Orchestrates email + WhatsApp notifications for all task events

const { sendEmail, buildTaskEmail }           = require('./email');
const { sendWhatsApp, buildTaskWhatsAppMessage } = require('./whatsapp');

const APP_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

/**
 * Internal helper — notify a single user via their enabled channels
 */
async function _notify({ user, action, issue, comment }) {
  if (!user || !user.email) return;

  const payload = {
    action,
    key:          issue.key,
    title:        issue.title,
    priority:     issue.priority,
    status:       issue.status,
    assigneeName: issue.assigneeName,
    reporterName: issue.reporterName,
    dueDate:      issue.due_date || issue.dueDate,
    comment,
    appUrl:       `${APP_URL}`,
  };

  const promises = [];

  // ── Email ─────────────────────────────────────────────────────────────────
  if (user.notification_email !== false && user.email) {
    const actionLabels = {
      'Task Created':   '🆕 New Task Created',
      'Task Assigned':  '📌 Task Assigned to You',
      'Task Completed': '✅ Task Marked as Done',
      'Comment Added':  '💬 New Comment on Task',
    };
    const subject = `${actionLabels[action] || action}: [${issue.key}] ${issue.title}`;
    promises.push(
      sendEmail({ to: user.email, subject, html: buildTaskEmail(payload) })
    );
  }

  // ── WhatsApp ───────────────────────────────────────────────────────────────
  if (user.notification_whatsapp && user.phone_verified && user.phone && user.callmebot_apikey) {
    promises.push(
      sendWhatsApp({
        phone:   user.phone,
        apiKey:  user.callmebot_apikey,
        message: buildTaskWhatsAppMessage(payload),
      })
    );
  }

  await Promise.allSettled(promises);
}

// ─── Public Notifiers ─────────────────────────────────────────────────────────

/**
 * Fired when a new task/issue is created
 * Notifies: assignee (if set) + reporter
 */
async function notifyTaskCreated({ issue, assignee, reporter }) {
  const targets = [];
  if (assignee && assignee.id !== reporter?.id) targets.push(assignee);
  if (reporter) targets.push(reporter);

  for (const user of targets) {
    await _notify({ user, action: 'Task Created', issue });
  }
}

/**
 * Fired when an issue's assignee changes
 * Notifies: new assignee
 */
async function notifyTaskAssigned({ issue, newAssignee, reporter }) {
  if (!newAssignee) return;
  await _notify({ user: newAssignee, action: 'Task Assigned', issue });
}

/**
 * Fired when an issue status changes to "Done"
 * Notifies: assignee + reporter
 */
async function notifyTaskCompleted({ issue, assignee, reporter }) {
  const targets = [];
  if (assignee) targets.push(assignee);
  if (reporter && reporter.id !== assignee?.id) targets.push(reporter);

  for (const user of targets) {
    await _notify({ user, action: 'Task Completed', issue });
  }
}

/**
 * Fired when a comment is added to an issue
 * Notifies: assignee + reporter (excluding comment author)
 */
async function notifyCommentAdded({ issue, comment, author, assignee, reporter }) {
  const targets = [];
  if (assignee && assignee.id !== author?.id) targets.push(assignee);
  if (reporter && reporter.id !== author?.id && reporter.id !== assignee?.id) targets.push(reporter);

  for (const user of targets) {
    await _notify({ user, action: 'Comment Added', issue, comment });
  }
}

module.exports = { notifyTaskCreated, notifyTaskAssigned, notifyTaskCompleted, notifyCommentAdded };
