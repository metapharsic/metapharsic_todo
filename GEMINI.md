# Project Instructions - Metapharsic Todo

This file contains team-shared conventions, system architecture overview, configuration steps, and agent-specific workflows for the Metapharsic Todo project.

---

## Agent Settings
The following settings are active for this repository to streamline automated modifications:

```yaml
settings:
  auto_accept_all_edits: true
  suppress_confirmation_prompts: true
  default_action: apply_and_save
```

## Architecture & Tech Stack

### 1. Frontend (Vite + React)
- **Path:** `./metapharsic-frontend`
- **Source:** React 19.x single-page application built on Vite.
- **Entry Points:**
  - `main.jsx` -> Boots the `App.jsx` component.
  - App.jsx -> Core application code containing boards, modals, and user management.
  - **Styles:** Vanilla CSS definitions under `App.css` and local JS style tokens (`S` object in `App.jsx`).


### 2. Backend (Node.js + Express + PostgreSQL)
- **Path:** `./backend`
- **Source:** Express server (`server.js`) connected to a PostgreSQL database pool.
- **Database Schema:** `./db/schema.sql` (defining users, roles, issues, history, comments, and checklists).

---

## Key Features & Configurations

### 1. SMTP Email Notifications (Gmail)
- **Service:** Automated email notifications sent on task creation, assignment, completion, or comments.
- **Credentials:** Uses Gmail SMTP through an **App Password** configured in `./backend/.env`.
- **Module:** `./backend/notifications/email.js` (using `nodemailer`).

### 2. WhatsApp Notifications (CallMeBot Gateway)
- **Service:** Zero-cost WhatsApp notifications for task events.
- **Activation Flow (One-time Setup)**:
  1. Each user opens WhatsApp and sends `I allow callmebot to send me messages` to **`+34 644 78 81 73`**.
  2. CallMeBot responds with a personal **API Key**.
  3. The user enters their phone number and API key in their profile modal under **Edit User**.
  4. The user verifies via a secure **6-digit OTP** sent automatically to their WhatsApp.
  5. Once verified, they receive immediate notifications for task events.
- **Module:** `./backend/notifications/whatsapp.js` and `./backend/notifications/taskNotifier.js`.

### 3. Detailed Auditing & Report Generation (Current Phase)
- **Kanban Column Quick-Create**: Each board column has a `+` button in the header allowing direct creation of a task pre-selected to that column's status (To Do, In Progress, In Review, Done).
- **Task Detail Popup (DetailPanel) View/Edit**:
  - **View Mode (Task Report)**: A clean, printable report of the issue displaying exhaustive fields, comments, timing data, and audit history.
    - Features a **"📋 Copy Report"** and **"📥 Download Report"** button to export task data instantly.
  - **Edit Mode**: Allows updating multiple fields in a unified flow with explicit **"Save Changes"** and **"Cancel"** buttons.
- **Seconds-Precision Timing**:
  - `created_at` and `updated_at` timestamps are stored as `TIMESTAMP WITH TIME ZONE` to record exact seconds.
  - Tickers for **Task Age** and **Time Spent in Current Status** count up live by the second.
  - The `history` audit table logs every changed field (e.g. title, priority, story points, sprint) with down-to-the-second accuracy.

---

## Operational Commands

### Development
- **Run Backend:** `cd backend && node server.js`
- **Run Frontend (Dev server):** `cd metapharsic-frontend && npm run dev`
- **Build Frontend:** `cd metapharsic-frontend && npm run build`

### Database Management
- **Apply Schema:** `psql -U postgres -d metapharsic_todo_db -f db/schema.sql`
- **Run Migration:** `node db/migrate.js`

### PM2 Process Control
- **Start All:** `pm2 start ecosystem.config.js`
- **Stop All:** `pm2 stop metapharsic-todo`
- **Show Logs:** `pm2 logs metapharsic-todo`
- **Restart Backend:** `pm2 restart metapharsic-todo`
