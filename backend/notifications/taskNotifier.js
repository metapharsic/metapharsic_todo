// backend/notifications/taskNotifier.js
// Orchestrates email + WhatsApp notifications for all task events

const { sendEmail, buildTaskEmail }           = require('./email');
const { sendWhatsApp, buildTaskWhatsAppMessage } = require('./whatsapp');

const APP_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

/**
 * Internal helper - notify a single user via their enabled channels
 */
async function _notify({ user, action, issue, comment }) {
  if (!user || !user.email) return;

  // Use notify_email (real inbox) if set, otherwise fall back to login email
  const recipientEmail = user.notify_email || user.email;

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

  // -- Email -----------------------------------------------------------------
  if (user.notification_email !== false && recipientEmail) {
    const actionLabels = {
      'Task Created':   ' New Task Created',
      'Task Assigned':  ' Task Assigned to You',
      'Task Modified':  ' Task Modified',
      'Task Completed': ' Task Marked as Done',
      'Comment Added':  ' New Comment on Task',
    };
    const subject = `${actionLabels[action] || action}: [${issue.key}] ${issue.title}`;
    promises.push(
      sendEmail({ to: recipientEmail, subject, html: buildTaskEmail(payload) })
    );
  }

  // -- WhatsApp ---------------------------------------------------------------
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

// --- Public Notifiers ---------------------------------------------------------

/**
 * Fired when a new task/issue is created
 * Notifies: assignee (if set) + reporter + admin
 */
async function notifyTaskCreated({ issue, assignee, reporter, admin }) {
  const targets = [];
  const addedIds = new Set();
  const addUser = (u) => { if (u && !addedIds.has(u.id)) { targets.push(u); addedIds.add(u.id); } };
  
  addUser(assignee);
  addUser(reporter);
  addUser(admin);

  for (const user of targets) {
    await _notify({ user, action: 'Task Created', issue });
  }
}

/**
 * Fired when an issue is modified (title, priority, etc.)
 * Notifies: assignee + reporter + admin
 */
async function notifyTaskModified({ issue, assignee, reporter, admin }) {
  const targets = [];
  const addedIds = new Set();
  const addUser = (u) => { if (u && !addedIds.has(u.id)) { targets.push(u); addedIds.add(u.id); } };
  
  addUser(assignee);
  addUser(reporter);
  addUser(admin);

  for (const user of targets) {
    await _notify({ user, action: 'Task Modified', issue });
  }
}

/**
 * Fired when an issue's assignee changes
 * Notifies: new assignee + admin
 */
async function notifyTaskAssigned({ issue, newAssignee, reporter, admin }) {
  const targets = [];
  const addedIds = new Set();
  const addUser = (u) => { if (u && !addedIds.has(u.id)) { targets.push(u); addedIds.add(u.id); } };
  
  addUser(newAssignee);
  addUser(admin);

  for (const user of targets) {
    await _notify({ user, action: 'Task Assigned', issue });
  }
}

/**
 * Fired when an issue status changes to "Done"
 * Notifies: assignee + reporter + admin
 */
async function notifyTaskCompleted({ issue, assignee, reporter, admin }) {
  const targets = [];
  const addedIds = new Set();
  const addUser = (u) => { if (u && !addedIds.has(u.id)) { targets.push(u); addedIds.add(u.id); } };
  
  addUser(assignee);
  addUser(reporter);
  addUser(admin);

  for (const user of targets) {
    await _notify({ user, action: 'Task Completed', issue });
  }
}

/**
 * Fired when a comment is added to an issue
 * Notifies: assignee + reporter + admin (excluding comment author)
 */
async function notifyCommentAdded({ issue, comment, author, assignee, reporter, admin }) {
  const targets = [];
  const addedIds = new Set();
  const addUser = (u) => { 
    if (u && !addedIds.has(u.id) && u.id !== author?.id) { 
      targets.push(u); 
      addedIds.add(u.id); 
    } 
  };
  
  addUser(assignee);
  addUser(reporter);
  addUser(admin);

  for (const user of targets) {
    await _notify({ user, action: 'Comment Added', issue, comment });
  }
}

module.exports = { 
  notifyTaskCreated, 
  notifyTaskModified,
  notifyTaskAssigned, 
  notifyTaskCompleted, 
  notifyCommentAdded 
};
