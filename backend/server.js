require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors    = require('cors');
const { Pool } = require('pg');
const path    = require('path');
const fs      = require('fs');
const crypto  = require('crypto');

const { notifyTaskCreated, notifyTaskModified, notifyTaskAssigned, notifyTaskCompleted, notifyCommentAdded } = require('./notifications/taskNotifier');
const { sendOtpWhatsApp } = require('./notifications/whatsapp');
const { initScheduler } = require('./notifications/scheduler');

const app = express();
app.use(cors());
app.use(express.json());

// Helper to fetch Admin user for notifications
const fetchAdmin = async () => {
  try {
    const res = await pool.query('SELECT id, name, email, notify_email, phone, phone_verified, callmebot_apikey, notification_email, notification_whatsapp FROM users WHERE id = 1');
    return res.rows[0];
  } catch (err) {
    return null;
  }
};

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const appErrorLog = path.join(logsDir, 'app_error.log');
const dbErrorLog = path.join(logsDir, 'db_error.log');

const logError = (error, type = 'app') => {
  const timestamp = new Date().toISOString();
  const logFile = type === 'db' ? dbErrorLog : appErrorLog;
  const message = `[${timestamp}] ${error.stack || error}\n`;
  fs.appendFileSync(logFile, message);
  console.error(message);
};

// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../metapharsic-frontend/dist')));

// Connect to the PostgreSQL database we built earlier (support environmental variables for production)
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'metapharsic_todo_db',
  password: process.env.DB_PASSWORD || 'admin',
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

pool.on('error', (err) => {
  logError(err, 'db');
});

