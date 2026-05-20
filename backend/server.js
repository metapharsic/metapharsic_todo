const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

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
             ) as permissions
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
    const { name, avatar, email, role, department, color, active, password, requirePasswordChange } = req.body;
    const pass = password || 'user123';
    const reqPassChange = requirePasswordChange === undefined ? true : requirePasswordChange;
    
    const result = await pool.query(`
      INSERT INTO users (name, avatar, email, role_id, department_id, color, active, password, join_date, require_password_change)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9)
      RETURNING id
    `, [name, avatar, email, role, department, color, active, pass, reqPassChange]);
    
    res.json({ ok: true, id: result.rows[0].id });
  } catch (err) {
    logError(err, 'db');
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user in database
app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, avatar, email, role, department, color, active, requirePasswordChange } = req.body;
    
    await pool.query(`
      UPDATE users 
      SET name = $1, avatar = $2, email = $3, role_id = $4, department_id = $5, color = $6, active = $7,
          require_password_change = COALESCE($8, require_password_change)
      WHERE id = $9
    `, [name, avatar, email, role, department, color, active, requirePasswordChange, id]);
    
    res.json({ ok: true });
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

app.listen(3001, () => {
  console.log('Backend API running on port 3001 connected to metapharsic_todo_db');
});

