-- ============================================================
--  MetapharsicApp — Full Database Schema + Seed Data
--  Database : metapharsic_todo_db
--  Run with : psql -U postgres -d metapharsic_todo_db -f schema.sql
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
-- (none needed beyond standard pg)

-- ─── DROP EVERYTHING CLEANLY (order matters for FK deps) ────
DROP TABLE IF EXISTS history           CASCADE;
DROP TABLE IF EXISTS audit_logs        CASCADE;
DROP TABLE IF EXISTS issue_history     CASCADE;
DROP TABLE IF EXISTS issue_attachments CASCADE;
DROP TABLE IF EXISTS issue_watchers    CASCADE;
DROP TABLE IF EXISTS issue_labels      CASCADE;
DROP TABLE IF EXISTS comments          CASCADE;
DROP TABLE IF EXISTS notifications     CASCADE;
DROP TABLE IF EXISTS todos             CASCADE;
DROP TABLE IF EXISTS issues            CASCADE;
DROP TABLE IF EXISTS sprints           CASCADE;
DROP TABLE IF EXISTS labels            CASCADE;
DROP TABLE IF EXISTS epics             CASCADE;
DROP TABLE IF EXISTS users             CASCADE;
DROP TABLE IF EXISTS role_permissions  CASCADE;
DROP TABLE IF EXISTS permissions       CASCADE;
DROP TABLE IF EXISTS roles             CASCADE;
DROP TABLE IF EXISTS departments       CASCADE;

-- ════════════════════════════════════════════════════════════
--  1. DEPARTMENTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE departments (
  id     VARCHAR(30) PRIMARY KEY,
  label  VARCHAR(100) NOT NULL,
  icon   VARCHAR(10)  NOT NULL,
  color  VARCHAR(7)   NOT NULL
);

INSERT INTO departments (id, label, icon, color) VALUES
  ('hr',          'Human Resources',        '👥', '#ec4899'),
  ('finance',     'Finance',                '💰', '#f59e0b'),
  ('it',          'Information Technology', '💻', '#3b82f6'),
  ('operations',  'Operations',             '⚙',  '#8b5cf6'),
  ('sales',       'Sales',                  '📈', '#10b981'),
  ('marketing',   'Marketing',              '📢', '#ef4444'),
  ('support',     'Customer Support',       '🎧', '#0ea5e9'),
  ('legal',       'Legal',                  '⚖',  '#64748b'),
  ('procurement', 'Procurement',            '📦', '#f97316'),
  ('qa',          'QA / QC',                '🔬', '#14b8a6'),
  ('production',  'Production',             '🏭', '#eab308'),
  ('rnd',         'R&D',                    '🧪', '#84cc16');

-- ════════════════════════════════════════════════════════════
--  2. PERMISSIONS
-- ════════════════════════════════════════════════════════════
CREATE TABLE permissions (
  id  VARCHAR(40) PRIMARY KEY
);

INSERT INTO permissions (id) VALUES
  ('create'),
  ('edit'),
  ('delete'),
  ('assign'),
  ('manage_users'),
  ('view_all'),
  ('manage_roles'),
  ('approve'),
  ('view_own');

-- ════════════════════════════════════════════════════════════
--  3. ROLES
-- ════════════════════════════════════════════════════════════
CREATE TABLE roles (
  id     VARCHAR(30)  PRIMARY KEY,
  label  VARCHAR(100) NOT NULL
);

INSERT INTO roles (id, label) VALUES
  ('admin',        'Admin'),
  ('manager',      'Manager'),
  ('developer',    'Developer'),
  ('designer',     'Designer'),
  ('qa_engineer',  'QA Engineer'),
  ('viewer',       'Viewer');