// Fetch all comments from the database
app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.user_id as "userId", c.text, TO_CHAR(c.created_at, 'YYYY-MM-DD HH24:MI:SS') as date, i.key as "issueKey"
      FROM comments c
      JOIN issues i ON i.id = c.issue_id
    `);
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new comment to the database table
app.post('/api/issues/:key/comments', async (req, res) => {
  try {
    const { key } = req.params;
    const { userId, text } = req.body;
    
    // Find the internal issue ID for the given key
    let issueRes = await pool.query('SELECT id FROM issues WHERE key = $1', [key]);
    let issueId;
    
    // If the issue was just created in React and isn't in the DB yet, insert a placeholder issue
    if (issueRes.rows.length === 0) {
      const insertRes = await pool.query(
        "INSERT INTO issues (key, type, title, status, priority, reporter_id) VALUES ($1, 'task', 'New Task', 'To Do', 'medium', $2) RETURNING id",
        [key, userId]
      );
      issueId = insertRes.rows[0].id;
    } else {
      issueId = issueRes.rows[0].id;
    }

    // Insert the new comment into the table
    const newCommentRes = await pool.query(
      "INSERT INTO comments (issue_id, user_id, text, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, user_id as \"userId\", text, TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') as date",
      [issueId, userId, text]
    );

    // Also log this in the history table
    await pool.query(
      "INSERT INTO history (issue_id, user_id, event_type, old_value, new_value, created_at) VALUES ($1, $2, 'commented', NULL, $3, NOW())",
      [issueId, userId, text]
    );

    // -- Fire comment notification (non-blocking) -----------------------------
    const issueFullRes = await pool.query('SELECT * FROM issues WHERE id = $1', [issueId]);
    const issueFull = issueFullRes.rows[0];
    const fetchUser = async (uid) => uid
      ? pool.query('SELECT id, name, email, notify_email, phone, phone_verified, callmebot_apikey, notification_email, notification_whatsapp FROM users WHERE id = $1', [uid]).then(r => r.rows[0])
      : null;
    const [author, assigneeUser, reporterUser, adminUser] = await Promise.all([
      fetchUser(userId),
      fetchUser(issueFull?.assignee_id),
      fetchUser(issueFull?.reporter_id),
      fetchAdmin(),
    ]);
    if (issueFull) {
      notifyCommentAdded({
        issue: { key, title: issueFull.title, priority: issueFull.priority, status: issueFull.status, due_date: issueFull.due_date, assigneeName: assigneeUser?.name, reporterName: reporterUser?.name },
        comment: text,
        author,
        assignee: assigneeUser,
        reporter: reporterUser,
        admin: adminUser,
      }).catch(console.error);
    }
    
    // Attach the issueKey before returning
    const savedComment = newCommentRes.rows[0];
    savedComment.issueKey = key;
    
    res.json(savedComment);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch issue history from the database
app.get('/api/issues/:key/history', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await pool.query(`
      SELECT h.id, h.event_type as "eventType", h.old_value as "oldValue", h.new_value as "newValue", 
             TO_CHAR(h.created_at, 'YYYY-MM-DD HH24:MI:SS') as date, u.name as "userName", u.avatar as "userAvatar"
      FROM history h
      JOIN issues i ON i.id = h.issue_id
      LEFT JOIN users u ON u.id = h.user_id
      WHERE i.key = $1
      ORDER BY h.created_at DESC
    `, [key]);
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Record a new issue history event
app.post('/api/issues/:key/history', async (req, res) => {
  try {
    const { key } = req.params;
    const { userId, eventType, oldValue, newValue } = req.body;
    
    let issueRes = await pool.query('SELECT id FROM issues WHERE key = $1', [key]);
    let issueId;
    if (issueRes.rows.length === 0) {
      const insertRes = await pool.query(
        "INSERT INTO issues (key, type, title, status, priority, reporter_id) VALUES ($1, 'task', 'New Task', 'To Do', 'medium', $2) RETURNING id",
        [key, userId]
      );
      issueId = insertRes.rows[0].id;
    } else {
      issueId = issueRes.rows[0].id;
    }

    const result = await pool.query(
      "INSERT INTO history (issue_id, user_id, event_type, old_value, new_value, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id",
      [issueId, userId, eventType, oldValue, newValue]
    );
    res.json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch history events across all issues, with optional date filtering
app.get('/api/history', async (req, res) => {
  try {
    const { date } = req.query;
    let queryStr = `
      SELECT h.id, h.event_type as "eventType", h.old_value as "oldValue", h.new_value as "newValue", 
             TO_CHAR(h.created_at, 'YYYY-MM-DD HH24:MI:SS') as date, 
             u.id as "userId", u.name as "userName", u.avatar as "userAvatar",
             i.key as "issueKey", i.title as "issueTitle"
      FROM history h
      JOIN issues i ON i.id = h.issue_id
      LEFT JOIN users u ON u.id = h.user_id
    `;
    const params = [];
    if (date) {
      queryStr += ` WHERE TO_CHAR(h.created_at, 'YYYY-MM-DD') = $1 `;
      params.push(date);
    }
    queryStr += ` ORDER BY h.created_at DESC `;
    
    const result = await pool.query(queryStr, params);
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Authentication: login matching database credentials
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    const result = await pool.query(`
      SELECT u.id, u.name, u.avatar, u.email, u.role_id as "role", 
             u.department_id as "department", u.color, u.active, 
             TO_CHAR(u.join_date, 'YYYY-MM-DD') as "joinDate", u.password,
             u.require_password_change as "requirePasswordChange",
             COALESCE(
               (SELECT json_agg(p.permission_id) 
                FROM role_permissions p 
                WHERE p.role_id = u.role_id), 
               '[]'::json
             ) as permissions
      FROM users u
      WHERE LOWER(u.email) = LOWER($1)
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No active account found with that email.' });
    }

    const user = result.rows[0];
    if (!user.active) {
      return res.status(403).json({ error: 'Your account is currently inactive. Please contact your admin.' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    // Delete password before returning to frontend
    delete user.password;
    res.json(user);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Change Password endpoint
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { userId, newPassword } = req.body;
    if (!userId || !newPassword) {
      return res.status(400).json({ error: 'User ID and new password are required.' });
    }

    await pool.query(`
      UPDATE users 
      SET password = $1, require_password_change = FALSE 
      WHERE id = $2
    `, [newPassword, userId]);

    res.json({ ok: true });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Forgot Password ----------------------------------------------------------
// Generates a secure token, stores it in DB, and sends a branded reset email.
app.post('/api/auth/forgot-password', async (req, res) => {
  // Always return the same response to prevent user-enumeration attacks
  const GENERIC_OK = { ok: true, message: 'If an account with that email exists, a reset link has been sent.' };
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    // Only select the login email - reset links must go to the account's own email,
    // never to notify_email which is used only for task notifications.
    const result = await pool.query(
      'SELECT id, name, email, active FROM users WHERE LOWER(email) = LOWER($1)',
      [email.trim()]
    );

    if (result.rows.length === 0 || !result.rows[0].active) {
      return res.json(GENERIC_OK); // silent - don't leak account existence
    }

    const user   = result.rows[0];
    const token  = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE id = $3',
      [token, expiry, user.id]
    );

    const APP_URL  = process.env.APP_BASE_URL || 'http://localhost:3001';
    const resetUrl = `${APP_URL}/?reset_token=${token}`;
    const { sendEmail, buildPasswordResetEmail } = require('./notifications/email');

    // Always deliver to the user's own login email - not a redirect address
    await sendEmail({
      to:      user.email,
      subject: ' Password Reset Request - Metapharsic ERP',
      html:    buildPasswordResetEmail({ name: user.name, resetUrl, expiresIn: '1 hour' }),
    });

    console.log(`[Auth] Password reset link sent to ${user.email}`);
    res.json(GENERIC_OK);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// --- Reset Password ------------------------------------------------------------
// Validates the token (must be non-null and not expired) then updates the password.
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const result = await pool.query(
      `SELECT id, name, email FROM users
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: 'This reset link is invalid or has expired. Please request a new one.',
      });
    }

    const user = result.rows[0];
    await pool.query(
      `UPDATE users
       SET password = $1, reset_token = NULL, reset_token_expiry = NULL,
           require_password_change = FALSE
       WHERE id = $2`,
      [newPassword, user.id]
    );

    console.log(`[Auth] Password reset successful for user ${user.email}`);
    res.json({ ok: true, message: 'Password reset successful. You can now sign in.' });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all departments
app.get('/api/departments', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, label, icon, color, purpose, roles, kpis FROM departments');
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new department
app.post('/api/departments', async (req, res) => {
  try {
    const { id, label, icon, color, purpose, roles, kpis } = req.body;
    if (!id || !label) {
      return res.status(400).json({ error: 'ID and Label are required' });
    }
    
    await pool.query(
      'INSERT INTO departments (id, label, icon, color, purpose, roles, kpis) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [id.toLowerCase(), label, icon || '', color || '#6366f1', purpose || '', roles || '', kpis || '']
    );
    
    res.json({ ok: true });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all roles with their default permissions
app.get('/api/roles', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id, r.label,
             COALESCE(
               (SELECT json_agg(p.permission_id) 
                FROM role_permissions p 
                WHERE p.role_id = r.id), 
               '[]'::json
             ) as permissions
      FROM roles r
    `);
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Fetch all database users
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.avatar, u.email, u.role_id as "role", 
             u.department_id as "department", u.color, u.active, 
             TO_CHAR(u.join_date, 'YYYY-MM-DD') as "joinDate", u.password,
             u.require_password_change as "requirePasswordChange",
             COALESCE(
               (SELECT json_agg(p.permission_id) 
                FROM role_permissions p 
                WHERE p.role_id = u.role_id), 
               '[]'::json
             ) as "rolePermissions",
             u.custom_permissions as "permissions",
             u.phone, u.phone_verified as "phoneVerified",
             u.notification_email as "notificationEmail",
             u.notification_whatsapp as "notificationWhatsapp",
             u.notification_in_app as "notificationInApp",
             u.notification_digest as "notificationDigest",
             u.settings_auto_refresh as "settingsAutoRefresh",
             u.settings_compact_mode as "settingsCompactMode",
             u.settings_animations as "settingsAnimations",
             u.settings_language as "settingsLanguage",
             u.settings_timezone as "settingsTimezone",
             u.callmebot_apikey as "callmebotApikey",
             COALESCE(
               (SELECT json_agg(ud.dept_id)
                FROM user_departments ud
                WHERE ud.user_id = u.id),
               json_build_array(u.department_id)
             ) as "departments"
      FROM users u
      ORDER BY u.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new user in database
app.post('/api/users', async (req, res) => {
  try {
    const { 
      name, avatar, email, role, department, departments, color, active, password, 
      requirePasswordChange, permissions, phone, notificationEmail, notificationWhatsapp,
      notificationInApp, notificationDigest, settingsAutoRefresh, settingsCompactMode, settingsAnimations,
      settingsLanguage, settingsTimezone
    } = req.body;
    const pass = password || 'user123';
    const reqPassChange = requirePasswordChange === undefined ? true : requirePasswordChange;
    const customPerms = permissions ? JSON.stringify(permissions) : '[]';

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please provide a valid, authentic email address.' });
    }

    // Determine primary department (for legacy column)
    const primaryDept = department || (departments && departments.length > 0 ? departments[0] : 'it');
    const allDepts = Array.isArray(departments) ? departments : [primaryDept];

    const result = await pool.query(`
      INSERT INTO users (
        name, avatar, email, role_id, department_id, color, active, password, join_date, 
        require_password_change, custom_permissions, phone, notification_email, notification_whatsapp,
        notification_in_app, notification_digest, settings_auto_refresh, settings_compact_mode, settings_animations,
        settings_language, settings_timezone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
      RETURNING id
    `, [
      name, avatar || '', email, role, primaryDept, color || '#6366f1', active !== undefined ? active : true, pass, reqPassChange, customPerms,
      phone || null,
      notificationEmail !== undefined ? notificationEmail : true,
      notificationWhatsapp !== undefined ? notificationWhatsapp : false,
      notificationInApp !== undefined ? notificationInApp : true,
      notificationDigest !== undefined ? notificationDigest : true,
      settingsAutoRefresh !== undefined ? settingsAutoRefresh : true,
      settingsCompactMode !== undefined ? settingsCompactMode : false,
      settingsAnimations !== undefined ? settingsAnimations : true,
      settingsLanguage || 'en',
      settingsTimezone || 'Asia/Kolkata'
    ]);
    
    const userId = result.rows[0].id;

    // Insert multiple departments
    if (allDepts.length > 0) {
      for (const d of allDepts) {
        await pool.query('INSERT INTO user_departments (user_id, dept_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [userId, d]);
      }
    }
    
    res.json({ ok: true, id: userId });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user in database
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, avatar, email, role, department, departments, color, active, requirePasswordChange, permissions, 
      phone, notificationEmail, notificationWhatsapp,
      notificationInApp, notificationDigest, settingsAutoRefresh, settingsCompactMode, settingsAnimations,
      settingsLanguage, settingsTimezone
    } = req.body;
    
    // Primary department update
    const primaryDept = department || (Array.isArray(departments) && departments.length > 0 ? departments[0] : undefined);

    let queryStr = `
      UPDATE users 
      SET name = COALESCE($1, name), 
          avatar = COALESCE($2, avatar), 
          email = COALESCE($3, email), 
          role_id = COALESCE($4, role_id), 
          color = COALESCE($5, color), 
          active = COALESCE($6, active),
          require_password_change = COALESCE($7, require_password_change)
    `;
    const values = [name, avatar, email, role, color, active, requirePasswordChange];
    let idx = 8;

    if (primaryDept !== undefined)         { queryStr += `, department_id = $${idx++}`;               values.push(primaryDept); }
    if (permissions !== undefined)         { queryStr += `, custom_permissions = $${idx++}`;          values.push(JSON.stringify(permissions)); }
    if (phone !== undefined)               { queryStr += `, phone = $${idx++}`;                       values.push(phone || null); }
    if (notificationEmail !== undefined)   { queryStr += `, notification_email = $${idx++}`;          values.push(notificationEmail); }
    if (notificationWhatsapp !== undefined){ queryStr += `, notification_whatsapp = $${idx++}`;       values.push(notificationWhatsapp); }
    
    if (notificationInApp !== undefined)   { queryStr += `, notification_in_app = $${idx++}`;         values.push(notificationInApp); }
    if (notificationDigest !== undefined)  { queryStr += `, notification_digest = $${idx++}`;         values.push(notificationDigest); }
    if (settingsAutoRefresh !== undefined) { queryStr += `, settings_auto_refresh = $${idx++}`;       values.push(settingsAutoRefresh); }
    if (settingsCompactMode !== undefined) { queryStr += `, settings_compact_mode = $${idx++}`;       values.push(settingsCompactMode); }
    if (settingsAnimations !== undefined)  { queryStr += `, settings_animations = $${idx++}`;         values.push(settingsAnimations); }
    if (settingsLanguage !== undefined)    { queryStr += `, settings_language = $${idx++}`;           values.push(settingsLanguage); }
    if (settingsTimezone !== undefined)    { queryStr += `, settings_timezone = $${idx++}`;           values.push(settingsTimezone); }

    queryStr += ` WHERE id = $${idx}`;
    values.push(id);
    
    await pool.query(queryStr, values);

    // Sync multiple departments
    if (Array.isArray(departments)) {
      await pool.query('DELETE FROM user_departments WHERE user_id = $1', [id]);
      for (const d of departments) {
        await pool.query('INSERT INTO user_departments (user_id, dept_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, d]);
      }
    }

    res.json({ ok: true });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error: ' + err.message });
  }
});

// --- WhatsApp OTP Verification -----------------------------------------------

// Step 1 - User provides their phone + callmebot apikey  send OTP
app.post('/api/users/:id/send-whatsapp-otp', async (req, res) => {
  try {
    const { id } = req.params;
    const { phone, callmebotApikey } = req.body;

    if (!phone || !callmebotApikey) {
      return res.status(400).json({ error: 'phone and callmebotApikey are required' });
    }

    // Generate 6-digit OTP
    const otp = String(Math.floor(100000 + crypto.randomInt(900000)));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save OTP + phone + apikey to user record (not yet verified)
    await pool.query(
      'UPDATE users SET phone = $1, callmebot_apikey = $2, whatsapp_otp = $3, otp_expires_at = $4, phone_verified = false WHERE id = $5',
      [phone, callmebotApikey, otp, expiresAt, id]
    );

    // Send OTP via CallMeBot
    await sendOtpWhatsApp({ phone, apiKey: callmebotApikey, otp });

    res.json({ ok: true, message: 'OTP sent to WhatsApp' });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Step 2 - User enters the OTP  verify and mark as verified
app.post('/api/users/:id/verify-whatsapp-otp', async (req, res) => {
  try {
    const { id } = req.params;
    const { otp } = req.body;

    const userRes = await pool.query(
      'SELECT whatsapp_otp, otp_expires_at, phone FROM users WHERE id = $1',
      [id]
    );
    if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const { whatsapp_otp, otp_expires_at, phone } = userRes.rows[0];

    if (!whatsapp_otp) return res.status(400).json({ error: 'No OTP pending for this user' });
    if (new Date() > new Date(otp_expires_at)) return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    if (otp !== whatsapp_otp) return res.status(400).json({ error: 'Incorrect OTP. Please try again.' });

    // Mark verified and clear OTP
    await pool.query(
      'UPDATE users SET phone_verified = true, whatsapp_otp = NULL, otp_expires_at = NULL, notification_whatsapp = true WHERE id = $1',
      [id]
    );

    res.json({ ok: true, message: `WhatsApp number ${phone} verified successfully!` });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user in database
app.delete('/api/users/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    
    // Delete user's watchers reference
    await client.query('DELETE FROM issue_watchers WHERE user_id = $1', [id]);

    // Delete user's comments
    await client.query('DELETE FROM comments WHERE user_id = $1', [id]);
    
    // Re-assign reporter_id on issues to Admin (id=1)
    await client.query('UPDATE issues SET reporter_id = 1 WHERE reporter_id = $1', [id]);
    
    // Set assignee_id to NULL on issues (handled by schema but good to be explicit/safe)
    await client.query('UPDATE issues SET assignee_id = NULL WHERE assignee_id = $1', [id]);
    
    // Set history user_id to NULL (handled by schema)
    await client.query('UPDATE history SET user_id = NULL WHERE user_id = $1', [id]);
    
    // Delete user's notifications
    await client.query('DELETE FROM notifications WHERE user_id = $1', [id]);

    // Finally delete user
    await client.query('DELETE FROM users WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

// --- ISSUES ENDPOINTS --------------------------------------------------------
app.get('/api/issues', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        i.id,
        i.key,
        i.type,
        i.title,
        i.description as desc,
        i.status,
        i.priority,
        i.assignee_id as assignee,
        i.reporter_id as reporter,
        i.story_points as sp,
        i.epic_id as epic,
        s.name as sprint,
        TO_CHAR(i.due_date, 'YYYY-MM-DD"T"HH24:MI') as "dueDate",
        TO_CHAR(i.created_at, 'YYYY-MM-DD HH24:MI:SS') as created,
        TO_CHAR(i.updated_at, 'YYYY-MM-DD HH24:MI:SS') as updated,
        i.recurrence,
        i.notification,
        i.attach_count as attach,
        COALESCE(u.department_id, 'it') as department,
        COALESCE(
          (SELECT json_agg(l.name) 
           FROM issue_labels il 
           JOIN labels l ON l.id = il.label_id 
           WHERE il.issue_id = i.id), 
          '[]'::json
        ) as labels,
        COALESCE(
          (SELECT json_agg(iw.user_id) 
           FROM issue_watchers iw 
           WHERE iw.issue_id = i.id), 
          '[]'::json
        ) as watchers,
        COALESCE(
          (SELECT json_agg(json_build_object(
             'id', c.id,
             'userId', c.user_id,
             'text', c.text,
             'date', TO_CHAR(c.created_at, 'YYYY-MM-DD HH24:MI:SS')
           ))
           FROM comments c
           WHERE c.issue_id = i.id),
          '[]'::json
        ) as comments
      FROM issues i
      LEFT JOIN sprints s ON s.id = i.sprint_id
      LEFT JOIN users u ON u.id = i.assignee_id
      ORDER BY i.id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/issues', async (req, res) => {
  try {
    const data = req.body;
    
    // Resolve sprint_id
    const sprintName = data.sprint || 'Sprint 1';
    const sprintRes = await pool.query('SELECT id FROM sprints WHERE LOWER(name) = LOWER($1)', [sprintName]);
    const sprintId = sprintRes.rows.length > 0 ? sprintRes.rows[0].id : 3;

    // Insert issue
    const issueRes = await pool.query(`
      INSERT INTO issues (key, type, title, description, status, priority, assignee_id, reporter_id, story_points, epic_id, sprint_id, due_date, created_at, recurrence, notification, attach_count)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), $13, $14, $15)
      RETURNING id
    `, [
      data.key,
      data.type || 'task',
      data.title,
      data.desc || '',
      data.status || 'To Do',
      data.priority || 'medium',
      data.assignee ? Number(data.assignee) : null,
      data.reporter ? Number(data.reporter) : 1,
      data.sp || 0,
      data.epic || null,
      sprintId,
      data.dueDate || null,
      data.recurrence || 'none',
      data.notification !== false,
      data.attach || 0
    ]);

    const issueId = issueRes.rows[0].id;

    // Insert labels
    if (data.labels && data.labels.length > 0) {
      for (const labelName of data.labels) {
        let labelRes = await pool.query('SELECT id FROM labels WHERE LOWER(name) = LOWER($1)', [labelName]);
        let labelId;
        if (labelRes.rows.length === 0) {
          const insertLabel = await pool.query('INSERT INTO labels (name) VALUES ($1) RETURNING id', [labelName]);
          labelId = insertLabel.rows[0].id;
        } else {
          labelId = labelRes.rows[0].id;
        }
        await pool.query('INSERT INTO issue_labels (issue_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [issueId, labelId]);
      }
    }

    // Insert watcher
    const repId = data.reporter ? Number(data.reporter) : 1;
    await pool.query('INSERT INTO issue_watchers (issue_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [issueId, repId]);

    // Record creation in history
    await pool.query(`
      INSERT INTO history (issue_id, user_id, event_type, old_value, new_value, created_at)
      VALUES ($1, $2, 'created', NULL, $3, NOW())
    `, [issueId, repId, data.type || 'task']);

    // -- Fire email + WhatsApp notifications (non-blocking) ------------------
    const issueForNotify = {
      key:          data.key,
      title:        data.title,
      priority:     data.priority || 'medium',
      status:       data.status   || 'To Do',
      due_date:     data.dueDate  || null,
    };
    const [assigneeUser, reporterUser, adminUser] = await Promise.all([
      data.assignee ? pool.query('SELECT id, name, email, notify_email, phone, phone_verified, callmebot_apikey, notification_email, notification_whatsapp FROM users WHERE id = $1', [Number(data.assignee)]).then(r => r.rows[0]) : null,
      pool.query('SELECT id, name, email, notify_email, phone, phone_verified, callmebot_apikey, notification_email, notification_whatsapp FROM users WHERE id = $1', [repId]).then(r => r.rows[0]),
      fetchAdmin(),
    ]);
    if (assigneeUser) issueForNotify.assigneeName = assigneeUser.name;
    if (reporterUser) issueForNotify.reporterName = reporterUser.name;
    notifyTaskCreated({ issue: issueForNotify, assignee: assigneeUser, reporter: reporterUser, admin: adminUser }).catch(console.error);

    res.json({ ok: true, id: issueId });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/issues/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const patch = req.body;

    const issueRes = await pool.query('SELECT * FROM issues WHERE key = $1', [key]);
    if (issueRes.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    const existing = issueRes.rows[0];
    const issueId = existing.id;

    // --- AUDIT HISTORY AND TIME TRACKING ---
    const updaterId = patch.updaterId || patch.userId || 1; // Default to Admin user
    const historyInserts = [];

    // Title
    if (patch.title !== undefined && patch.title !== existing.title) {
      historyInserts.push({ eventType: 'edited', oldValue: existing.title, newValue: patch.title });
    }
    // Type
    if (patch.type !== undefined && patch.type !== existing.type) {
      historyInserts.push({ eventType: 'type_changed', oldValue: existing.type, newValue: patch.type });
    }
    // Status
    if (patch.status !== undefined && patch.status !== existing.status) {
      historyInserts.push({ eventType: 'status_changed', oldValue: existing.status, newValue: patch.status });
    }
    // Priority
    if (patch.priority !== undefined && patch.priority !== existing.priority) {
      historyInserts.push({ eventType: 'priority_changed', oldValue: existing.priority, newValue: patch.priority });
    }
    // Description
    if (patch.desc !== undefined && patch.desc !== existing.description) {
      historyInserts.push({ eventType: 'edited', oldValue: 'Description modified', newValue: 'Description modified' });
    }
    // Story Points
    if (patch.sp !== undefined && Number(patch.sp) !== Number(existing.story_points)) {
      historyInserts.push({ eventType: 'sp_changed', oldValue: String(existing.story_points), newValue: String(patch.sp) });
    }
    // Epic
    if (patch.epic !== undefined && patch.epic !== existing.epic_id) {
      const oldEpicName = existing.epic_id ? (await pool.query('SELECT name FROM epics WHERE id = $1', [existing.epic_id])).rows[0]?.name || existing.epic_id : 'None';
      const newEpicName = patch.epic ? (await pool.query('SELECT name FROM epics WHERE id = $1', [patch.epic])).rows[0]?.name || patch.epic : 'None';
      historyInserts.push({ eventType: 'epic_changed', oldValue: oldEpicName, newValue: newEpicName });
    }
    // Recurrence
    if (patch.recurrence !== undefined && patch.recurrence !== existing.recurrence) {
      historyInserts.push({ eventType: 'recurrence_changed', oldValue: existing.recurrence, newValue: patch.recurrence });
    }
    // Due Date
    const formattedExistingDueDate = existing.due_date ? new Date(existing.due_date).toISOString().slice(0, 16) : null;
    const formattedPatchDueDate = patch.dueDate ? patch.dueDate.slice(0, 16) : null;
    if (patch.dueDate !== undefined && formattedPatchDueDate !== formattedExistingDueDate) {
      historyInserts.push({ eventType: 'duedate_changed', oldValue: formattedExistingDueDate || 'None', newValue: formattedPatchDueDate || 'None' });
    }
    // Assignee
    if (patch.assignee !== undefined && Number(patch.assignee || 0) !== Number(existing.assignee_id || 0)) {
      const origUserName = existing.assignee_id ? (await pool.query('SELECT name FROM users WHERE id = $1', [existing.assignee_id])).rows[0]?.name : 'Unassigned';
      const newUserName = patch.assignee ? (await pool.query('SELECT name FROM users WHERE id = $1', [Number(patch.assignee)])).rows[0]?.name : 'Unassigned';
      historyInserts.push({ eventType: 'assigned', oldValue: origUserName, newValue: newUserName });
    }
    // Sprint
    if (patch.sprint !== undefined) {
      const sprintRes = await pool.query('SELECT id, name FROM sprints WHERE LOWER(name) = LOWER($1)', [patch.sprint]);
      const sprintId = sprintRes.rows.length > 0 ? sprintRes.rows[0].id : 3;
      if (sprintId !== existing.sprint_id) {
        const oldSprintRes = await pool.query('SELECT name FROM sprints WHERE id = $1', [existing.sprint_id]);
        const oldSprintName = oldSprintRes.rows.length > 0 ? oldSprintRes.rows[0].name : 'Backlog';
        historyInserts.push({ eventType: 'sprint_changed', oldValue: oldSprintName, newValue: patch.sprint });
      }
    }
    // Labels
    if (patch.labels !== undefined) {
      const curLabelsRes = await pool.query(`
        SELECT l.name FROM issue_labels il 
        JOIN labels l ON l.id = il.label_id 
        WHERE il.issue_id = $1
      `, [issueId]);
      const curLabels = curLabelsRes.rows.map(r => r.name).sort();
      const newLabels = [...patch.labels].sort();
      if (JSON.stringify(curLabels) !== JSON.stringify(newLabels)) {
        historyInserts.push({ 
          eventType: 'labeled', 
          oldValue: curLabels.join(', ') || 'None', 
          newValue: newLabels.join(', ') || 'None' 
        });
      }
    }

    // Insert all audited history items
    for (const h of historyInserts) {
      await pool.query(`
        INSERT INTO history (issue_id, user_id, event_type, old_value, new_value, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
      `, [issueId, updaterId, h.eventType, h.oldValue, h.newValue]);
    }

    // --- PREPARE UPDATE FIELDS ---
    const fields = [];
    const values = [];
    let index = 1;

    if (patch.title !== undefined) { fields.push(`title = $${index++}`); values.push(patch.title); }
    if (patch.type !== undefined) { fields.push(`type = $${index++}`); values.push(patch.type); }
    if (patch.status !== undefined) { fields.push(`status = $${index++}`); values.push(patch.status); }
    if (patch.priority !== undefined) { fields.push(`priority = $${index++}`); values.push(patch.priority); }
    if (patch.desc !== undefined) { fields.push(`description = $${index++}`); values.push(patch.desc); }
    if (patch.sp !== undefined) { fields.push(`story_points = $${index++}`); values.push(patch.sp); }
    if (patch.epic !== undefined) { fields.push(`epic_id = $${index++}`); values.push(patch.epic); }
    if (patch.recurrence !== undefined) { fields.push(`recurrence = $${index++}`); values.push(patch.recurrence); }
    if (patch.notification !== undefined) { fields.push(`notification = $${index++}`); values.push(patch.notification); }
    if (patch.dueDate !== undefined) { fields.push(`due_date = $${index++}`); values.push(patch.dueDate || null); }

    if (patch.assignee !== undefined) {
      fields.push(`assignee_id = $${index++}`);
      values.push(patch.assignee ? Number(patch.assignee) : null);
    }

    if (patch.reporter !== undefined) {
      fields.push(`reporter_id = $${index++}`);
      values.push(patch.reporter ? Number(patch.reporter) : null);
    }

    if (patch.sprint !== undefined) {
      const sprintRes = await pool.query('SELECT id FROM sprints WHERE LOWER(name) = LOWER($1)', [patch.sprint]);
      const sprintId = sprintRes.rows.length > 0 ? sprintRes.rows[0].id : 3;
      fields.push(`sprint_id = $${index++}`);
      values.push(sprintId);
    }

    // Always set updated_at to NOW() if any change occurred
    if (fields.length > 0 || patch.labels !== undefined) {
      fields.push(`updated_at = NOW()`);
    }

    if (fields.length > 0) {
      values.push(key);
      await pool.query(`
        UPDATE issues 
        SET ${fields.join(', ')} 
        WHERE key = $${index}
      `, values);
    }


    // Sync labels
    if (patch.labels !== undefined) {
      await pool.query('DELETE FROM issue_labels WHERE issue_id = $1', [issueId]);
      for (const labelName of patch.labels) {
        let labelRes = await pool.query('SELECT id FROM labels WHERE LOWER(name) = LOWER($1)', [labelName]);
        let labelId;
        if (labelRes.rows.length === 0) {
          const insertLabel = await pool.query('INSERT INTO labels (name) VALUES ($1) RETURNING id', [labelName]);
          labelId = insertLabel.rows[0].id;
        } else {
          labelId = labelRes.rows[0].id;
        }
        await pool.query('INSERT INTO issue_labels (issue_id, label_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [issueId, labelId]);
      }
    }

    // -- Fire notifications for assignee change or completion -----------------
    const fetchUser = async (uid) => uid
      ? pool.query('SELECT id, name, email, notify_email, phone, phone_verified, callmebot_apikey, notification_email, notification_whatsapp FROM users WHERE id = $1', [uid]).then(r => r.rows[0])
      : null;

    const updatedIssueRes = await pool.query('SELECT * FROM issues WHERE key = $1', [key]);
    const updatedIssue = updatedIssueRes.rows[0];
    const issueForNotify = {
      key,
      title:        updatedIssue.title,
      priority:     updatedIssue.priority,
      status:       updatedIssue.status,
      due_date:     updatedIssue.due_date,
      assigneeName: null,
      reporterName: null,
    };
    const [assigneeUser, reporterUser, adminUser] = await Promise.all([
      fetchUser(updatedIssue.assignee_id),
      fetchUser(updatedIssue.reporter_id),
      fetchAdmin(),
    ]);
    if (assigneeUser) issueForNotify.assigneeName = assigneeUser.name;
    if (reporterUser) issueForNotify.reporterName = reporterUser.name;

    if (patch.assignee !== undefined && String(patch.assignee) !== String(existing.assignee_id)) {
      notifyTaskAssigned({ issue: issueForNotify, newAssignee: assigneeUser, reporter: reporterUser, admin: adminUser }).catch(console.error);
    } else if (patch.status === 'Done' && existing.status !== 'Done') {
      notifyTaskCompleted({ issue: issueForNotify, assignee: assigneeUser, reporter: reporterUser, admin: adminUser }).catch(console.error);
    } else if (fields.length > 0 || patch.labels !== undefined) {
      notifyTaskModified({ issue: issueForNotify, assignee: assigneeUser, reporter: reporterUser, admin: adminUser }).catch(console.error);
    }

    res.json({ ok: true });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/issues/:key', async (req, res) => {
  try {
    const { key } = req.params;
    await pool.query('DELETE FROM issues WHERE key = $1', [key]);
    res.json({ ok: true });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// --- NOTIFICATIONS ENDPOINTS ------------------------------------------------
app.get('/api/notifications', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, type, user_id as "userId", message, time_label as "time", is_read as "read", issue_key as "issueKey"
      FROM notifications
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { type, userId, message, issueKey } = req.body;
    const result = await pool.query(`
      INSERT INTO notifications (type, user_id, message, time_label, is_read, issue_key)
      VALUES ($1, $2, $3, 'just now', false, $4)
      RETURNING id
    `, [type, userId, message, issueKey || null]);
    res.json({ id: result.rows[0].id, type, userId, message, time: "just now", read: false, issueKey });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/notifications/read', async (req, res) => {
  try {
    const { id } = req.body;
    if (id) {
      await pool.query('UPDATE notifications SET is_read = true WHERE id = $1', [id]);
    } else {
      await pool.query('UPDATE notifications SET is_read = true');
    }
    res.json({ ok: true });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM notifications WHERE id = $1', [id]);
    res.json({ ok: true });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// --- CHECKLISTS (TODOS) ENDPOINTS -------------------------------------------
app.get('/api/todos', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, role_id as "role", text, priority, category, is_done as "done"
      FROM todos
    `);
    const todosMap = { admin: [], manager: [], developer: [], designer: [], qa_engineer: [], viewer: [] };
    result.rows.forEach(row => {
      const role = row.role;
      if (todosMap[role]) {
        todosMap[role].push({ id: row.id, text: row.text, priority: row.priority, category: row.category, done: row.done });
      }
    });
    res.json(todosMap);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

app.put('/api/todos/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const { done } = req.body;
    await pool.query('UPDATE todos SET is_done = $1 WHERE id = $2', [done, id]);
    res.json({ ok: true });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// --- SPRINTS & EPICS ENDPOINTS ----------------------------------------------
app.get('/api/sprints', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, is_backlog as "isBacklog", TO_CHAR(start_date, 'YYYY-MM-DD') as "startDate", TO_CHAR(end_date, 'YYYY-MM-DD') as "endDate", is_active as "isActive"
      FROM sprints
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/epics', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, color FROM epics ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../metapharsic-frontend/dist/index.html'));
});

app.listen(process.env.PORT || 3001, '0.0.0.0', () => {
  console.log('Backend API running on port 3001 connected to metapharsic_todo_db');
  // Start the notification scheduler
  initScheduler(pool);
});