-- ════════════════════════════════════════════════════════════
--  4. ROLE_PERMISSIONS  (junction)
-- ════════════════════════════════════════════════════════════
CREATE TABLE role_permissions (
  role_id       VARCHAR(30) NOT NULL REFERENCES roles(id)       ON DELETE CASCADE,
  permission_id VARCHAR(40) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

INSERT INTO role_permissions (role_id, permission_id) VALUES
  -- admin (all permissions)
  ('admin', 'create'),
  ('admin', 'edit'),
  ('admin', 'delete'),
  ('admin', 'assign'),
  ('admin', 'manage_users'),
  ('admin', 'view_all'),
  ('admin', 'manage_roles'),
  ('admin', 'approve'),
  -- manager
  ('manager', 'create'),
  ('manager', 'edit'),
  ('manager', 'assign'),
  ('manager', 'view_all'),
  ('manager', 'approve'),
  -- developer
  ('developer', 'create'),
  ('developer', 'edit'),
  ('developer', 'view_own'),
  -- designer
  ('designer', 'create'),
  ('designer', 'edit'),
  ('designer', 'view_own'),
  -- qa_engineer
  ('qa_engineer', 'create'),
  ('qa_engineer', 'edit'),
  ('qa_engineer', 'view_own'),
  -- viewer
  ('viewer', 'view_own');

-- ════════════════════════════════════════════════════════════
--  5. USERS
-- ════════════════════════════════════════════════════════════
CREATE TABLE users (
  id            SERIAL       PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  avatar        VARCHAR(4)   NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password      VARCHAR(255) NOT NULL DEFAULT 'user123',
  require_password_change BOOLEAN NOT NULL DEFAULT false,
  role_id       VARCHAR(30)  NOT NULL REFERENCES roles(id),
  department_id VARCHAR(30)  NOT NULL REFERENCES departments(id),
  color         VARCHAR(7)   NOT NULL,
  active        BOOLEAN      NOT NULL DEFAULT true,
  join_date     DATE         NOT NULL
);

INSERT INTO users (id, name, avatar, email, password, require_password_change, role_id, department_id, color, active, join_date) VALUES
  (1, 'Admin',       'AD', 'admin@metapharsic.io', 'admin123', true,  'admin',       'operations',  '#6366f1', true,  '2025-01-01'),
  (2, 'Mannan',      'MN', 'mannan@metapharsic.io','mannan123', false, 'developer',   'it',          '#10b981', true,  '2025-02-10'),
  (3, 'Team Member', 'TM', 'team@metapharsic.io',  'team123',   false, 'qa_engineer', 'qa',          '#f59e0b', true,  '2025-03-15'),
  (4, 'Priya',       'PR', 'priya@metapharsic.io', 'priya123',  false, 'designer',    'marketing',   '#ec4899', true,  '2025-04-01'),
  (5, 'DevOps Bot',  'DB', 'devops@metapharsic.io', 'devops123', false, 'developer',   'it',          '#ef4444', false, '2025-05-01');

-- keep sequence in sync after manual id inserts
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

-- ════════════════════════════════════════════════════════════
--  6. EPICS
-- ════════════════════════════════════════════════════════════
CREATE TABLE epics (
  id     VARCHAR(10)  PRIMARY KEY,
  name   VARCHAR(100) NOT NULL,
  color  VARCHAR(7)   NOT NULL
);

INSERT INTO epics (id, name, color) VALUES
  ('e1', 'Authentication', '#7c3aed'),
  ('e2', 'Dashboard',      '#0891b2'),
  ('e3', 'Reporting',      '#059669');

-- ════════════════════════════════════════════════════════════
--  7. SPRINTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE sprints (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  is_backlog  BOOLEAN      NOT NULL DEFAULT false,
  start_date  DATE,
  end_date    DATE,
  is_active   BOOLEAN      NOT NULL DEFAULT false
);

INSERT INTO sprints (id, name, is_backlog, start_date, end_date, is_active) VALUES
  (1, 'Sprint 1', false, '2026-05-01', '2026-05-31', true),
  (2, 'Sprint 2', false, '2026-06-01', '2026-06-30', false),
  (3, 'Backlog',  true,  NULL,         NULL,          false);

SELECT setval('sprints_id_seq', (SELECT MAX(id) FROM sprints));

-- ════════════════════════════════════════════════════════════
--  8. LABELS
-- ════════════════════════════════════════════════════════════
CREATE TABLE labels (
  id    SERIAL      PRIMARY KEY,
  name  VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO labels (id, name) VALUES
  (1, 'Frontend'),
  (2, 'Backend'),
  (3, 'API'),
  (4, 'Design'),
  (5, 'Testing'),
  (6, 'Docs'),
  (7, 'Bug'),
  (8, 'Enhancement');

SELECT setval('labels_id_seq', (SELECT MAX(id) FROM labels));

-- ════════════════════════════════════════════════════════════
--  9. ISSUES
-- ════════════════════════════════════════════════════════════
CREATE TABLE issues (
  id            SERIAL       PRIMARY KEY,
  key           VARCHAR(20)  NOT NULL UNIQUE,
  type          VARCHAR(20)  NOT NULL CHECK (type IN ('task','bug','story','epic','subtask')),
  title         VARCHAR(500) NOT NULL,
  description   TEXT,
  status        VARCHAR(30)  NOT NULL DEFAULT 'To Do'
                  CHECK (status IN ('To Do','In Progress','In Review','Done')),
  priority      VARCHAR(20)  NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('highest','high','medium','low','lowest')),
  assignee_id   INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  reporter_id   INTEGER      NOT NULL REFERENCES users(id),
  story_points  INTEGER      NOT NULL DEFAULT 0,
  epic_id       VARCHAR(10)  REFERENCES epics(id) ON DELETE SET NULL,
  sprint_id     INTEGER      REFERENCES sprints(id) ON DELETE SET NULL,
  due_date      DATE,
  created_at    DATE         NOT NULL DEFAULT CURRENT_DATE,
  recurrence    VARCHAR(20)  NOT NULL DEFAULT 'none'
                  CHECK (recurrence IN ('none','daily','weekly','biweekly','monthly','yearly')),
  notification  BOOLEAN      NOT NULL DEFAULT true,
  attach_count  INTEGER      NOT NULL DEFAULT 0
);

-- helper: convert sprint name → id
-- We'll insert using explicit sprint_id values (1=Sprint1, 2=Sprint2, 3=Backlog)
INSERT INTO issues (id, key, type, title, description, status, priority, assignee_id, reporter_id, story_points, epic_id, sprint_id, due_date, created_at, recurrence, notification, attach_count) VALUES
  (1,  'PROJ-1', 'story', 'User authentication flow',    'Implement full OAuth2 login and registration.',          'Done',        'high',    2,    1, 5,  'e1', 1, '2026-05-20', '2026-05-01', 'none',    true,  0),
  (2,  'PROJ-2', 'bug',   'Login button broken on Safari','Safari 16 users cannot click login CTA.',               'In Progress', 'highest', 2,    1, 2,  'e1', 1, '2026-05-22', '2026-05-10', 'none',    true,  0),
  (3,  'PROJ-3', 'task',  'Build analytics dashboard',   'Main analytics dashboard with charts and KPIs.',         'In Progress', 'medium',  3,    1, 8,  'e2', 1, '2026-06-01', '2026-05-05', 'weekly',  true,  2),
  (4,  'PROJ-4', 'task',  'API rate limiting middleware', 'Add rate limiting to all public API endpoints.',         'To Do',       'high',    2,    1, 3,  'e2', 1, '2026-06-05', '2026-05-12', 'none',    false, 0),
  (5,  'PROJ-5', 'epic',  'Reporting module',            'Full reporting suite with PDF export.',                  'To Do',       'medium',  1,    1, 21, 'e3', 2, '2026-07-01', '2026-05-13', 'monthly', true,  0),
  (6,  'PROJ-6', 'bug',   'CSV export encoding broken',  'UTF-8 characters appear as garbage in exports.',         'In Review',   'high',    3,    2, 1,  'e3', 1, '2026-05-23', '2026-05-14', 'none',    true,  1),
  (7,  'PROJ-7', 'story', 'User profile settings page',  'Allow users to update name, avatar, preferences.',       'To Do',       'low',     NULL, 1, 5,  NULL, 3, '2026-06-10', '2026-05-15', 'none',    false, 0),
  (8,  'PROJ-8', 'task',  'Write API documentation',     'OpenAPI 3.0 spec for all public endpoints.',             'To Do',       'lowest',  NULL, 1, 3,  NULL, 3, '2026-06-15', '2026-05-16', 'none',    false, 0);

SELECT setval('issues_id_seq', (SELECT MAX(id) FROM issues));

-- ════════════════════════════════════════════════════════════
--  10. ISSUE_LABELS  (junction)
-- ════════════════════════════════════════════════════════════
CREATE TABLE issue_labels (
  issue_id  INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  label_id  INTEGER NOT NULL REFERENCES labels(id) ON DELETE CASCADE,
  PRIMARY KEY (issue_id, label_id)
);

INSERT INTO issue_labels (issue_id, label_id) VALUES
  -- PROJ-1: Frontend, Backend
  (1, 1), (1, 2),
  -- PROJ-2: Bug, Frontend
  (2, 7), (2, 1),
  -- PROJ-3: Frontend, Design
  (3, 1), (3, 4),
  -- PROJ-4: Backend, API
  (4, 2), (4, 3),
  -- PROJ-5: Backend, Docs
  (5, 2), (5, 6),
  -- PROJ-6: Bug, Backend
  (6, 7), (6, 2),
  -- PROJ-7: Frontend
  (7, 1),
  -- PROJ-8: Docs
  (8, 6);

-- ════════════════════════════════════════════════════════════
--  11. ISSUE_WATCHERS  (junction)
-- ════════════════════════════════════════════════════════════
CREATE TABLE issue_watchers (
  issue_id  INTEGER NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id   INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
  PRIMARY KEY (issue_id, user_id)
);

INSERT INTO issue_watchers (issue_id, user_id) VALUES
  -- PROJ-1: watchers 1,2
  (1,1),(1,2),
  -- PROJ-2: watcher 1
  (2,1),
  -- PROJ-3: watchers 1,3
  (3,1),(3,3),
  -- PROJ-4: watcher 1
  (4,1),
  -- PROJ-5: watchers 1,2,3
  (5,1),(5,2),(5,3),
  -- PROJ-6: watchers 1,2
  (6,1),(6,2),
  -- PROJ-7: watcher 1
  (7,1),
  -- PROJ-8: watcher 1
  (8,1);

-- ════════════════════════════════════════════════════════════
--  12. COMMENTS
-- ════════════════════════════════════════════════════════════
CREATE TABLE comments (
  id          SERIAL    PRIMARY KEY,
  issue_id    INTEGER   NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id     INTEGER   NOT NULL REFERENCES users(id),
  text        TEXT      NOT NULL,
  created_at  DATE      NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO comments (id, issue_id, user_id, text, created_at) VALUES
  (1, 1, 1, 'Looks good, merging!',      '2026-05-15'),
  (2, 3, 3, 'Working on charts now.',    '2026-05-18'),
  (3, 6, 2, 'Fix in PR #42.',            '2026-05-17');

SELECT setval('comments_id_seq', (SELECT MAX(id) FROM comments));

-- ════════════════════════════════════════════════════════════
--  13. NOTIFICATIONS
-- ════════════════════════════════════════════════════════════
CREATE TABLE notifications (
  id          SERIAL       PRIMARY KEY,
  type        VARCHAR(30)  NOT NULL
                CHECK (type IN ('assignment','comment','status','due','role_change','mention','system')),
  user_id     INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message     TEXT         NOT NULL,
  time_label  VARCHAR(50)  NOT NULL DEFAULT 'just now',
  is_read     BOOLEAN      NOT NULL DEFAULT false,
  issue_key   VARCHAR(20),
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

INSERT INTO notifications (id, type, user_id, message, time_label, is_read, issue_key) VALUES
  (1, 'assignment',  2, 'You were assigned PROJ-4: API rate limiting middleware',    '2m ago',  false, 'PROJ-4'),
  (2, 'comment',     2, 'Admin commented on PROJ-1: Looks good, merging!',          '5m ago',  false, 'PROJ-1'),
  (3, 'due',         3, 'PROJ-6 is due tomorrow: CSV export encoding broken',       '1h ago',  false, 'PROJ-6'),
  (4, 'status',      1, 'PROJ-3 moved to In Progress by Team Member',              '2h ago',  true,  'PROJ-3'),
  (5, 'role_change', 2, 'Your role was updated to Developer',                       '1d ago',  true,  NULL),
  (6, 'system',      1, 'Sprint 1 ends in 3 days. 2 issues still In Progress.',    '3h ago',  false, NULL),
  (7, 'due',         1, 'PROJ-2 is overdue: Login button broken on Safari',        '6h ago',  false, 'PROJ-2'),
  (8, 'mention',     3, 'Mannan mentioned you in PROJ-6: Fix in PR #42.',          '12h ago', true,  'PROJ-6');

SELECT setval('notifications_id_seq', (SELECT MAX(id) FROM notifications));

-- ════════════════════════════════════════════════════════════
--  14. TODOS  (role-based task checklists)
-- ════════════════════════════════════════════════════════════
CREATE TABLE todos (
  id        VARCHAR(10) PRIMARY KEY,
  role_id   VARCHAR(30) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  text      TEXT        NOT NULL,
  priority  VARCHAR(10) NOT NULL CHECK (priority IN ('high','medium','low')),
  category  VARCHAR(50) NOT NULL,
  is_done   BOOLEAN     NOT NULL DEFAULT false
);

INSERT INTO todos (id, role_id, text, priority, category) VALUES
  -- admin
  ('a1','admin','Review and approve pending pull requests',          'high',   'Management'),
  ('a2','admin','Audit user role assignments across departments',    'high',   'Security'),
  ('a3','admin','Review sprint velocity and team performance',       'medium', 'Reporting'),
  ('a4','admin','Update project roadmap milestones',                 'medium', 'Planning'),
  ('a5','admin','Check overdue issues and reassign if needed',       'high',   'Management'),
  ('a6','admin','Send weekly status report to stakeholders',         'medium', 'Reporting'),
  ('a7','admin','Review new user access requests',                   'high',   'Security'),
  ('a8','admin','Archive completed sprint data',                     'low',    'Housekeeping'),
  -- manager
  ('m1','manager','Review team''s in-progress issues',              'high',   'Review'),
  ('m2','manager','Approve design sign-offs pending review',         'high',   'Approval'),
  ('m3','manager','Plan and estimate next sprint backlog',           'medium', 'Planning'),
  ('m4','manager','Conduct 1:1 with each direct report',            'medium', 'Team'),
  ('m5','manager','Update department OKRs tracker',                 'low',    'Reporting'),
  -- developer
  ('d1','developer','Pick up highest-priority ''To Do'' tasks',     'high',   'Development'),
  ('d2','developer','Update PR description and request review',      'high',   'Development'),
  ('d3','developer','Write unit tests for new components',           'medium', 'Quality'),
  ('d4','developer','Update issue status after standups',            'medium', 'Process'),
  ('d5','developer','Review and respond to code review comments',    'high',   'Development'),
  -- designer
  ('de1','designer','Upload final design assets to issues',          'high',   'Design'),
  ('de2','designer','Review UI feedback from QA',                    'high',   'Review'),
  ('de3','designer','Update Figma components for new patterns',      'medium', 'Design'),
  ('de4','designer','Attend design sync and share progress',         'medium', 'Process'),
  -- qa_engineer
  ('q1','qa_engineer','Write test cases for new user stories',       'high',   'Testing'),
  ('q2','qa_engineer','Verify bug fixes in ''In Review'' status',    'high',   'Testing'),
  ('q3','qa_engineer','Update regression test suite',                'medium', 'Quality'),
  ('q4','qa_engineer','Report critical bugs with reproduction steps','high',   'Reporting'),
  ('q5','qa_engineer','Sign off completed stories before Done',      'high',   'Approval'),
  -- viewer
  ('v1','viewer','Review latest sprint board updates',               'low',    'Review'),
  ('v2','viewer','Check project roadmap for upcoming milestones',    'low',    'Review');

-- ════════════════════════════════════════════════════════════
--  15. HISTORY  (full audit log for Detail Panel → History tab)
-- ════════════════════════════════════════════════════════════
CREATE TABLE history (
  id          SERIAL       PRIMARY KEY,
  issue_id    INTEGER      NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
  user_id     INTEGER      REFERENCES users(id) ON DELETE SET NULL,
  event_type  VARCHAR(50)  NOT NULL
                CHECK (event_type IN ('created','commented','status_changed','assigned','edited','deleted','labeled','sprint_changed')),
  old_value   TEXT,
  new_value   TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

INSERT INTO history (issue_id, user_id, event_type, old_value, new_value, created_at) VALUES
  -- PROJ-1 created + comment
  (1, 1, 'created',        NULL,         'story',           '2026-05-01 09:00:00'),
  (1, 1, 'commented',      NULL,         'Looks good, merging!', '2026-05-15 14:00:00'),
  -- PROJ-2 created + status
  (2, 1, 'created',        NULL,         'bug',             '2026-05-10 10:00:00'),
  (2, 2, 'status_changed', 'To Do',      'In Progress',     '2026-05-12 09:30:00'),
  -- PROJ-3 created + comment + status
  (3, 1, 'created',        NULL,         'task',            '2026-05-05 08:00:00'),
  (3, 1, 'status_changed', 'To Do',      'In Progress',     '2026-05-10 10:00:00'),
  (3, 3, 'commented',      NULL,         'Working on charts now.', '2026-05-18 11:00:00'),
  -- PROJ-4 created + assigned
  (4, 1, 'created',        NULL,         'task',            '2026-05-12 09:00:00'),
  (4, 1, 'assigned',       'Unassigned', 'Mannan',          '2026-05-12 09:05:00'),
  -- PROJ-5 created
  (5, 1, 'created',        NULL,         'epic',            '2026-05-13 14:00:00'),
  -- PROJ-6 created + comment + status
  (6, 2, 'created',        NULL,         'bug',             '2026-05-14 11:00:00'),
  (6, 3, 'status_changed', 'In Progress','In Review',       '2026-05-16 16:00:00'),
  (6, 2, 'commented',      NULL,         'Fix in PR #42.',  '2026-05-17 10:00:00'),
  -- PROJ-7 created
  (7, 1, 'created',        NULL,         'story',           '2026-05-15 09:00:00'),
  -- PROJ-8 created
  (8, 1, 'created',        NULL,         'task',            '2026-05-16 09:00:00');

-- ════════════════════════════════════════════════════════════
--  INDEXES  (for performance on all UI filters)
-- ════════════════════════════════════════════════════════════
CREATE INDEX idx_issues_status    ON issues(status);
CREATE INDEX idx_issues_sprint    ON issues(sprint_id);
CREATE INDEX idx_issues_assignee  ON issues(assignee_id);
CREATE INDEX idx_issues_epic      ON issues(epic_id);
CREATE INDEX idx_issues_priority  ON issues(priority);
CREATE INDEX idx_issues_type      ON issues(type);
CREATE INDEX idx_issues_reporter  ON issues(reporter_id);

CREATE INDEX idx_comments_issue   ON comments(issue_id);
CREATE INDEX idx_notifs_user      ON notifications(user_id);
CREATE INDEX idx_notifs_read      ON notifications(is_read);
CREATE INDEX idx_history_issue    ON history(issue_id);
CREATE INDEX idx_users_dept       ON users(department_id);
CREATE INDEX idx_users_role       ON users(role_id);
CREATE INDEX idx_users_active     ON users(active);
CREATE INDEX idx_todos_role       ON todos(role_id);

-- ════════════════════════════════════════════════════════════
--  VERIFY — show all created tables
-- ════════════════════════════════════════════════════════════
\dt
\echo ''
\echo '✅  MetapharsicApp database schema created successfully!'
\echo '    15 tables | All seed data loaded | Indexes applied'
