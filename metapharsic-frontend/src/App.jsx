import { useState, useRef, useMemo, useCallback, useEffect } from "react";

// ─── TRANSLATIONS ────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    // Navigation
    board: "Board",
    backlog: "Backlog",
    roadmap: "Roadmap",
    people: "People",
    mytasks: "My Tasks",
    todos: "Task List",
    departments: "Departments",
    users: "User Mgmt",
    settings: "Settings",
    components: "Components",
    architecture: "DB Schema",
    project: "Project",
    core: "Core",
    // General
    save: "Save Changes",
    cancel: "Cancel",
    search: "Search issues...",
    create: "Create Issue",
    signOut: "Sign Out",
    loggedInAs: "Logged in as",
    // Settings
    systemSettings: "System Settings",
    appearance: "Appearance & Theme",
    appBehavior: "Application Behavior",
    localization: "Localization",
    language: "System Language",
    timezone: "Timezone",
    commPrefs: "Communication Prefs",
    // Departments
    enterpriseDepts: "Enterprise Departments",
    addDept: "Add Department",
    units: "Units",
    staff: "Staff",
    purpose: "Purpose",
    roles: "Primary Roles",
    kpis: "Operational KPIs",
  },
  hi: {
    board: "बोर्ड",
    backlog: "बैकलॉग",
    roadmap: "रोडमैप",
    people: "लोग",
    mytasks: "मेरे कार्य",
    todos: "कार्य सूची",
    departments: "विभाग",
    users: "उपयोगकर्ता प्रबंधन",
    settings: "सेटिंग्स",
    components: "घटक",
    architecture: "डेटाबेस स्कीमा",
    project: "परियोजना",
    core: "मुख्य",
    save: "परिवर्तन सहेजें",
    cancel: "रद्द करें",
    search: "खोजें...",
    create: "कार्य बनाएँ",
    signOut: "साइन आउट",
    loggedInAs: "के रूप में लॉग इन",
    systemSettings: "सिस्टम सेटिंग्स",
    appearance: "दिखावट और थीम",
    appBehavior: "एप्लिकेशन व्यवहार",
    localization: "स्थानीयकरण",
    language: "सिस्टम भाषा",
    timezone: "समय क्षेत्र",
    commPrefs: "संचार प्राथमिकताएं",
    enterpriseDepts: "उद्यम विभाग",
    addDept: "विभाग जोड़ें",
    units: "इकाइयां",
    staff: "कर्मचारी",
    purpose: "उद्देश्य",
    roles: "मुख्य भूमिकाएँ",
    kpis: "परिचालन KPIs",
  },
  ar: {
    board: "لوحة",
    backlog: "قائمة المهام",
    roadmap: "خارطة الطريق",
    people: "أشخاص",
    mytasks: "مهامي",
    todos: "قائمة المهام",
    departments: "الأقسام",
    users: "إدارة المستخدمين",
    settings: "الإعدادات",
    components: "المكونات",
    architecture: "هيكل قاعدة البيانات",
    project: "المشروع",
    core: "الأساسي",
    save: "حفظ التغييرات",
    cancel: "إلغاء",
    search: "بحث عن المهام...",
    create: "إنشاء مهمة",
    signOut: "تسجيل الخروج",
    loggedInAs: "مسجل الدخول كـ",
    systemSettings: "إعدادات النظام",
    appearance: "المظهر والموضوع",
    appBehavior: "سلوك التطبيق",
    localization: "الترجمة",
    language: "لغة النظام",
    timezone: "المنطقة الزمنية",
    commPrefs: "تفضيلات التواصل",
    enterpriseDepts: "أقسام المؤسسة",
    addDept: "إضافة قسم",
    units: "وحدات",
    staff: "الموظفين",
    purpose: "الغرض",
    roles: "الأدوار الرئيسية",
    kpis: "مؤشرات الأداء",
  }
};

// ─── DEPARTMENTS ─────────────────────────────────────────────────────────────
let DEPARTMENTS = {
  hr:          { label: "Human Resources",        icon: "👥", color: "#ec4899", purpose: "Employee lifecycle & talent governance", roles: "HR Manager, Recruiter, Payroll Lead", kpis: "Retention Rate · Time-to-Hire · Training ROI" },
  finance:     { label: "Finance",                icon: "💰", color: "#f59e0b", purpose: "Fiscal integrity & strategic budgeting", roles: "Finance Manager, Accountant, Finance Analyst", kpis: "Budget Variance · Cash Flow · Tax Compliance" },
  it:          { label: "Information Technology", icon: "💻", color: "#3b82f6", purpose: "Enterprise infra & digital assets",      roles: "IT Manager, DBA, DevOps Engineer", kpis: "System Uptime · MTTR · Backup Success %" },
  operations:  { label: "Operations",             icon: "⚙",  color: "#8b5cf6", purpose: "Process execution & operational excellence",roles: "General Manager, Ops Manager, Coordinator", kpis: "SLA Achievement · Process Efficiency · TAT" },
  sales:       { label: "Sales",                  icon: "📈", color: "#10b981", purpose: "Revenue growth & account management",      roles: "Sales Manager, Account Manager, Sales Executive", kpis: "Target vs Actual · CAC · Lead Conversion" },
  marketing:   { label: "Marketing",              icon: "📢", color: "#ef4444", purpose: "Brand positioning & digital footprint",    roles: "Brand Manager, Digital Marketer, SEO Analyst", kpis: "Brand Recall · Marketing ROI · Traffic Growth" },
  support:     { label: "Customer Support",       icon: "🎧", color: "#0ea5e9", purpose: "Consumer satisfaction & issue resolution", roles: "Support Engineer, Helpdesk Agent", kpis: "CSAT Score · Ticket Resolution · First Response" },
  legal:       { label: "Legal",                  icon: "⚖",  color: "#64748b", purpose: "Statutory compliance & risk mitigation",    roles: "Legal Advisor, Compliance Officer", kpis: "Litigation Status · Contract Turnaround · Audit Pass %" },
  procurement: { label: "Procurement",            icon: "📦", color: "#f97316", purpose: "Strategic sourcing & vendor governance",   roles: "Purchase Exec, Vendor Manager", kpis: "Cost Saving · Vendor Performance · Lead Time" },
  qa:          { label: "QA / QC",                icon: "🔬", color: "#14b8a6", purpose: "Quality assurance & laboratory control",   roles: "QA Manager, QC Technician, QA Analyst", kpis: "Batch Success · Lab Compliance · Error Rate" },
  production:  { label: "Production",             icon: "🏭", color: "#eab308", purpose: "High-scale pharmaceutical manufacturing",  roles: "Plant Head, Production Supv, Operator", kpis: "Yield Efficiency · Plant Safety · Downtime %" },
  rnd:         { label: "R&D",                    icon: "🧪", color: "#84cc16", purpose: "Formula innovation & clinical research",   roles: "R&D Manager, Scientist, Lab Tech", kpis: "Innovation Velocity · Patent Filing · Lab Safety" },
};

// ─── ROLES ────────────────────────────────────────────────────────────────────
let ROLES = {
  admin:        { label: "Admin",          permissions: ["create","edit","delete","assign","manage_users","view_all","manage_roles","approve"] },
  manager:      { label: "Manager",        permissions: ["create","edit","assign","view_all","approve"] },
  developer:    { label: "Developer",      permissions: ["create","edit","view_own"] },
  designer:     { label: "Designer",       permissions: ["create","edit","view_own"] },
  qa_engineer:  { label: "QA Engineer",    permissions: ["create","edit","view_own"] },
  viewer:       { label: "Viewer",         permissions: ["view_own"] },
};

// ─── USERS ───────────────────────────────────────────────────────────────────
const INITIAL_USERS = [
  { id:1, name:"Admin",       avatar:"AD", role:"admin",       department:"operations",  color:"#6366f1", email:"admin@metapharsic.io",    password:"admin123",   active:true,  joinDate:"2025-01-01" },
  { id:2, name:"Mannan",      avatar:"MN", role:"developer",   department:"it",          color:"#10b981", email:"mannan@metapharsic.io",   password:"mannan123",  active:true,  joinDate:"2025-02-10" },
  { id:3, name:"Team Member", avatar:"TM", role:"qa_engineer", department:"qa",          color:"#f59e0b", email:"team@metapharsic.io",       password:"team123",    active:true,  joinDate:"2025-03-15" },
  { id:4, name:"Priya",       avatar:"PR", role:"designer",    department:"marketing",   color:"#ec4899", email:"priya@metapharsic.io",    password:"priya123",   active:true,  joinDate:"2025-04-01" },
  { id:5, name:"DevOps Bot",  avatar:"DB", role:"developer",   department:"it",          color:"#ef4444", email:"devops@metapharsic.io",   password:"devops123",  active:false, joinDate:"2025-05-01" },
];

// ─── TODO DEFINITIONS BY ROLE ─────────────────────────────────────────────────
const ROLE_TODOS = {
  admin: [
    { id:"a1", text:"Review and approve pending pull requests",     priority:"high",   category:"Management"  },
    { id:"a2", text:"Audit user role assignments across departments",priority:"high",   category:"Security"    },
    { id:"a3", text:"Review sprint velocity and team performance",   priority:"medium", category:"Reporting"   },
    { id:"a4", text:"Update project roadmap milestones",             priority:"medium", category:"Planning"    },
    { id:"a5", text:"Check overdue issues and reassign if needed",   priority:"high",   category:"Management"  },
    { id:"a6", text:"Send weekly status report to stakeholders",     priority:"medium", category:"Reporting"   },
    { id:"a7", text:"Review new user access requests",               priority:"high",   category:"Security"    },
    { id:"a8", text:"Archive completed sprint data",                 priority:"low",    category:"Housekeeping"},
  ],
  manager: [
    { id:"m1", text:"Review team's in-progress issues",             priority:"high",   category:"Review"      },
    { id:"m2", text:"Approve design sign-offs pending review",       priority:"high",   category:"Approval"    },
    { id:"m3", text:"Plan and estimate next sprint backlog",         priority:"medium", category:"Planning"    },
    { id:"m4", text:"Conduct 1:1 with each direct report",          priority:"medium", category:"Team"        },
    { id:"m5", text:"Update department OKRs tracker",               priority:"low",    category:"Reporting"   },
  ],
  developer: [
    { id:"d1", text:"Pick up highest-priority 'To Do' tasks",       priority:"high",   category:"Development" },
    { id:"d2", text:"Update PR description and request review",      priority:"high",   category:"Development" },
    { id:"d3", text:"Write unit tests for new components",           priority:"medium", category:"Quality"     },
    { id:"d4", text:"Update issue status after standups",            priority:"medium", category:"Process"     },
    { id:"d5", text:"Review and respond to code review comments",    priority:"high",   category:"Development" },
  ],
  designer: [
    { id:"de1", text:"Upload final design assets to issues",         priority:"high",   category:"Design"      },
    { id:"de2", text:"Review UI feedback from QA",                   priority:"high",   category:"Review"      },
    { id:"de3", text:"Update Figma components for new patterns",     priority:"medium", category:"Design"      },
    { id:"de4", text:"Attend design sync and share progress",        priority:"medium", category:"Process"     },
  ],
  qa_engineer: [
    { id:"q1", text:"Write test cases for new user stories",         priority:"high",   category:"Testing"     },
    { id:"q2", text:"Verify bug fixes in 'In Review' status",        priority:"high",   category:"Testing"     },
    { id:"q3", text:"Update regression test suite",                  priority:"medium", category:"Quality"     },
    { id:"q4", text:"Report critical bugs with reproduction steps",  priority:"high",   category:"Reporting"   },
    { id:"q5", text:"Sign off completed stories before Done",        priority:"high",   category:"Approval"    },
  ],
  viewer: [
    { id:"v1", text:"Review latest sprint board updates",            priority:"low",    category:"Review"      },
    { id:"v2", text:"Check project roadmap for upcoming milestones", priority:"low",    category:"Review"      },
  ],
};

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const NOTIFICATION_TYPES = {
  assignment:  { icon:"👤", color:"#46b3cf", label:"Assignment"   },
  comment:     { icon:"💬", color:"#10b981", label:"Comment"      },
  status:      { icon:"🔄", color:"#f59e0b", label:"Status Change"},
  due:         { icon:"⏰", color:"#ef4444", label:"Due Soon"     },
  role_change: { icon:"🛡", color:"#a855f7", label:"Role Change"  },
  mention:     { icon:"@",  color:"#ec4899", label:"Mention"      },
  system:      { icon:"⚙", color:"#6366f1", label:"System"       },
};

const SEED_NOTIFICATIONS = [
  { id:1, type:"assignment",  userId:2, message:"You were assigned PROJ-4: API rate limiting middleware", time:"2m ago",   read:false, issueKey:"PROJ-4" },
  { id:2, type:"comment",     userId:2, message:"Admin commented on PROJ-1: Looks good, merging!",        time:"5m ago",   read:false, issueKey:"PROJ-1" },
  { id:3, type:"due",         userId:3, message:"PROJ-6 is due tomorrow: CSV export encoding broken",     time:"1h ago",   read:false, issueKey:"PROJ-6" },
  { id:4, type:"status",      userId:1, message:"PROJ-3 moved to In Progress by Team Member",             time:"2h ago",   read:true,  issueKey:"PROJ-3" },
  { id:5, type:"role_change", userId:2, message:"Your role was updated to Developer",                     time:"1d ago",   read:true,  issueKey:null      },
  { id:6, type:"system",      userId:1, message:"Sprint 1 ends in 3 days. 2 issues still In Progress.",   time:"3h ago",   read:false, issueKey:null      },
  { id:7, type:"due",         userId:1, message:"PROJ-2 is overdue: Login button broken on Safari",       time:"6h ago",   read:false, issueKey:"PROJ-2" },
  { id:8, type:"mention",     userId:3, message:"Mannan mentioned you in PROJ-6: Fix in PR #42.",         time:"12h ago",  read:true,  issueKey:"PROJ-6" },
];

// ─── ISSUE DATA ───────────────────────────────────────────────────────────────
const ISSUE_TYPES = {
  task:    { label:"Task",    icon:"✓",  color:"#4ade80" },
  bug:     { label:"Bug",     icon:"⬤",  color:"#f87171" },
  story:   { label:"Story",   icon:"◈",  color:"#7dc3db" },
  epic:    { label:"Epic",    icon:"⚡", color:"#c084fc" },
  subtask: { label:"Subtask", icon:"⊏",  color:"#adbac7" },
};

const STATUSES = ["To Do","In Progress","In Review","Done"];
const STATUS_COLORS = {
  "To Do":       { bg:"#2d4052", text:"#7dc3db", dot:"#46b3cf"  },
  "In Progress": { bg:"#2d4052", text:"#fbbf24", dot:"#f59e0b"  },
  "In Review":   { bg:"#1e2a3a", text:"#a78bfa", dot:"#8b5cf6"  },
  "Done":        { bg:"#14312a", text:"#4ade80", dot:"#22c55e"  },
};

const PRIORITIES = {
  highest: { label:"Highest", icon:"↑↑", color:"#ef4444" },
  high:    { label:"High",    icon:"↑",   color:"#f97316" },
  medium:  { label:"Medium",  icon:"→",   color:"#f59e0b" },
  low:     { label:"Low",     icon:"↓",   color:"#22c55e" },
  lowest:  { label:"Lowest",  icon:"↓↓",  color:"#909dab" },
};

const EPICS = [
  { id:"e1", name:"Authentication", color:"#7c3aed" },
  { id:"e2", name:"Dashboard",      color:"#0891b2" },
  { id:"e3", name:"Reporting",      color:"#059669" },
];

const RECURRENCE_OPTIONS = ["none","daily","weekly","biweekly","monthly","yearly"];
const ALL_LABELS = ["Frontend","Backend","API","Design","Testing","Docs","Bug","Enhancement"];

let issueCounter = 8;
const genKey = () => `PROJ-${++issueCounter}`;

const SEED = [
  { key:"PROJ-1", type:"story", title:"User authentication flow",    status:"Done",        priority:"high",    assignee:2, reporter:1, sp:5,  epic:"e1", labels:["Frontend","Backend"], desc:"Implement full OAuth2 login and registration.", dueDate:"2026-05-20", sprint:"Sprint 1", created:"2026-05-01 08:00:00", recurrence:"none",   notification:true,  comments:[{id:1,userId:1,text:"Looks good, merging!",date:"2026-05-15 10:30:00"}], watchers:[1,2], attach:0, department:"it" },
  { key:"PROJ-2", type:"bug",   title:"Login button broken on Safari",status:"In Progress",priority:"highest", assignee:2, reporter:1, sp:2,  epic:"e1", labels:["Bug","Frontend"],     desc:"Safari 16 users cannot click login CTA.",       dueDate:"2026-05-22", sprint:"Sprint 1", created:"2026-05-10 11:20:00", recurrence:"none",   notification:true,  comments:[], watchers:[1], attach:0, department:"it" },
  { key:"PROJ-3", type:"task",  title:"Build analytics dashboard",   status:"In Progress", priority:"medium",  assignee:3, reporter:1, sp:8,  epic:"e2", labels:["Frontend","Design"],  desc:"Main analytics dashboard with charts and KPIs.",dueDate:"2026-06-01", sprint:"Sprint 1", created:"2026-05-05 15:45:00", recurrence:"weekly", notification:true,  comments:[{id:2,userId:3,text:"Working on charts now.",date:"2026-05-18 14:15:00"}], watchers:[1,3], attach:2, department:"qa" },
  { key:"PROJ-4", type:"task",  title:"API rate limiting middleware", status:"To Do",       priority:"high",    assignee:2, reporter:1, sp:3,  epic:"e2", labels:["Backend","API"],      desc:"Add rate limiting to all public API endpoints.", dueDate:"2026-06-05", sprint:"Sprint 1", created:"2026-05-12 16:30:00", recurrence:"none",   notification:false, comments:[], watchers:[1], attach:0, department:"it" },
  { key:"PROJ-5", type:"epic",  title:"Reporting module",            status:"To Do",        priority:"medium",  assignee:1, reporter:1, sp:21, epic:"e3", labels:["Backend","Docs"],     desc:"Full reporting suite with PDF export.",          dueDate:"2026-07-01", sprint:"Sprint 2", created:"2026-05-13 10:00:00", recurrence:"monthly",notification:true,  comments:[], watchers:[1,2,3], attach:0, department:"operations" },
  { key:"PROJ-6", type:"bug",   title:"CSV export encoding broken",  status:"In Review",   priority:"high",    assignee:3, reporter:2, sp:1,  epic:"e3", labels:["Bug","Backend"],      desc:"UTF-8 characters appear as garbage in exports.", dueDate:"2026-05-23", sprint:"Sprint 1", created:"2026-05-14 13:10:00", recurrence:"none",   notification:true,  comments:[{id:3,userId:2,text:"Fix in PR #42.",date:"2026-05-17 09:45:00"}], watchers:[1,2], attach:1, department:"qa" },
  { key:"PROJ-7", type:"story", title:"User profile settings page",  status:"To Do",       priority:"low",     assignee:null,reporter:1,sp:5, epic:null,  labels:["Frontend"],           desc:"Allow users to update name, avatar, preferences.",dueDate:"2026-06-10", sprint:"Backlog",  created:"2026-05-15 14:22:00", recurrence:"none",   notification:false, comments:[], watchers:[1], attach:0, department:"it" },
  { key:"PROJ-8", type:"task",  title:"Write API documentation",     status:"To Do",        priority:"lowest",  assignee:null,reporter:1,sp:3, epic:null,  labels:["Docs"],               desc:"OpenAPI 3.0 spec for all public endpoints.",     dueDate:"2026-06-15", sprint:"Backlog",  created:"2026-05-16 11:05:00", recurrence:"none",   notification:false, comments:[], watchers:[1], attach:0, department:"it" },
];

// ─── ROOT ─────────────────────────────────────────────────────────────────────
const S = {
  root: { display: "flex", height: "100vh", background: "var(--bg-main)", color: "var(--text-main)", fontFamily: "'DM Sans','Segoe UI',system-ui,sans-serif", fontSize: 14, overflow: "hidden" },

  sidebar: { width: 240, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", flexShrink: 0, overflow: "auto", transition: "all 0.3s ease", zIndex: 1000 },
  sidebarOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 999 },
  sidebarMobile: { width: "100%", height: "auto", borderRight: "none", borderBottom: "1px solid var(--border)", position: "relative", zIndex: 100 },
  sidebarTop: { display: "flex", alignItems: "center", gap: 12, padding: "18px 16px", borderBottom: "1px solid var(--border)" },
  logoImg: { width: 46, height: 46, borderRadius: "50%", objectFit: "contain", flexShrink: 0, background: "#fff", padding: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" },
  watermark: { position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0, opacity: 0.04, mixBlendMode: "screen" },
  watermarkImg: { width: "50vw", maxWidth: 600, objectFit: "contain", filter: "invert(1) grayscale(100%)" },
  projName: { fontWeight: 800, fontSize: 15, color: "var(--text-header)", letterSpacing: "-0.02em" },
  projType: { fontSize: 11, color: "var(--text-muted)", marginTop: 2 },
  navDivider: { height: 1, background: "var(--border)", margin: "6px 0" },
  sidebarSection: { fontSize: 10, color: "var(--text-muted)", padding: "4px 12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  navItem: { display: "flex", alignItems: "center", gap: 9, padding: "8px 10px", cursor: "pointer", borderRadius: 6, margin: "1px 6px", color: "var(--text-muted)", fontSize: 13, transition: "all 0.15s" },
  navActive: { background: "var(--sidebar-active)", color: "var(--accent)" },
  navIcon: { fontSize: 14, width: 18, textAlign: "center", flexShrink: 0 },
  userSelect: { background: "var(--input-bg)", color: "var(--text-main)", border: "1px solid var(--border)", borderRadius: 6, padding: "5px 8px", fontSize: 12, cursor: "pointer", width: "100%" },
  rolePill: { borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 },

  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 },
  topBar: { minHeight: 48, borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", background: "var(--bg-header)", flexShrink: 0, flexWrap: "wrap", gap: 10 },
  breadcrumb: { display: "flex", alignItems: "center", gap: 6, fontSize: 13 },
  breadProj: { color: "var(--text-muted)" }, breadSep: { color: "var(--border)" }, breadPage: { color: "var(--text-main)", fontWeight: 600 },
  page: { flex: 1, overflow: "auto", padding: "18px 22px" },
  pageMobile: { padding: "12px 14px" },
  pageH2: { fontSize: 18, fontWeight: 700, color: "var(--text-header)", margin: "0 0 4px" },

  toolbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 10, flexWrap: "wrap" },
  searchBox: { background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 10px", color: "var(--text-main)", fontSize: 13, width: "100%", maxWidth: 190, outline: "none" },
  sel: { background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 6, padding: "6px 8px", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" },
  clearBtn: { background: "#ef444418", border: "1px solid #ef4444", color: "#f87171", borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer" },
  createBtn: { background: "var(--accent)", color: "#fff", border: "none", borderRadius: 6, padding: "8px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer" },

  sprintBar: { display: "flex", alignItems: "center", gap: 12, marginBottom: 14, padding: "9px 14px", background: "var(--card-bg)", borderRadius: 8, border: "1px solid var(--border)", flexWrap: "wrap" },
  sprintName: { fontWeight: 700, color: "var(--accent)", fontSize: 13 },
  sprintMeta: { color: "var(--text-muted)", fontSize: 12 },
  miniProgress: { width: 80, height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" },
  miniProgressFill: { height: "100%", background: "#22c55e", borderRadius: 2, transition: "width 0.3s" },

  cols: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 10, alignItems: "start" },
  col: { background: "var(--card-bg)", borderRadius: 10, padding: 10, border: "2px solid transparent", transition: "border-color 0.15s", minHeight: 120 },
  colOver: { borderColor: "var(--accent)" },
  colHeader: { display: "flex", alignItems: "center", gap: 7, marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--border)" },
  dot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  colTitle: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", flex: 1 },
  colCount: { background: "var(--border)", color: "var(--text-muted)", borderRadius: 4, padding: "1px 6px", fontSize: 11, fontWeight: 700 },
  colBody: { display: "flex", flexDirection: "column", gap: 8, minHeight: 40 },
  emptyCol: { color: "var(--border)", fontSize: 11, textAlign: "center", padding: "16px 0", border: "2px dashed var(--border)", borderRadius: 8 },

  card: { background: "var(--bg-main)", borderRadius: 8, padding: 10, cursor: "pointer", border: "1px solid var(--border)", transition: "border-color 0.15s" },
  cardTitle: { fontSize: 12, fontWeight: 500, color: "var(--text-main)", lineHeight: 1.45, marginBottom: 7 },
  cardFoot: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 },
  issueKey: { fontSize: 10, color: "var(--text-muted)", fontFamily: "monospace" },
  epicTag: { fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4, marginBottom: 6, display: "inline-block" },
  labelRow: { display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 },
  labelChip: { background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 3, padding: "1px 5px", fontSize: 10, fontWeight: 500 },
  cardStat: { color: "var(--text-muted)", fontSize: 10 },
  spBadge: { background: "var(--border)", color: "var(--text-muted)", borderRadius: 3, padding: "0 4px", fontSize: 10, fontWeight: 700 },
  recBadge: { background: "var(--sidebar-active)", color: "var(--accent)", borderRadius: 3, padding: "0 4px", fontSize: 10, fontWeight: 700 },
  unassigned: { width: 20, height: 20, borderRadius: "50%", background: "var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--text-muted)" },

  backlogBox: { background: "var(--card-bg)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" },
  backlogHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--border)", flexWrap: "wrap", gap: 8 },
  backlogHdrTitle: { fontWeight: 700, color: "var(--text-main)", fontSize: 13 },
  backlogCount: { color: "var(--text-muted)", fontSize: 12 },
  backlogRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderBottom: "1px solid var(--border)", cursor: "pointer", flexWrap: "wrap" },
  backlogKey: { color: "var(--accent)", fontSize: 11, fontFamily: "monospace", flexShrink: 0 },
  backlogTitle: { flex: 1, color: "var(--text-main)", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 150 },
  emptyBacklog: { padding: 32, textAlign: "center", color: "var(--text-muted)" },

  roadRow: { display: "flex", alignItems: "center", gap: 12, cursor: "pointer", padding: "3px 0", flexWrap: "wrap" },
  roadLabel: { width: "100%", maxWidth: 220, flexShrink: 0, display: "flex", alignItems: "center", gap: 5, overflow: "hidden" },

  peopleGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 },
  personCard: { background: "var(--card-bg)", borderRadius: 12, padding: 18, border: "1px solid var(--border)" },
  progressBar: { height: 4, background: "var(--border)", borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", background: "#22c55e", borderRadius: 2, transition: "width 0.3s" },

  panelOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" },
  panel: { width: 800, maxWidth: "95vw", background: "var(--card-bg)", maxHeight: "95vh", borderRadius: 12, overflow: "auto", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" },
  panelHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0, flexWrap: "wrap", gap: 10 },
  processFlow: { display: "flex", alignItems: "center", padding: "16px 20px", background: "var(--bg-main)", borderBottom: "1px solid var(--border)", overflowX: "auto" },
  processStep: { display: "flex", alignItems: "center", gap: 8 },
  processLine: { flex: 1, minWidth: 20, height: 2, background: "var(--border)", margin: "0 12px" },
  processLineActive: { background: "var(--accent)" },
  processDot: { width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 },
  panelKey: { color: "var(--accent)", fontFamily: "monospace", fontSize: 12 },
  statusPill: { borderRadius: 4, padding: "2px 8px", fontSize: 11, fontWeight: 700 },
  panelTitle: { fontSize: 17, fontWeight: 700, color: "var(--text-header)", cursor: "pointer", lineHeight: 1.4, margin: 0 },
  titleEdit: { flex: 1, background: "var(--bg-main)", border: "1px solid var(--accent)", borderRadius: 6, padding: "6px 10px", color: "var(--text-main)", fontSize: 15, outline: "none" },
  tabBar: { display: "flex", borderBottom: "1px solid var(--border)", paddingLeft: 20, flexShrink: 0, overflowX: "auto" },
  tab: { background: "none", border: "none", borderBottom: "2px solid transparent", color: "var(--text-muted)", padding: "9px 13px", cursor: "pointer", fontSize: 13, fontWeight: 500, marginBottom: -1, whiteSpace: "nowrap" },
  tabActive: { color: "var(--accent)", borderBottomColor: "var(--accent)" },
  panelBody: { flex: 1, padding: "18px 20px", overflow: "auto" },
  detailGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 },
  detailRight: { display: "flex", flexDirection: "column", gap: 0 },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 },
  descText: { color: "var(--text-main)", fontSize: 13, lineHeight: 1.6, cursor: "pointer", padding: "6px 8px", borderRadius: 6, border: "1px solid transparent", minHeight: 50 },
  descArea: { width: "100%", background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px", color: "var(--text-main)", fontSize: 13, outline: "none", resize: "vertical" },
  rightField: { padding: "7px 0", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 3 },
  rightLabel: { fontSize: 10, color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" },
  fieldSel: { background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 6px", color: "var(--text-main)", fontSize: 12, cursor: "pointer", width: "100%" },
  fieldInput: { background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: 4, padding: "4px 6px", color: "var(--text-main)", fontSize: 12, width: "100%", outline: "none" },

  comment: { display: "flex", gap: 9, marginBottom: 14 },
  emptyComments: { color: "var(--text-muted)", textAlign: "center", padding: "24px 0" },
  commentArea: { flex: 1, background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px", color: "var(--text-main)", fontSize: 13, outline: "none", resize: "vertical" },

  histRow: { padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 12, color: "var(--text-muted)" },

  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 10 },
  modal: { background: "var(--card-bg)", borderRadius: 12, width: 580, maxWidth: "100%", maxHeight: "90vh", overflow: "auto", border: "1px solid var(--border)", boxShadow: "0 24px 48px rgba(0,0,0,0.6)" },
  modalHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" },
  modalBody: { padding: "14px 18px", display: "flex", flexDirection: "column", gap: 12 },
  modalFoot: { display: "flex", justifyContent: "flex-end", gap: 8, padding: "12px 18px", borderTop: "1px solid var(--border)", flexWrap: "wrap" },
  formInput: { background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", color: "var(--text-main)", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box" },
  formSel: { background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", color: "var(--text-main)", fontSize: 13, cursor: "pointer", width: "100%", boxSizing: "border-box" },
  formTextarea: { background: "var(--bg-main)", border: "1px solid var(--border)", borderRadius: 6, padding: "7px 10px", color: "var(--text-main)", fontSize: 13, outline: "none", resize: "vertical", width: "100%", boxSizing: "border-box" },
  labelPickBtn: { background: "var(--card-bg)", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer" },
  labelPickActive: { background: "var(--sidebar-active)", border: "1px solid var(--accent)", color: "var(--accent)" },

  iconBtn: { background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 15, padding: "4px 7px", borderRadius: 4, position: "relative" },
  btnPrimary: { background: "var(--accent)", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 600, fontSize: 12, cursor: "pointer" },
  btnGhost: { background: "none", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 6, padding: "5px 13px", fontSize: 12, cursor: "pointer" },

  // Notification
  notifBadge: { position: "absolute", top: -2, right: -2, background: "#ef4444", color: "#fff", borderRadius: "50%", width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700 },
  notifPanel: { position: "absolute", top: 44, right: 0, width: "90vw", maxWidth: 360, background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", zIndex: 300 },
  notifPanelHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: "1px solid var(--border)" },
  notifItem: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 14px", borderBottom: "1px solid var(--border)", cursor: "pointer", transition: "background 0.15s" },

  // Todo
  statGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 20 },
  statCard: { background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 14px", textAlign: "center" },
  overdueAlert: { background: "#ef444418", border: "1px solid #ef444440", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#fca5a5", display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" },
  todoGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 },
  todoSection: { background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 10, padding: 16 },
  todoSectionHdr: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid var(--border)", fontWeight: 700, color: "var(--text-header)", fontSize: 13 },
  todoIssueRow: { display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 7, cursor: "pointer", marginBottom: 5, border: "1px solid var(--border)", background: "var(--bg-main)" },
  checklistRow: { display: "flex", alignItems: "center", gap: 9, padding: "7px 0", cursor: "pointer", borderBottom: "1px solid var(--bg-main)" },
  checkbox: { width: 16, height: 16, borderRadius: 4, border: "2px solid", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" },

  // User management
  userTableWrapper: { overflowX: "auto", borderRadius: 10, border: "1px solid var(--border)", background: "var(--card-bg)" },
  userTable: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  userTableHdr: { background: "var(--border)" },
  userTableHdrCell: { padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" },
  userTableRow: { borderBottom: "1px solid var(--border)" },
  userTableCell: { padding: "12px 16px", color: "var(--text-main)", verticalAlign: "middle" },
  permTag: { background: "var(--sidebar-active)", color: "var(--accent)", borderRadius: 4, padding: "1px 6px", fontSize: 10, fontWeight: 600, whiteSpace: "nowrap" },
};

export default function App() {
  const getCurrentDateTime = () => {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const [loggedIn, setLoggedIn]         = useState(false);
  const [forcePasswordChange, setForcePasswordChange] = useState(false);
  const [currentUser, setCurrentUser]   = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");

  const lang = currentUser?.settingsLanguage || "en";
  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;
  const isRTL = lang === "ar";

  useEffect(() => {
    document.body.className = theme === "dark" ? "" : `theme-${theme}`;
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  const [issues, setIssues]             = useState(SEED);

  const [isRefreshing, setIsRefreshing] = useState(false);

  const [users, setUsers]             = useState(INITIAL_USERS);
  const [view, setView]               = useState("board");
  const [selected, setSelected]       = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [initialCreateStatus, setInitialCreateStatus] = useState("To Do");

  const [sprint, setSprint]           = useState("Sprint 1");
  const [search, setSearch]           = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState({ type: "all", priority: "all", assignee: "all", epic: "all", domain: "all" });
  const searchInputRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const [dragOver, setDragOver]       = useState(null);
  const [notifications, setNotifs]    = useState(SEED_NOTIFICATIONS);
  const [showNotifs, setShowNotifs]   = useState(false);
  const [todos, setTodos]             = useState(() => {
    const map = {};
    Object.entries(ROLE_TODOS).forEach(([role, items]) => {
      map[role] = items.map(t => ({ ...t, done: false }));
    });
    return map;
  });
  const dragKey = useRef(null);

  // ── Viewport Response State ──
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isSmallScreen = windowWidth < 1024;
  const [sidebarOpen, setSidebarOpen] = useState(windowWidth >= 1024);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width >= 1024) setSidebarOpen(true);
      else if (width < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const role = currentUser?.role;
  const hasPermission = (perm) => {
    if (currentUser?.permissions) return currentUser.permissions.includes(perm);
    if (role && ROLES[role]?.permissions) return ROLES[role].permissions.includes(perm);
    return false;
  };
  const isAdmin = role === "admin";
  const unreadCount = notifications.filter(n => !n.read && (isAdmin || n.userId === currentUser?.id)).length;

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        return { error: data.error || 'Login failed.' };
      }
      setCurrentUser(data);
      if (data.requirePasswordChange) {
        setForcePasswordChange(true);
      } else {
        setLoggedIn(true);
      }
      setView("board");
      return { ok: true };
    } catch (err) {
      console.warn("Login API failed or network offline, falling back to local login verification:", err);
      const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      if (matchedUser) {
        setCurrentUser(matchedUser);
        setLoggedIn(true);
        setView("board");
        return { ok: true };
      } else {
        return { error: 'Invalid credentials. (Offline mode active)' };
      }
    }
  };

  const handleChangePassword = async (newPassword) => {
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, newPassword })
      });
      if (response.ok) {
        setForcePasswordChange(false);
        setLoggedIn(true);
      } else {
        return { error: 'Failed to update password.' };
      }
    } catch (err) {
      console.warn("Change password API offline, changing password locally.", err);
      setUsers(p => p.map(u => u.id === currentUser.id ? { ...u, password: newPassword, requirePasswordChange: false } : u));
      setCurrentUser(p => ({ ...p, password: newPassword, requirePasswordChange: false }));
      setForcePasswordChange(false);
      setLoggedIn(true);
      return { ok: true };
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setForcePasswordChange(false);
    setCurrentUser(null);
    setView("board");
  };

  const switchUser = (id) => {
    const u = users.find(u => u.id === +id);
    setCurrentUser(u);
    setForcePasswordChange(u.requirePasswordChange || false);
    if (!u.requirePasswordChange) setLoggedIn(true);
    setShowNotifs(false);
  };

  const visibleIssues = useMemo(() => {
    if (!currentUser) return [];
    const userDepts = currentUser.departments || [currentUser.department] || [];

    return issues.filter(i => {
      const inScope = view === "board" ? i.sprint === sprint : view === "backlog" ? i.sprint === "Backlog" : true;
      
      const departmentMatch = isAdmin || userDepts.includes(i.department) || i.assignee === currentUser.id;
      if (!departmentMatch) return false;

      const s = debouncedSearch.toLowerCase().trim();
      let bySearch = true;
      if (s) {
        const tokens = s.split(/\s+/).filter(t => t.length > 0);
        bySearch = tokens.every(token => {
          // Tokenized search (e.g. type:bug, p:high, assignee:mannan)
          if (token.includes(":")) {
            const [prefix, val] = token.split(":");
            const v = val.toLowerCase();
            if (prefix === "type") return i.type.toLowerCase() === v;
            if (prefix === "p" || prefix === "priority") return i.priority.toLowerCase() === v;
            if (prefix === "key") return i.key.toLowerCase().includes(v);
            if (prefix === "assignee") {
              if (v === "unassigned" || v === "none") return !i.assignee;
              const au = users.find(u => u.id === i.assignee);
              return au && au.name.toLowerCase().includes(v);
            }
            if (prefix === "epic") {
              const ep = EPICS.find(e => e.id === v || e.name.toLowerCase().includes(v));
              return i.epic === ep?.id;
            }
            if (prefix === "label") {
              return (i.labels || []).some(l => l.toLowerCase().includes(v));
            }
            if (prefix === "status") return i.status.toLowerCase().includes(v);
          }

          // General search
          const au = users.find(u => u.id === i.assignee);
          const assigneeName = au ? au.name.toLowerCase() : "unassigned";
          
          const ru = users.find(u => u.id === i.reporter);
          const reporterName = ru ? ru.name.toLowerCase() : "unknown";
          
          const labels = (i.labels || []).join(" ").toLowerCase();
          const epicName = EPICS.find(e => e.id === i.epic)?.name.toLowerCase() || "none";
          const deptName = DEPARTMENTS[i.department]?.label.toLowerCase() || i.department.toLowerCase();
          const typeName = ISSUE_TYPES[i.type]?.label.toLowerCase() || i.type.toLowerCase();

          return i.title.toLowerCase().includes(token) || 
                 i.key.toLowerCase().includes(token) ||
                 (i.desc && i.desc.toLowerCase().includes(token)) ||
                 i.status.toLowerCase().includes(token) ||
                 typeName.includes(token) ||
                 assigneeName.includes(token) ||
                 reporterName.includes(token) ||
                 labels.includes(token) ||
                 epicName.includes(token) ||
                 deptName.includes(token);
        });
      }
      
      const byType     = filters.type     === "all" || i.type     === filters.type;
      const byPriority = filters.priority === "all" || i.priority === filters.priority;
      const byAssignee = filters.assignee === "all" || String(i.assignee) === filters.assignee;
      const byEpic     = filters.epic     === "all" || i.epic     === filters.epic;
      const byDomain   = filters.domain   === "all" || i.department === filters.domain;
      
      return inScope && bySearch && byType && byPriority && byAssignee && byEpic && byDomain;
    });
  }, [issues, view, sprint, debouncedSearch, filters, currentUser, isAdmin, users]);

  // ── Define addNotification FIRST so all functions below can reference it ──
  const addNotification = (n) => {
    const localId = Date.now();
    setNotifs(p => [{ id: localId, ...n, time: "just now", read: false }, ...p]);

    fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(n)
    })
    .then(r => r.json())
    .then(saved => {
      if (saved && saved.id) {
        setNotifs(p => p.map(notif => notif.id === localId ? { ...notif, id: saved.id } : notif));
      }
    })
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    
    const pMeta = Promise.all([
      fetch('/api/departments').then(r => r.json()).catch(() => null),
      fetch('/api/roles').then(r => r.json()).catch(() => null)
    ]).then(([depts, roles]) => {
      if (depts && depts.length > 0) {
        const map = {};
        depts.forEach(d => { map[d.id] = d; });
        DEPARTMENTS = map;
      }
      if (roles && roles.length > 0) {
        const map = {};
        roles.forEach(d => { map[d.id] = d; });
        ROLES = map;
      }
    });

    const pUsers = pMeta.then(() => fetch('/api/users')
      .then(r => r.json())
      .then(dbUsers => {
        if (dbUsers && dbUsers.length > 0) {
          setUsers(dbUsers);
        }
      })
      .catch(err => console.warn("Could not load users from DB, using initial users seed.", err)));

    const pIssues = fetch('/api/issues')
      .then(r => {
        if (!r.ok) throw new Error("Server error");
        return r.json();
      })
      .then(dbIssues => {
        if (dbIssues && dbIssues.length > 0) {
          const normalized = dbIssues.map(i => ({
            ...i,
            assignee: i.assignee ? Number(i.assignee) : null,
            reporter: i.reporter ? Number(i.reporter) : 1,
            sp: i.sp ? Number(i.sp) : 0,
            notification: !!i.notification,
            watchers: Array.isArray(i.watchers) ? i.watchers.map(Number) : [],
            labels: Array.isArray(i.labels) ? i.labels : [],
            comments: Array.isArray(i.comments) ? i.comments.map(c => ({
              ...c,
              userId: Number(c.userId)
            })) : []
          }));
          setIssues(normalized);
          setSelected(prevSelected => {
            if (!prevSelected) return null;
            const updated = normalized.find(i => i.key === prevSelected.key);
            return updated || prevSelected;
          });
        }
      })
      .catch(err => {
        console.warn("Could not load issues from DB, falling back to local memory seed.", err);
        return fetch('/api/comments')
          .then(r => r.json())
          .then(dbComments => {
            setIssues(prev => prev.map(issue => {
              const issueComments = dbComments.filter(c => c.issueKey === issue.key);
              if (issueComments.length > 0) {
                return { ...issue, comments: issueComments };
              }
              return issue;
            }));
          })
          .catch(e => console.warn("Could not load comments fallback", e));
      });

    const pNotifs = fetch('/api/notifications')
      .then(r => {
        if (!r.ok) throw new Error("Server error");
        return r.json();
      })
      .then(dbNotifs => {
        if (dbNotifs && dbNotifs.length > 0) {
          setNotifs(dbNotifs.map(n => ({
            ...n,
            userId: Number(n.userId),
            read: !!n.read
          })));
        }
      })
      .catch(err => console.warn("Could not load notifications from DB, using seed notifications.", err));

    const pTodos = fetch('/api/todos')
      .then(r => {
        if (!r.ok) throw new Error("Server error");
        return r.json();
      })
      .then(dbTodos => {
        if (dbTodos && Object.keys(dbTodos).length > 0) {
          setTodos(dbTodos);
        }
      })
      .catch(err => console.warn("Could not load todos from DB, using local checklists.", err));

    try {
      await Promise.all([pUsers, pIssues, pNotifs, pTodos, pMeta]).finally(() => {
        setIsRefreshing(false);
      });
    } catch (e) {
      console.warn("Error running batch refresh:", e);
    }
  };

  const updateUser = async (id, patch) => {
    const prev = users.find(u => u.id === id);
    if (!prev) return;
    const updatedUser = { ...prev, ...patch };
    
    // 1. Optimistically update local state immediately
    setUsers(p => p.map(u => u.id === id ? { ...u, ...patch } : u));
    if (patch.role && prev.role !== patch.role) {
      addNotification({ type:"role_change", userId: id, message:`Your role was updated to ${ROLES[patch.role]?.label}`, issueKey: null });
    }
    if (id === currentUser?.id) {
      setCurrentUser(p => ({ ...p, ...patch }));
    }

    // 2. Perform background API call
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
    } catch (err) {
      console.warn("Failed to update user in DB, running in local mode:", err);
    }
  };

  const addUser = async (data) => {
    const color = ["#46b3cf","#10b981","#f59e0b","#ef4444","#a855f7","#ec4899"][Math.floor(Math.random()*6)];
    const avatar = data.name.slice(0,2).toUpperCase();
    const tempId = Date.now();
    const payload = {
      ...data,
      avatar,
      color,
      active: true,
      password: data.password || 'user123'
    };
    const localNewUser = {
      id: tempId,
      ...payload,
      joinDate: new Date().toISOString().split('T')[0],
      permissions: data.permissions || ROLES[data.role]?.permissions || []
    };

    // 1. Optimistically add to local state immediately
    setUsers(p => [...p, localNewUser]);

    // 2. Background API call
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const resData = await response.json();
        // Swap tempId with final database ID
        setUsers(p => p.map(u => u.id === tempId ? { ...u, id: resData.id } : u));
      }
    } catch (err) {
      console.warn("Failed to add user in DB, running in local mode:", err);
    }
  };

  const toggleActive = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const updatedUser = { ...user, active: !user.active };

    // 1. Optimistically toggle locally first
    setUsers(p => p.map(u => u.id === id ? { ...u, active: !u.active } : u));

    // 2. Background API call
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
    } catch (err) {
      console.warn("Failed to toggle user active status in DB, running in local mode:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    
    // 1. Optimistic local update
    setUsers(p => p.filter(u => u.id !== id));
    addNotification({ type: "system", userId: currentUser?.id, message: `User deleted from the roster`, issueKey: null });
    
    // 2. Background API call
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Failed to delete user in DB, running locally:", err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateIssue = useCallback((key, patch) => {
    // 1. Synchronously update local state (fully functional immediately)
    setIssues(p => {
      return p.map(i => i.key === key ? { ...i, ...patch } : i);
    });

    setSelected(p => p?.key === key ? { ...p, ...patch } : p);

    if (patch.status && currentUser) {
      addNotification({
        type: "status",
        userId: currentUser.id,
        message: `${currentUser.name} moved ${key} to ${patch.status}`,
        issueKey: key
      });
    }

    // 2. Perform background database update
    fetch(`/api/issues/${key}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...patch, updaterId: currentUser?.id })
    })
    .then(res => {
      if (res.ok) {
        refreshData();
      }
    })
    .catch(err => console.warn("Database issue update failed in background, running in local mode.", err));
  }, [currentUser, users, refreshData]);

  const createIssue = (data) => {
    if (!currentUser) return;
    const issue = {
      key: data.key || genKey(),
      type: data.type || "task",
      title: data.title,
      status: "To Do",
      priority: data.priority || "medium",
      assignee: data.assignee || null,
      reporter: currentUser.id,
      sp: data.sp || 0,
      epic: data.epic || null,
      labels: data.labels || [],
      desc: data.desc || "",
      dueDate: data.dueDate || "",
      sprint: data.sprint || "Sprint 1",
      created: getCurrentDateTime(),
      recurrence: data.recurrence || "none",
      notification: true,
      comments: [],
      watchers: [currentUser.id],
      attach: 0,
      department: data.department || currentUser.department,
    };

    // 1. Synchronously update local state
    setIssues(p => [issue, ...p]);
    if (data.assignee) {
      addNotification({
        type: "assignment",
        userId: +data.assignee,
        message: `You were assigned ${issue.key}: ${issue.title}`,
        issueKey: issue.key
      });
    }

    // 2. Perform background database creation
    fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue)
    }).catch(err => console.warn("Database issue creation failed in background, running in local mode.", err));
  };

  const createDepartment = async (data) => {
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        await refreshData();
        setShowCreateDept(false);
        addNotification({ type: "system", userId: currentUser.id, message: `New department created: ${data.label}`, issueKey: null });
      }
    } catch (err) {
      console.warn("Could not create department in DB", err);
    }
  };

  const deleteIssue = (key) => {
    if (!hasPermission("delete")) return;
    
    // 1. Synchronously update local state
    setIssues(p => p.filter(i => i.key !== key));
    setSelected(null);

    // 2. Perform background database deletion
    fetch(`/api/issues/${key}`, {
      method: 'DELETE'
    }).catch(err => console.warn("Database issue deletion failed in background, running in local mode.", err));
  };

  const addComment = async (key, text) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/issues/${key}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, text })
      });
      if (res.ok) {
        const c = await res.json();
        setIssues(p => p.map(i => i.key === key ? { ...i, comments: [...i.comments, c] } : i));
        setSelected(p => p?.key === key ? { ...p, comments: [...p.comments, c] } : p);
        addNotification({ type: "comment", userId: currentUser.id, message: `${currentUser.name} commented on ${key}`, issueKey: key });
      } else {
        throw new Error("HTTP error " + res.status);
      }
    } catch (e) {
      console.warn("Could not save comment in DB, adding to local state only.", e);
      const c = { id: Date.now(), userId: currentUser.id, text, date: getCurrentDateTime() };
      setIssues(p => p.map(i => i.key === key ? { ...i, comments: [...i.comments, c] } : i));
      setSelected(p => p?.key === key ? { ...p, comments: [...p.comments, c] } : p);
    }
  };

  const markAllRead = () => {
    setNotifs(p => p.map(n => ({ ...n, read: true })));
    fetch('/api/notifications/read', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.warn("Could not update notifications read status in DB", err));
  };

  const dismissNotif = (id) => {
    setNotifs(p => p.filter(n => n.id !== id));
    fetch(`/api/notifications/${id}`, {
      method: 'DELETE'
    }).catch(err => console.warn("Could not delete notification in DB", err));
  };

  const onDragStart = (e, key) => { dragKey.current = key; e.dataTransfer.effectAllowed = "move"; };
  const onDrop = (e, status) => {
    e.preventDefault();
    if (dragKey.current) { updateIssue(dragKey.current, { status }); dragKey.current = null; }
    setDragOver(null);
  };

  const sprints = [...new Set(issues.map(i => i.sprint).filter(s => s !== "Backlog"))];

  const userNotifs = isAdmin ? notifications : notifications.filter(n => currentUser && n.userId === currentUser.id);

  // Nav items based on role — admins/managers see everything, regular users see filtered views
  const navItems = [
    { id:"board",   icon:"⊞", label:t("board"),   show: isAdmin || hasPermission("view_all"), section: "core" },
    { id:"backlog", icon:"☰", label:t("backlog"),  show: isAdmin || hasPermission("view_all"), section: "core" },
    { id:"roadmap", icon:"⊟", label:t("roadmap"),  show: isAdmin || hasPermission("view_all"), section: "core" },
    { id:"people",  icon:"⬡", label:t("people"),   show: isAdmin || hasPermission("view_all"), section: "core" },
    { id:"mytasks", icon:"☑", label:t("mytasks"), show: !isAdmin, section: "core" },
    { id:"todos",   icon:"☑", label:t("todos"),show: isAdmin || hasPermission("view_all"), section: "core" },
    
    { id:"departments", icon:"🏢", label:t("departments"), show: true, section: "project" },
    { id:"users",       icon:"👥", label:t("users"),   show: hasPermission("manage_users"), section: "project" },
    { id:"settings",    icon:"⚙",  label:t("settings"),    show: hasPermission("manage_users"), section: "project" },
    { id:"components",  icon:"◈",  label:t("components"),  show: true, section: "project" },
    { id:"architecture",icon:"⛁",  label:t("architecture"),   show: isAdmin, section: "project" },
  ].filter(n => n.show);

  // Set default view per role
  const resolvedView = (!isAdmin && !hasPermission("view_all") && view === "board") ? "mytasks" : view;

  if (!loggedIn && !forcePasswordChange) {
    return <LoginScreen users={users} onLogin={handleLogin} />;
  }

  if (forcePasswordChange) {
    return <ChangePasswordScreen user={currentUser} onChange={handleChangePassword} onLogout={handleLogout} />;
  }

  const currentSidebarStyle = isSmallScreen
    ? { ...S.sidebar, ...S.sidebarMobile, display: sidebarOpen ? "flex" : "none", position: "fixed", top: 0, left: 0, bottom: 0, width: "280px", boxShadow: "10px 0 30px rgba(0,0,0,0.5)" }
    : S.sidebar;

  const NavItem = ({ n }) => (
    <div key={n.id} style={{ ...S.navItem, ...(resolvedView===n.id?S.navActive:{}) }} onClick={() => { setView(n.id); if(isSmallScreen) setSidebarOpen(false); }}>
      <span style={S.navIcon}>{n.icon}</span>
      <span>{n.label}</span>
    </div>
  );

  return (
    <div style={{ ...S.root, flexDirection: isMobile ? "column" : "row" }}>
      {/* ── WATERMARK ── */}
      <div style={S.watermark}>
        <img src="/logo.png" style={S.watermarkImg} alt="" />
      </div>

      {/* ── SIDEBAR OVERLAY ── */}
      {isSmallScreen && sidebarOpen && (
        <div style={S.sidebarOverlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={currentSidebarStyle}>
        <div style={S.sidebarTop}>
          <img src="/logo.png" alt="Logo" style={S.logoImg} />
          <div>
            <div style={S.projName}>Metapharsic To Do</div>
            <div style={S.projType}>{isAdmin ? "Admin Portal" : "Team Portal"}</div>
          </div>
          {isSmallScreen && <button style={{ ...S.iconBtn, marginInlineStart: "auto" }} onClick={() => setSidebarOpen(false)}>✕</button>}
        </div>
        
        <nav style={{ padding:"6px 0", flex: 1 }}>
          {navItems.filter(n => n.section === "core").map(n => <NavItem key={n.id} n={n} />)}
          
          <div style={S.navDivider} />
          <div style={S.sidebarSection}>{t("project")}</div>
          {navItems.filter(n => n.section === "project").map(n => <NavItem key={n.id} n={n} />)}
        </nav>

        {/* Role badge */}

        <div style={{ margin:"8px 10px", padding:"8px 10px", background:"#2d333b", borderRadius:8, border:"1px solid #444c56" }}>
          <div style={{ fontSize:10, color:"#768390", fontWeight:700, marginBottom:4, textTransform:"uppercase" }}>{t("loggedInAs")}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <Avatar user={currentUser} size={24} />
            <span style={{ color:"#cdd9e5", fontSize:13, fontWeight:600 }}>{currentUser?.name}</span>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <span style={{ ...S.rolePill, background: (DEPARTMENTS[currentUser?.department]?.color||"#6366f1")+"25", color: DEPARTMENTS[currentUser?.department]?.color||"#6366f1" }}>
              {DEPARTMENTS[currentUser?.department]?.icon} {DEPARTMENTS[currentUser?.department]?.label}
            </span>
            <span style={{ ...S.rolePill, background:"#444c56", color:"#adbac7" }}>
              {ROLES[currentUser?.role]?.label}
            </span>
          </div>
          {isAdmin && (
            <select style={{ ...S.userSelect, marginTop:6 }} value={currentUser?.id} onChange={e => switchUser(e.target.value)}>
              {users.filter(u => u.active).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
          <button
            onClick={handleLogout}
            style={{ marginTop:8, width:"100%", background:"#3d1c1c", color:"#f87171", border:"1px solid #6b2121", borderRadius:6, padding:"5px 0", fontSize:12, cursor:"pointer", fontWeight:600 }}
          >
            💪 {t("signOut")}
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={S.main}>
        {/* Top bar */}
        <header style={S.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isSmallScreen && (
              <button style={{ ...S.iconBtn, fontSize: 20 }} onClick={() => setSidebarOpen(true)}>☰</button>
            )}
            <div style={S.breadcrumb}>
              {!isMobile && <span style={S.breadProj}>Metapharsic To Do</span>}
              {!isMobile && <span style={{ ...S.breadSep, marginInline: 6 }}>/</span>}
              <span style={S.breadPage}>{navItems.find(n=>n.id===resolvedView)?.label || resolvedView.charAt(0).toUpperCase()+resolvedView.slice(1)}</span>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Refresh Button */}
            <button 
              style={{ ...S.iconBtn, fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }} 
              onClick={refreshData}
              disabled={isRefreshing}
              title="Sync with database"
            >
              <span style={{ 
                display: "inline-block", 
                animation: isRefreshing ? "spin 1s linear infinite" : "none"
              }}>
                🔄
              </span>
            </button>
            {/* Notification Bell */}
            <div style={{ position:"relative" }}>
              <button style={{ ...S.iconBtn, position:"relative", fontSize:18 }} onClick={() => setShowNotifs(p => !p)}>
                🔔
                {unreadCount > 0 && (
                  <span style={S.notifBadge}>{unreadCount > 9 ? "9+" : unreadCount}</span>
                )}
              </button>
              {showNotifs && (
                <NotificationPanel
                  notifications={userNotifs}
                  onClose={() => setShowNotifs(false)}
                  onMarkAllRead={markAllRead}
                  onDismiss={dismissNotif}
                  onSelectIssue={(key) => { const i = issues.find(x=>x.key===key); if(i) { setSelected(i); setShowNotifs(false); }}}
                />
              )}
            </div>
            <Avatar user={currentUser} size={30} />
            {!isMobile && <span style={{ fontSize:13, color:"#adbac7" }}>{currentUser.name}</span>}
          </div>
        </header>

        {/* Page */}
        <div style={{ ...S.page, ...(isMobile ? S.pageMobile : {}) }}>
          {view === "board" && (
            <BoardView
              issues={visibleIssues} sprints={sprints} sprint={sprint} setSprint={setSprint}
              search={search} setSearch={setSearch} filters={filters} setFilters={setFilters}
              onDragStart={onDragStart} onDrop={onDrop} dragOver={dragOver} setDragOver={setDragOver}
              onSelect={setSelected}
              onCreate={(status) => {
                setInitialCreateStatus(typeof status === 'string' ? status : "To Do");
                setShowCreate(true);
              }}
              allIssues={issues} canCreate={hasPermission("create")} users={users} isMobile={isMobile}
              t={t}
              searchInputRef={searchInputRef}
            />
          )}
          {view === "backlog" && (
            <BacklogView
              issues={visibleIssues} search={search} setSearch={setSearch}
              filters={filters} setFilters={setFilters}
              onSelect={setSelected}
              onCreate={(status) => {
                setInitialCreateStatus(typeof status === 'string' ? status : "To Do");
                setShowCreate(true);
              }}
              canCreate={hasPermission("create")} users={users} isMobile={isMobile}
              t={t}
              searchInputRef={searchInputRef}
            />
          )}
          {view === "roadmap" && <RoadmapView issues={issues} onSelect={setSelected} />}
          {view === "people"  && <PeopleView  users={users} issues={issues} isAdmin={isAdmin} />}
          {(view === "todos" || view === "mytasks") && (
            <UserDashboard
              currentUser={currentUser}
              isAdmin={isAdmin}
              todos={todos[role] || []}
              setTodos={(updated) => {
                const currentRoleTodos = todos[role] || [];
                const changed = updated.find((item, idx) => item.done !== currentRoleTodos[idx]?.done);
                if (changed) {
                  fetch(`/api/todos/${changed.id}/toggle`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ done: changed.done })
                  }).catch(err => console.warn("Could not toggle todo in DB", err));
                }
                setTodos(p => ({ ...p, [role]: updated }));
              }}
              issues={visibleIssues}
              users={users}
              onSelectIssue={setSelected}
              onCreateIssue={(status) => {
                setInitialCreateStatus(typeof status === 'string' ? status : "To Do");
                setShowCreate(true);
              }}
              isMobile={isMobile}
              search={search}
              setSearch={setSearch}
              searchInputRef={searchInputRef}
              t={t}
            />
          )}
          {view === "users" && hasPermission("manage_users") && (
            <UserManagement
              users={users} setUsers={setUsers}
              currentUser={currentUser} setCurrentUser={setCurrentUser} issues={issues}
              addNotification={addNotification}
              isMobile={isMobile}
              setView={setView}
              setFilters={setFilters}
            />
          )}
          {view === "architecture" && <ArchitectureView />}
          {view === "departments" && (
            <DepartmentsView 
              currentUser={currentUser} 
              isAdmin={isAdmin} 
              users={users} 
              onAdd={() => setShowCreateDept(true)}
              t={t}
            />
          )}
          {view === "settings" && <SettingsView theme={theme} setTheme={setTheme} currentUser={currentUser} updateUser={updateUser} users={users} t={t} />}
          {view === "components" && <ComponentsView />}
        </div>
      </div>

      {/* ── DETAIL PANEL ── */}
      {selected && (
        <DetailPanel
          issue={selected}
          onClose={() => setSelected(null)}
          onUpdate={p => updateIssue(selected.key, p)}
          onDelete={() => deleteIssue(selected.key)}
          onComment={t => addComment(selected.key, t)}
          currentUser={currentUser}
          isAdmin={isAdmin}
          hasPermission={hasPermission}
          users={users}
        />
      )}

      {/* ── CREATE MODAL ── */}
      {showCreate && hasPermission("create") && (
        <CreateModal
          initialStatus={initialCreateStatus}
          onClose={() => setShowCreate(false)}
          onCreate={data => { createIssue(data); setShowCreate(false); }}
          currentUser={currentUser}
          users={users}
        />
      )}

      {/* ── CREATE DEPARTMENT MODAL ── */}
      {showCreateDept && isAdmin && (
        <AddDeptModal
          onClose={() => setShowCreateDept(false)}
          onAdd={(data) => {
            if (data.id && data.label) {
              createDepartment(data);
            } else {
              setShowCreateDept(false);
            }
          }}
        />
      )}
    </div>
  );
}

// ─── NOTIFICATION PANEL ───────────────────────────────────────────────────────
function NotificationPanel({ notifications, onClose, onMarkAllRead, onDismiss, onSelectIssue }) {
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);

  return (
    <div ref={ref} style={S.notifPanel}>
      <div style={S.notifPanelHdr}>
        <span style={{ fontWeight:700, color:"#e6edf3" }}>Notifications</span>
        <div style={{ display:"flex", gap:6 }}>
          <button style={{ ...S.iconBtn, fontSize:11 }} onClick={onMarkAllRead}>Mark all read</button>
          <button style={S.iconBtn} onClick={onClose}>✕</button>
        </div>
      </div>
      <div style={{ maxHeight:380, overflowY:"auto" }}>
        {notifications.length === 0 && (
          <div style={{ padding:24, textAlign:"center", color:"#768390", fontSize:13 }}>No notifications</div>
        )}
        {notifications.map(n => {
          const nt = NOTIFICATION_TYPES[n.type];
          return (
            <div key={n.id} style={{ ...S.notifItem, background: n.read ? "transparent" : "#2d333b" }}>
              <span style={{ fontSize:16, flexShrink:0 }}>{nt?.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, color: n.read ? "#909dab" : "#cdd9e5", lineHeight:1.45 }}>{n.message}</div>
                <div style={{ fontSize:10, color:"#768390", marginTop:2 }}>{n.time}</div>
                {n.issueKey && (
                  <button style={{ ...S.iconBtn, fontSize:11, padding:"2px 6px", marginTop:4, color:"#46b3cf", border:"1px solid #2d4052", borderRadius:4 }}
                    onClick={() => onSelectIssue(n.issueKey)}>
                    View {n.issueKey}
                  </button>
                )}
              </div>
              {!n.read && <span style={{ width:7, height:7, borderRadius:"50%", background: nt?.color, flexShrink:0 }} />}
              <button style={{ ...S.iconBtn, fontSize:11, flexShrink:0 }} onClick={() => onDismiss(n.id)}>✕</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TODO VIEW ────────────────────────────────────────────────────────────────
function TodoView({ currentUser, todos, setTodos, issues, users, onSelectIssue }) {
  const role = currentUser.role;
  const myIssues = issues.filter(i => i.assignee === currentUser.id && i.status !== "Done");
  const overdue  = issues.filter(i => i.assignee === currentUser.id && i.dueDate && new Date(i.dueDate) < new Date("2026-05-19") && i.status !== "Done");

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const priorityColor = { high:"#ef4444", medium:"#f59e0b", low:"#22c55e" };

  const grouped = todos.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  const done = todos.filter(t => t.done).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={S.pageH2}>My Task Dashboard</h2>
          <div style={{ fontSize:13, color:"#909dab" }}>
            {ROLES[role]?.label} · {DEPARTMENTS[currentUser.department]?.label} Department
          </div>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={S.statCard}>
            <div style={{ fontSize:22, fontWeight:700, color:"#46b3cf" }}>{myIssues.length}</div>
            <div style={{ fontSize:11, color:"#909dab" }}>Assigned Issues</div>
          </div>
          <div style={S.statCard}>
            <div style={{ fontSize:22, fontWeight:700, color:"#ef4444" }}>{overdue.length}</div>
            <div style={{ fontSize:11, color:"#909dab" }}>Overdue</div>
          </div>
          <div style={S.statCard}>
            <div style={{ fontSize:22, fontWeight:700, color:"#22c55e" }}>{done}/{todos.length}</div>
            <div style={{ fontSize:11, color:"#909dab" }}>Checklist Done</div>
          </div>
        </div>
      </div>

      {overdue.length > 0 && (
        <div style={S.overdueAlert}>
          ⏰ <strong>Overdue Issues:</strong>{" "}
          {overdue.map(i => (
            <button key={i.key} style={{ background:"none", border:"none", color:"#fbbf24", cursor:"pointer", fontWeight:600, fontSize:12, padding:"0 4px", textDecoration:"underline" }}
              onClick={() => onSelectIssue(i)}>
              {i.key}
            </button>
          ))}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        {/* Assigned Issues */}
        <div style={S.todoSection}>
          <div style={S.todoSectionHdr}>
            <span>📋 Assigned to Me</span>
            <span style={S.colCount}>{myIssues.length}</span>
          </div>
          {myIssues.length === 0 ? (
            <div style={{ color:"#768390", fontSize:13, padding:"16px 0", textAlign:"center" }}>No open issues assigned 🎉</div>
          ) : myIssues.map(i => {
            const sc = STATUS_COLORS[i.status];
            const pi = PRIORITIES[i.priority];
            const ti = ISSUE_TYPES[i.type];
            return (
              <div key={i.key} style={S.todoIssueRow} onClick={() => onSelectIssue(i)}>
                <span style={{ color: ti.color, fontSize:12 }}>{ti.icon}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, color:"#cdd9e5", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{i.title}</div>
                  <div style={{ display:"flex", gap:6, marginTop:3 }}>
                    <span style={{ ...S.statusPill, background: sc.bg, color: sc.text, fontSize:10 }}>{i.status}</span>
                    <span style={{ color:"#46b3cf", fontSize:10, fontFamily:"monospace" }}>{i.key}</span>
                  </div>
                </div>
                <span style={{ color: pi.color, fontSize:12 }}>{pi.icon}</span>
              </div>
            );
          })}
        </div>

        {/* Role Checklist */}
        <div style={S.todoSection}>
          <div style={S.todoSectionHdr}>
            <span>✅ Role Checklist — {ROLES[role]?.label}</span>
            <div style={{ ...S.miniProgress, width:80 }}>
              <div style={{ ...S.miniProgressFill, width: todos.length ? `${(done/todos.length)*100}%` : "0%" }} />
            </div>
          </div>
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#768390", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>{cat}</div>
              {items.map(t => (
                <div key={t.id} style={S.checklistRow} onClick={() => toggleTodo(t.id)}>
                  <div style={{ ...S.checkbox, borderColor: t.done ? "#22c55e" : "#444c56", background: t.done ? "#22c55e" : "transparent" }}>
                    {t.done && <span style={{ color:"#fff", fontSize:10, lineHeight:1 }}>✓</span>}
                  </div>
                  <span style={{ flex:1, fontSize:12, color: t.done ? "#768390" : "#cdd9e5", textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                  <span style={{ width:8, height:8, borderRadius:"50%", background: priorityColor[t.priority], flexShrink:0 }} title={t.priority} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── USER MANAGEMENT ──────────────────────────────────────────────────────────
function UserManagement({ users, setUsers, currentUser, setCurrentUser, issues, addNotification, isMobile, setView, setFilters, t }) {
  const [editUser, setEditUser] = useState(null);
  const [showAdd, setShowAdd]   = useState(false);
  const [filterDept, setFilterDept] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = users.filter(u => {
    const matchesDept = filterDept === "all" || (u.departments || [u.department] || []).includes(filterDept);
    const matchesRole = filterRole === "all" || u.role === filterRole;
    const s = search.toLowerCase().trim();
    const matchesSearch = !s || 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s) || 
      (u.phone && u.phone.includes(s)) ||
      u.department.toLowerCase().includes(s) ||
      ROLES[u.role]?.label.toLowerCase().includes(s);
    return matchesDept && matchesRole && matchesSearch;
  });

  const updateUser = async (id, patch) => {
    const prev = users.find(u => u.id === id);
    const updatedUser = { ...prev, ...patch };
    
    // 1. Optimistically update local state immediately
    setUsers(p => p.map(u => u.id === id ? { ...u, ...patch } : u));
    if (patch.role && prev.role !== patch.role) {
      addNotification({ type:"role_change", userId: id, message:`Your role was updated to ${ROLES[patch.role]?.label}`, issueKey: null });
    }
    if (id === currentUser.id) {
      setCurrentUser(p => ({ ...p, ...patch }));
    }
    setEditUser(null);

    // 2. Perform background API call
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
    } catch (err) {
      console.warn("Failed to update user in DB, running in local mode:", err);
    }
  };

  const addUser = async (data) => {
    const color = ["#46b3cf","#10b981","#f59e0b","#ef4444","#a855f7","#ec4899"][Math.floor(Math.random()*6)];
    const avatar = data.name.slice(0,2).toUpperCase();
    const tempId = Date.now();
    const payload = {
      ...data,
      avatar,
      color,
      active: true,
      password: data.password || 'user123'
    };
    const localNewUser = {
      id: tempId,
      ...payload,
      joinDate: new Date().toISOString().split('T')[0],
      permissions: data.permissions || ROLES[data.role]?.permissions || []
    };

    // 1. Optimistically add to local state immediately
    setUsers(p => [...p, localNewUser]);
    setShowAdd(false);

    // 2. Background API call
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        const resData = await response.json();
        // Swap tempId with final database ID
        setUsers(p => p.map(u => u.id === tempId ? { ...u, id: resData.id } : u));
      }
    } catch (err) {
      console.warn("Failed to add user in DB, running in local mode:", err);
    }
  };

  const toggleActive = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    const updatedUser = { ...user, active: !user.active };

    // 1. Optimistically toggle locally first
    setUsers(p => p.map(u => u.id === id ? { ...u, active: !u.active } : u));

    // 2. Background API call
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser)
      });
    } catch (err) {
      console.warn("Failed to toggle user active status in DB, running in local mode:", err);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;
    
    // 1. Optimistic local update
    setUsers(p => p.filter(u => u.id !== id));
    addNotification({ type: "system", userId: currentUser.id, message: `User deleted from the roster`, issueKey: null });
    
    // 2. Background API call
    try {
      await fetch(`/api/users/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn("Failed to delete user in DB, running locally:", err);
    }
  };

  const getUserIssueCount = (id) => issues.filter(i => i.assignee === id && i.status !== "Done").length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexDirection: isMobile ? "column" : "row", gap: 14 }}>
        <div style={{ textAlign: isMobile ? "center" : "left" }}>
          <h2 style={S.pageH2}>User Management</h2>
          <div style={{ fontSize:13, color:"#909dab" }}>{users.length} total · {users.filter(u=>u.active).length} active</div>
        </div>
        <button style={{ ...S.createBtn, width: isMobile ? "100%" : "auto" }} onClick={() => setShowAdd(true)}>+ Add User</button>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap: "wrap" }}>
        <select style={{ ...S.sel, flex: isMobile ? 1 : "initial" }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="all">All Departments</option>
          {Object.entries(DEPARTMENTS).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
        </select>
        <select style={{ ...S.sel, flex: isMobile ? 1 : "initial" }} value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      {/* Dept summary cards */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(auto-fill, minmax(140px, 1fr))" : "repeat(5,1fr)", gap:10, marginBottom:20 }}>
        {Object.entries(DEPARTMENTS).map(([dk, dv]) => {
          const count = users.filter(u => u.department === dk && u.active).length;
          return (
            <div key={dk} style={{ ...S.statCard, borderTop:`3px solid ${dv.color}`, cursor:"pointer" }}
              onClick={() => setFilterDept(dk === filterDept ? "all" : dk)}>
              <div style={{ fontSize:18 }}>{dv.icon}</div>
              <div style={{ fontWeight:700, color:"#e6edf3", fontSize:16 }}>{count}</div>
              <div style={{ fontSize:11, color:"#909dab" }}>{dv.label}</div>
            </div>
          );
        })}
      </div>

      {/* User Table */}
      <div style={S.userTableWrapper}>
        <table style={S.userTable}>
          <thead style={S.userTableHdr}>
            <tr>
              <th style={S.userTableHdrCell}>User</th>
              <th style={S.userTableHdrCell}>Department</th>
              <th style={S.userTableHdrCell}>Role</th>
              {!isMobile && <th style={S.userTableHdrCell}>Permissions</th>}
              <th style={S.userTableHdrCell}>Issues</th>
              <th style={S.userTableHdrCell}>Status</th>
              <th style={S.userTableHdrCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => {
              const dept = DEPARTMENTS[u.department];
              const roleInfo = ROLES[u.role];
              const iCount = getUserIssueCount(u.id);
              const isMe = u.id === currentUser.id;
              return (
                <tr key={u.id} style={{ ...S.userTableRow, opacity: u.active ? 1 : 0.5 }}>
                  <td 
                    style={{ ...S.userTableCell, cursor: "pointer", transition: "background 0.2s" }}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, assignee: String(u.id) }));
                      setView("board");
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(88, 166, 255, 0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    title={`Click to view Kanban board filtered by ${u.name}`}
                  >
                    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                      <Avatar user={u} size={34} />
                      <div>
                        <div style={{ fontWeight:600, color:"var(--accent)", fontSize:13 }}>
                          {u.name} {isMe && <span style={{ fontSize:10, color:"#46b3cf" }}>(you)</span>}
                          {u.phoneVerified && <span title="WhatsApp Verified" style={{ fontSize:12, marginLeft:4 }}>📱✅</span>}
                        </div>
                        {!isMobile && <div style={{ fontSize:11, color:"#768390" }}>{u.email}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={S.userTableCell}>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                      {(u.departments && u.departments.length > 0 ? u.departments : [u.department]).map(dk => {
                        const d = DEPARTMENTS[dk];
                        return (
                          <div key={dk} style={{ display:"flex", alignItems:"center", gap:4, background:"rgba(255,255,255,0.05)", padding:"2px 6px", borderRadius:4, border:"1px solid rgba(255,255,255,0.1)" }} title={d?.label}>
                             <span style={{ fontSize:10 }}>{d?.icon}</span>
                             <span style={{ fontSize:10, color:"#adbac7", fontWeight:600 }}>{dk.toUpperCase()}</span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td style={S.userTableCell}>
                    <span style={{ ...S.rolePill, background: "#2d4052", color:"#7dc3db" }}>{roleInfo?.label}</span>
                  </td>
                  {!isMobile && (
                    <td style={S.userTableCell}>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                        {(u.permissions || roleInfo?.permissions || []).slice(0,3).map(p => (
                          <span key={p} style={S.permTag}>{p}</span>
                        ))}
                      </div>
                    </td>
                  )}
                  <td 
                    style={{ ...S.userTableCell, cursor: "pointer", transition: "background 0.2s" }}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, assignee: String(u.id) }));
                      setView("board");
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(88, 166, 255, 0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    title={`Click to see issues assigned to ${u.name}`}
                  >
                    <span style={{ fontWeight:600, color: iCount > 0 ? "#f59e0b" : "#22c55e", fontSize:13, textDecoration: "underline", textUnderlineOffset: "3px" }}>{iCount}</span>
                  </td>
                  <td style={S.userTableCell}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ width:7, height:7, borderRadius:"50%", background: u.active ? "#22c55e" : "#ef4444" }} />
                      <span style={{ fontSize:12, color: u.active ? "#4ade80" : "#f87171" }}>{u.active ? "Active" : "Inactive"}</span>
                    </div>
                  </td>
                  <td style={S.userTableCell}>
                    <div style={{ display:"flex", gap:6, flexWrap: "wrap" }}>
                      <button style={{ ...S.btnGhost, fontSize:11, padding:"3px 8px" }} onClick={() => setEditUser(u)}>Edit</button>
                      {!isMe && (
                        <>
                          <button style={{ ...S.btnGhost, fontSize:11, padding:"3px 8px", color: u.active ? "#f87171" : "#4ade80" }}
                            onClick={() => toggleActive(u.id)}>
                            {u.active ? "Off" : "On"}
                          </button>
                          <button style={{ ...S.btnGhost, fontSize:11, padding:"3px 8px", borderColor: "rgba(239, 68, 68, 0.4)", color: "#ef4444" }}
                            onClick={() => deleteUser(u.id)}>
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <EditUserModal user={editUser} onClose={() => setEditUser(null)} onSave={(patch) => updateUser(editUser.id, patch)} />
      )}
      {showAdd && (
        <AddUserModal onClose={() => setShowAdd(false)} onAdd={addUser} />
      )}
    </div>
  );
}

const ALL_PERMISSIONS = ["create", "edit", "delete", "assign", "manage_users", "view_all", "manage_roles", "approve"];

function EditUserModal({ user, onClose, onSave }) {
  const [draft, setDraft] = useState({
    id:                    user.id,
    name:                  user.name,
    avatar:                user.avatar,
    email:                 user.email,
    color:                 user.color,
    active:                user.active,
    department:            user.department,
    departments:           user.departments || [user.department],
    role:                  user.role,
    permissions:           user.customPermissions || user.permissions || ROLES[user.role]?.permissions || [],
    phone:                 user.phone || "",

    notificationEmail:     user.notificationEmail !== false,
    notificationWhatsapp:  user.notificationWhatsapp || false,
    requirePasswordChange: user.requirePasswordChange || false,
  });

  // WhatsApp OTP state
  const [waStep, setWaStep]         = useState("idle"); // idle | setup | sent | verified | error
  const [waApiKey, setWaApiKey]     = useState("");
  const [waOtp, setWaOtp]           = useState("");
  const [waError, setWaError]       = useState("");
  const [waSending, setWaSending]   = useState(false);

  const handleRoleChange = (newRole) => {
    setDraft(p => ({
      ...p,
      role: newRole,
      permissions: ROLES[newRole]?.permissions || []
    }));
  };

  const sendOtp = async () => {
    if (!draft.phone || !waApiKey) { setWaError("Enter both phone and API key."); return; }
    setWaSending(true); setWaError("");
    try {
      const r = await fetch(`/api/users/${user.id}/send-whatsapp-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: draft.phone, callmebotApikey: waApiKey })
      });
      const d = await r.json();
      if (r.ok) { setWaStep("sent"); }
      else { setWaError(d.error || "Failed to send OTP."); }
    } catch { setWaError("Network error. Try again."); }
    setWaSending(false);
  };

  const verifyOtp = async () => {
    if (!waOtp) { setWaError("Enter the OTP code."); return; }
    setWaSending(true); setWaError("");
    try {
      const r = await fetch(`/api/users/${user.id}/verify-whatsapp-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp: waOtp })
      });
      const d = await r.json();
      if (r.ok) {
        setWaStep("verified");
        setDraft(p => ({ ...p, notificationWhatsapp: true }));
      } else { setWaError(d.error || "Verification failed."); }
    } catch { setWaError("Network error. Try again."); }
    setWaSending(false);
  };

  const waBoxStyle = {
    background:"#1c2128", border:"1px solid #30363d",
    borderRadius:10, padding:14, display:"flex", flexDirection:"column", gap:10
  };
  const stepBadge = (txt, color) => (
    <span style={{ fontSize:10, fontWeight:700, background: color+"20", color, padding:"2px 8px", borderRadius:20, alignSelf:"flex-start" }}>{txt}</span>
  );

  return (
    <div style={S.modalOverlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ ...S.modal, width:480, maxHeight:"90vh", overflowY:"auto" }}>
        <div style={S.modalHdr}>
          <span style={{ fontWeight:700, color:"#e6edf3" }}>Edit User — {user.name}</span>
          <button style={S.iconBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ ...S.modalBody, gap:14 }}>
          {/* Avatar + info */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"6px 0" }}>
            <Avatar user={user} size={44} />
            <div>
              <div style={{ fontWeight:600, color:"#e6edf3" }}>{user.name}</div>
              <div style={{ fontSize:12, color:"#909dab" }}>{user.email}</div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:5 }}>Name</label>
            <input style={S.formInput} value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} />
          </div>

          {/* Department(s) */}
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:8 }}>Domain Responsibilities (Multiple)</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, background:"#22272e", padding:12, borderRadius:8, border:"1px solid #444c56" }}>
              {Object.entries(DEPARTMENTS).map(([dk, dv]) => {
                const isSelected = (draft.departments || []).includes(dk);
                return (
                  <div key={dk} onClick={() => toggleDept(dk)}
                    style={{
                      display:"flex", alignItems:"center", gap:8, padding:"6px 10px", borderRadius:6, cursor:"pointer",
                      background: isSelected ? dv.color+"20" : "transparent",
                      border: `1px solid ${isSelected ? dv.color+"50" : "transparent"}`,
                      transition: "all 0.2s"
                    }}>
                    <span style={{ fontSize:14 }}>{dv.icon}</span>
                    <span style={{ fontSize:12, color: isSelected ? dv.color : "#adbac7", fontWeight: isSelected ? 700 : 400 }}>{dv.label}</span>
                    {isSelected && <span style={{ marginLeft:"auto", color:dv.color, fontSize:10 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:5 }}>Role</label>
            <select style={S.formSel} value={draft.role} onChange={e => handleRoleChange(e.target.value)}>
              {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          {/* Force password change */}
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", userSelect:"none" }}>
            <input type="checkbox" checked={draft.requirePasswordChange}
              onChange={e => setDraft(p => ({ ...p, requirePasswordChange: e.target.checked }))} style={{ cursor:"pointer" }} />
            <span style={{ fontSize:13, color:"#adbac7" }}>Force password change on next login</span>
          </label>

          {/* Custom Permissions */}
          <div>
            <div style={{ fontSize:12, color:"#909dab", fontWeight:600, marginBottom:8 }}>Configure Custom Permissions</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, background:"#22272e", padding:12, borderRadius:8, border:"1px solid #444c56" }}>
              {ALL_PERMISSIONS.map(p => {
                const has = draft.permissions.includes(p);
                return (
                  <label key={p} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, color:"#adbac7", cursor:"pointer", userSelect:"none" }}>
                    <input type="checkbox" checked={has}
                      onChange={() => {
                        const next = has ? draft.permissions.filter(x => x !== p) : [...draft.permissions, p];
                        setDraft(prev => ({ ...prev, permissions: next }));
                      }} style={{ cursor:"pointer" }} />
                    <span>{p}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Notification Settings ── */}
          <div style={{ borderTop:"1px solid #30363d", paddingTop:14 }}>
            <div style={{ fontSize:12, color:"#909dab", fontWeight:700, marginBottom:10, letterSpacing:"0.5px", textTransform:"uppercase" }}>📣 Notification Settings</div>

            {/* Email toggle */}
            <label style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", marginBottom:10, padding:"8px 10px", background:"#22272e", borderRadius:8, border:"1px solid #30363d" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:16 }}>📧</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:"#e6edf3" }}>Email Notifications</div>
                  <div style={{ fontSize:11, color:"#768390" }}>Receive task alerts via email</div>
                </div>
              </div>
              <div style={{
                width:36, height:20, borderRadius:20, background: draft.notificationEmail ? "#22c55e" : "#444c56",
                position:"relative", transition:"background 0.2s", cursor:"pointer"
              }} onClick={() => setDraft(p => ({ ...p, notificationEmail: !p.notificationEmail }))}>
                <div style={{
                  width:14, height:14, borderRadius:"50%", background:"#fff",
                  position:"absolute", top:3,
                  left: draft.notificationEmail ? 18 : 3,
                  transition:"left 0.2s"
                }} />
              </div>
            </label>

            {/* WhatsApp section */}
            <div style={waBoxStyle}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:16 }}>📱</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#e6edf3" }}>WhatsApp Notifications</div>
                    <div style={{ fontSize:11, color:"#768390" }}>Receive task alerts on WhatsApp</div>
                  </div>
                </div>
                {user.phoneVerified
                  ? stepBadge("✅ Verified", "#22c55e")
                  : stepBadge("Not Verified", "#f59e0b")
                }
              </div>

              {/* Phone number input */}
              <div>
                <label style={{ fontSize:11, color:"#768390", display:"block", marginBottom:4 }}>WhatsApp Phone (with country code)</label>
                <input
                  style={{ ...S.formInput, fontSize:13 }}
                  placeholder="+919876543210"
                  value={draft.phone}
                  onChange={e => setDraft(p => ({ ...p, phone: e.target.value }))}
                />
              </div>

              {/* CallMeBot setup instructions */}
              {waStep === "idle" && !user.phoneVerified && (
                <div style={{ background:"#0d1117", border:"1px solid #238636", borderRadius:8, padding:12 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#3fb950", marginBottom:8 }}>📋 One-time CallMeBot Setup (Free)</div>
                  <ol style={{ margin:0, paddingLeft:16, display:"flex", flexDirection:"column", gap:4 }}>
                    <li style={{ fontSize:11, color:"#adbac7" }}>Open WhatsApp → message <strong style={{ color:"#7dc3db" }}>+34 644 78 81 73</strong></li>
                    <li style={{ fontSize:11, color:"#adbac7" }}>Send: <em style={{ color:"#f0f6fc" }}>"I allow callmebot to send me messages"</em></li>
                    <li style={{ fontSize:11, color:"#adbac7" }}>Wait for reply — it will contain your <strong style={{ color:"#7dc3db" }}>API key</strong></li>
                    <li style={{ fontSize:11, color:"#adbac7" }}>Paste the API key below and click Send OTP</li>
                  </ol>
                </div>
              )}

              {/* API key input + Send OTP */}
              {!user.phoneVerified && waStep !== "verified" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div>
                    <label style={{ fontSize:11, color:"#768390", display:"block", marginBottom:4 }}>Your CallMeBot API Key</label>
                    <input
                      style={{ ...S.formInput, fontSize:13 }}
                      placeholder="e.g. 1234567"
                      value={waApiKey}
                      onChange={e => setWaApiKey(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={sendOtp}
                    disabled={waSending || !draft.phone || !waApiKey}
                    style={{
                      background: waSending ? "#22272e" : "linear-gradient(135deg, #25d366, #128c7e)",
                      color:"#fff", border:"none", borderRadius:8, padding:"9px 16px",
                      fontSize:13, fontWeight:700, cursor: waSending ? "not-allowed" : "pointer",
                      opacity: !draft.phone || !waApiKey ? 0.5 : 1
                    }}
                  >
                    {waSending && waStep === "idle" ? "⏳ Sending..." : "📲 Send Verification Code"}
                  </button>
                </div>
              )}

              {/* OTP entry */}
              {waStep === "sent" && (
                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  {stepBadge("Code sent! Check WhatsApp", "#3b82f6")}
                  <div>
                    <label style={{ fontSize:11, color:"#768390", display:"block", marginBottom:4 }}>Enter 6-digit OTP</label>
                    <input
                      style={{ ...S.formInput, fontSize:18, fontWeight:700, letterSpacing:8, textAlign:"center" }}
                      placeholder="● ● ● ● ● ●"
                      maxLength={6}
                      value={waOtp}
                      onChange={e => setWaOtp(e.target.value.replace(/\D/g, ""))}
                    />
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <button
                      onClick={verifyOtp}
                      disabled={waSending || waOtp.length !== 6}
                      style={{
                        flex:1, background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                        color:"#fff", border:"none", borderRadius:8, padding:"9px 0",
                        fontSize:13, fontWeight:700, cursor: waSending ? "not-allowed" : "pointer",
                        opacity: waOtp.length !== 6 ? 0.5 : 1
                      }}
                    >
                      {waSending ? "⏳ Verifying..." : "✅ Verify Code"}
                    </button>
                    <button onClick={sendOtp} disabled={waSending}
                      style={{ background:"#22272e", color:"#768390", border:"1px solid #30363d", borderRadius:8, padding:"9px 12px", fontSize:12, cursor:"pointer" }}
                    >
                      Resend
                    </button>
                  </div>
                </div>
              )}

              {/* Verified success */}
              {(waStep === "verified" || user.phoneVerified) && (
                <div style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.3)", borderRadius:8, padding:"10px 12px" }}>
                  <span style={{ fontSize:18 }}>✅</span>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:"#4ade80" }}>WhatsApp Verified!</div>
                    <div style={{ fontSize:11, color:"#768390" }}>{draft.phone || user.phone} — Notifications enabled</div>
                  </div>
                </div>
              )}

              {/* Error */}
              {waError && (
                <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:8, padding:"8px 12px", fontSize:12, color:"#f87171" }}>
                  ⚠️ {waError}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={S.modalFoot}>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
          <button style={S.createBtn} onClick={() => onSave(draft)}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function AddUserModal({ onClose, onAdd }) {
  const [f, setF] = useState({
    name: "",
    email: "",
    password: "",
    role: "developer",
    department: "it",
    departments: ["it"],
    permissions: ROLES["developer"]?.permissions || []
  });
  const [copied, setCopied] = useState(false);
  const set = (k,v) => setF(p => ({...p,[k]:v}));

  const toggleDept = (dk) => {
    setF(prev => {
      const current = prev.departments || [];
      const next = current.includes(dk)
        ? (current.length > 1 ? current.filter(x => x !== dk) : current)
        : [...current, dk];
      return { ...prev, departments: next, department: next[0] };
    });
  };

  const handleRoleChange = (newRole) => {
    setF(p => ({
      ...p,
      role: newRole,
      permissions: ROLES[newRole]?.permissions || []
    }));
  };

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    set("password", pass);
    navigator.clipboard.writeText(pass);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEmailValid = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "None", color: "#666" };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*()_+]/.test(pass)) score++;
    
    if (score <= 1) return { score, text: "Weak", color: "#ef4444" };
    if (score <= 3) return { score, text: "Medium", color: "#f59e0b" };
    return { score, text: "Strong", color: "#10b981" };
  };

  const strength = getPasswordStrength(f.password);

  const PERMISSION_METADATA = {
    create:       { label: "Create Issues", desc: "Allow starting new tasks & epics", icon: "➕" },
    edit:         { label: "Edit Issues", desc: "Allow modifying fields & details", icon: "✏️" },
    delete:       { label: "Delete Issues", desc: "Allow permanently removing issues", icon: "🗑️" },
    assign:       { label: "Assign Team", desc: "Allow delegating tasks to members", icon: "👥" },
    manage_users: { label: "Manage Users", desc: "Allow adding & modifying members", icon: "🛡️" },
    view_all:     { label: "View All Depts", desc: "Access boards of all departments", icon: "👁️" },
    manage_roles: { label: "Manage Roles", desc: "Define category security structures", icon: "🔑" },
    approve:      { label: "Approve Items", desc: "Transition tasks to Done status", icon: "✅" },
  };

  return (
    <div style={{ ...S.modalOverlay, backdropFilter: "blur(12px)", background: "rgba(0,0,0,0.85)" }} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ 
        ...S.modal, 
        width: 500, 
        background: "linear-gradient(135deg, rgba(28,33,40,0.98), rgba(34,39,46,0.98))",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        borderRadius: 16,
        boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8)",
        animation: "modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        <div style={{ ...S.modalHdr, borderBottom: "1px solid rgba(255, 255, 255, 0.06)", padding: "16px 24px" }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#fff", letterSpacing: "-0.01em" }}>Add New User</span>
          <button style={S.iconBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ ...S.modalBody, gap: 14, padding: "20px 24px" }}>
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:5 }}>Full Name</label>
            <input type="text" style={S.formInput} placeholder="e.g. Jane Smith" value={f.name} onChange={e => set("name", e.target.value)} />
          </div>
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:5 }}>Email</label>
            <input type="email" style={S.formInput} placeholder="jane@metapharsic.io" value={f.email} onChange={e => set("email", e.target.value)} />
            {f.email && (
              <div style={{ fontSize: 11, color: isEmailValid(f.email) ? "#10b981" : "#ef4444", marginTop: 4, display:"flex", alignItems:"center", gap: 4 }}>
                <span>{isEmailValid(f.email) ? "✓" : "⚠️"}</span>
                <span>{isEmailValid(f.email) ? "Valid email format" : "Enter a valid email format"}</span>
              </div>
            )}
          </div>
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:5 }}>WhatsApp Phone <span style={{ fontWeight:400, color:"#768390" }}>(optional, for notifications)</span></label>
            <input type="tel" style={S.formInput} placeholder="+919876543210" value={f.phone||""} onChange={e => set("phone", e.target.value)} />
            <div style={{ fontSize:11, color:"#768390", marginTop:4 }}>📱 User can verify their WhatsApp from their profile after login.</div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:5 }}>Password</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                style={{ ...S.formInput, flex: 1 }}
                placeholder="••••••••"
                value={f.password}
                onChange={e => set("password", e.target.value)}
              />
              <button
                type="button"
                onClick={generatePassword}
                style={{
                  background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                  whiteSpace: "nowrap"
                }}
              >
                ⚡ Auto
              </button>
            </div>
            {copied && (
              <div style={{ fontSize: 11, color: "#10b981", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                <span>✓</span> Copied password to clipboard!
              </div>
            )}
            {f.password && (
              <div style={{ marginTop: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 10, color: "#768390" }}>Strength: <strong style={{ color: strength.color }}>{strength.text}</strong></span>
                </div>
                <div style={{ width: "100%", height: 4, background: "#22272e", borderRadius: 2, marginTop: 3, overflow: "hidden" }}>
                  <div style={{ width: `${(strength.score / 4) * 100}%`, height: "100%", background: strength.color, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
          </div>
          {/* Department(s) */}
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:8 }}>Domain Responsibilities (Multiple)</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, background:"#22272e", padding:12, borderRadius:8, border:"1px solid rgba(255,255,255,0.06)" }}>
              {Object.entries(DEPARTMENTS).map(([dk, dv]) => {
                const isSelected = (f.departments || []).includes(dk);
                return (
                  <div key={dk} onClick={() => toggleDept(dk)}
                    style={{
                      display:"flex", alignItems:"center", gap:8, padding:"6px 10px", borderRadius:6, cursor:"pointer",
                      background: isSelected ? dv.color+"20" : "transparent",
                      border: `1px solid ${isSelected ? dv.color+"50" : "transparent"}`,
                      transition: "all 0.2s"
                    }}>
                    <span style={{ fontSize:14 }}>{dv.icon}</span>
                    <span style={{ fontSize:12, color: isSelected ? dv.color : "#adbac7", fontWeight: isSelected ? 700 : 400 }}>{dv.label}</span>
                    {isSelected && <span style={{ marginLeft:"auto", color:dv.color, fontSize:10 }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, color:"#909dab", fontWeight:600, display:"block", marginBottom:5 }}>Role</label>
            <select style={S.formSel} value={f.role} onChange={e => handleRoleChange(e.target.value)}>
              {Object.entries(ROLES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", userSelect:"none", margin: "4px 0" }}>
            <input
              type="checkbox"
              checked={f.requirePasswordChange === undefined ? true : f.requirePasswordChange}
              onChange={e => set("requirePasswordChange", e.target.checked)}
              style={{ cursor:"pointer" }}
            />
            <span style={{ fontSize:13, color:"#adbac7" }}>Force password change on next login</span>
          </label>

          <div>
            <div style={{ fontSize:12, color:"#909dab", fontWeight:600, marginBottom:8 }}>Configure Custom Permissions</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, maxHeight:180, overflowY:"auto", paddingRight:4 }}>
              {ALL_PERMISSIONS.map(p => {
                const has = f.permissions.includes(p);
                const meta = PERMISSION_METADATA[p] || { label: p, desc: "", icon: "⚙️" };
                return (
                  <div
                    key={p}
                    onClick={() => {
                      const next = has
                        ? f.permissions.filter(x => x !== p)
                        : [...f.permissions, p];
                      setF(prev => ({ ...prev, permissions: next }));
                    }}
                    style={{
                      background: has ? "rgba(99, 102, 241, 0.1)" : "#22272e",
                      border: has ? "1px solid rgba(99, 102, 241, 0.5)" : "1px solid rgba(255, 255, 255, 0.06)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      transition: "all 0.2s",
                      boxShadow: has ? "0 0 10px rgba(99, 102, 241, 0.15)" : "none"
                    }}
                  >
                    <span style={{ fontSize: 15 }}>{meta.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: has ? "#8c8dfa" : "#adbac7" }}>{meta.label}</div>
                      <div style={{ fontSize: 9, color: "#768390", marginTop: 1 }}>{meta.desc}</div>
                    </div>
                    <div
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: "50%",
                        border: has ? "3.5px solid #6366f1" : "1.5px solid #768390",
                        background: has ? "#fff" : "transparent",
                        transition: "all 0.2s"
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div style={{ ...S.modalFoot, borderTop: "1px solid rgba(255, 255, 255, 0.06)", padding: "12px 24px" }}>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
          <button 
            style={{
              ...S.btnPrimary,
              background: (!f.name.trim() || !f.email.trim() || !isEmailValid(f.email)) ? "#2d333b" : "linear-gradient(135deg, #10b981, #059669)",
              color: (!f.name.trim() || !f.email.trim() || !isEmailValid(f.email)) ? "#768390" : "#fff",
              cursor: (!f.name.trim() || !f.email.trim() || !isEmailValid(f.email)) ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              boxShadow: (!f.name.trim() || !f.email.trim() || !isEmailValid(f.email)) ? "none" : "0 4px 12px rgba(16, 185, 129, 0.2)"
            }} 
            disabled={!f.name.trim() || !f.email.trim() || !isEmailValid(f.email)}
            onClick={() => { if(f.name.trim() && f.email.trim() && isEmailValid(f.email)) onAdd(f); }}>
            Add User
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOARD VIEW ───────────────────────────────────────────────────────────────
function BoardView({ issues, sprints, sprint, setSprint, search, setSearch, filters, setFilters,
                     onDragStart, onDrop, dragOver, setDragOver, onSelect, onCreate, allIssues, canCreate, users, isMobile, t, searchInputRef }) {
  const total = issues.length;
  const done  = issues.filter(i => i.status === "Done").length;
  const pts   = issues.reduce((s,i) => s+(i.sp||0), 0);

  const [showLog, setShowLog] = useState(false);
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [historyEvents, setHistoryEvents] = useState([]);
  const [logUserFilter, setLogUserFilter] = useState("all");

  useEffect(() => {
    if (showLog) {
      fetch(`/api/history?date=${logDate}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setHistoryEvents(data);
          }
        })
        .catch(err => console.error("Could not fetch daily history", err));
    }
  }, [logDate, showLog]);

  const filteredEvents = useMemo(() => {
    if (logUserFilter === "all") return historyEvents;
    return historyEvents.filter(e => String(e.userId) === String(logUserFilter));
  }, [historyEvents, logUserFilter]);

  const getHistoryText = (h) => {
    switch (h.eventType) {
      case 'created':
        return `created the issue`;
      case 'commented':
        return `added comment: "${h.newValue}"`;
      case 'status_changed':
        return `moved status to "${h.newValue}"`;
      case 'assigned':
        return `assigned issue to "${h.newValue || 'Unassigned'}"`;
      case 'edited':
        return `edited issue details`;
      case 'labeled':
        return `updated labels to "${h.newValue}"`;
      case 'sprint_changed':
        return `moved sprint to "${h.newValue}"`;
      default:
        return `updated this issue`;
    }
  };

  const columnLayout = isMobile ? { display: "flex", flexDirection: "column", gap: 16 } : S.cols;

  return (
    <div>
      <div style={S.toolbar}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          <select style={S.sel} value={sprint} onChange={e => setSprint(e.target.value)}>
            {sprints.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <div style={{ position: "relative", display: "flex", alignItems: "center", width: isMobile ? "100%" : "auto", minWidth: isMobile ? "none" : 200 }}>
            <input 
              ref={searchInputRef}
              style={{ 
                ...S.searchBox, 
                paddingRight: search ? 30 : 10, 
                width: "100%",
                maxWidth: "100%",
                fontSize: isMobile ? 16 : 13
              }} 
              placeholder={`🔍  ${t("search")}`} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              title="Search by title, key, desc, status, type, assignee, reporter, epic, or labels. Tokens: type:, p:, key:, assignee:, epic:, label:, status:"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            )}
          </div>

          <Filters filters={filters} setFilters={setFilters} users={users} t={t} />
          
          <button style={{ 
            background: showLog ? "#338ba820" : "transparent",
            border: "1px solid",
            borderColor: showLog ? "#338ba8" : "#444c56",
            color: showLog ? "#7dc3db" : "#adbac7",
            borderRadius: 6,
            padding: "5px 12px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer"
          }} onClick={() => setShowLog(p => !p)}>
            📅 {showLog ? "Hide Activity Log" : "Daily Activity Log"}
          </button>
        </div>
        {canCreate && <button style={{ ...S.createBtn, width: isMobile ? "100%" : "auto" }} onClick={onCreate}>+ {t("create")}</button>}
      </div>
      
      <div style={S.sprintBar}>
        <span style={S.sprintName}>{sprint}</span>
        <span style={S.sprintMeta}>{total} issues · {done} done · {pts} story points</span>
        <div style={{ flex:1 }} />
        <div style={S.miniProgress}><div style={{ ...S.miniProgressFill, width: total ? `${(done/total)*100}%` : "0%" }} /></div>
        <span style={{ fontSize:11, color:"#909dab" }}>{total ? Math.round((done/total)*100) : 0}%</span>
      </div>

      <div style={{ display:"flex", gap:16, alignItems:"stretch", flexDirection: isMobile ? "column" : "row" }}>
        <div style={{ flex: 1 }}>
          <div style={columnLayout}>
            {STATUSES.map(status => {
              const col = issues.filter(i => i.status === status);
              const sc  = STATUS_COLORS[status];
              return (
                <div key={status} style={{ ...S.col, ...(dragOver===status?S.colOver:{}) }}
                  onDragOver={e => { e.preventDefault(); setDragOver(status); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => onDrop(e, status)}>
                  <div style={{ ...S.colHeader, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ ...S.dot, background: sc.dot }} />
                      <span style={{ ...S.colTitle, color: sc.text }}>{status}</span>
                      <span style={S.colCount}>{col.length}</span>
                    </div>
                    {canCreate && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); onCreate(status); }}
                        title={`Create task in ${status}`}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#7dc3db",
                          cursor: "pointer",
                          fontSize: 16,
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          lineHeight: 1,
                          transition: "all 0.2s"
                        }}
                        onMouseEnter={e => { e.target.style.background = "rgba(125,195,219,0.15)"; e.target.style.transform = "scale(1.1)"; }}
                        onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.transform = "none"; }}
                      >
                        +
                      </button>
                    )}
                  </div>
                  <div style={S.colBody}>
                    {col.map(issue => (
                      <IssueCard key={issue.key} issue={issue} onDragStart={onDragStart} onClick={() => onSelect(issue)} users={users} />
                    ))}
                    {col.length === 0 && <div style={S.emptyCol}>Drop here</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showLog && (
          <div style={{ 
            width: isMobile ? "100%" : 320, 
            background: "#1c2128", 
            border: "1px solid #444c56", 
            borderRadius: 10, 
            padding: 14, 
            display: "flex", 
            flexDirection: "column",
            gap: 12,
            maxHeight: isMobile ? "none" : "75vh",
            overflowY: "auto"
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid #444c56", paddingBottom:8 }}>
              <span style={{ fontWeight:700, color:"#e6edf3", display:"flex", alignItems:"center", gap:6 }}>
                <span>📅 Daily Log Tracker</span>
              </span>
              <button style={{ ...S.iconBtn, fontSize:12 }} onClick={() => setShowLog(false)}>✕</button>
            </div>

            {/* Date Select Calendar */}
            <div>
              <label style={{ fontSize:10, color:"#768390", fontWeight:700, textTransform:"uppercase", display:"block", marginBottom:4 }}>Select Date</label>
              <input type="date" style={{ ...S.formInput, width:"100%" }} value={logDate} onChange={e => setLogDate(e.target.value)} />
            </div>

            {/* User Dropdown Filter */}
            <div>
              <label style={{ fontSize:10, color:"#768390", fontWeight:700, textTransform:"uppercase", display:"block", marginBottom:4 }}>Filter by User</label>
              <select style={{ ...S.sel, width:"100%", fontSize:12 }} value={logUserFilter} onChange={e => setLogUserFilter(e.target.value)}>
                <option value="all">All Team Members</option>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>

            {/* Activity Stream */}
            <div style={{ display:"flex", flexDirection:"column", gap:8, flex:1, overflowY:"auto" }}>
              <label style={{ fontSize:10, color:"#768390", fontWeight:700, textTransform:"uppercase", display:"block", marginBottom:4 }}>Activity Timeline ({filteredEvents.length})</label>
              {filteredEvents.map(e => (
                <div key={e.id} 
                  style={{ 
                    background: "#22272e", 
                    border: "1px solid #444c56", 
                    borderRadius: 8, 
                    padding: 10, 
                    cursor: "pointer",
                    transition: "border-color 0.15s"
                  }}
                  onClick={() => {
                    const match = allIssues.find(i => i.key === e.issueKey);
                    if (match) onSelect(match);
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="#58a6ff"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="#444c56"}
                >
                  <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:6 }}>
                    <div style={{
                      width: 20, height: 20, borderRadius: "50%",
                      background: "#2d333b", color: "#7dc3db",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 8, fontWeight: 700, border:"1px solid #444c56"
                    }}>
                      {e.userAvatar || (e.userName ? e.userName.slice(0,2).toUpperCase() : "US")}
                    </div>
                    <span style={{ fontSize:11, color:"#adbac7", fontWeight:600 }}>{e.userName || "System"}</span>
                  </div>
                  
                  <div style={{ fontSize:12, color:"#e6edf3", lineHeight:1.4 }}>
                    {getHistoryText(e)}
                  </div>
                  
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8, borderTop:"1px solid #2d333b", paddingTop:6 }}>
                    <span style={{ fontSize:10, color:"#46b3cf", fontFamily:"monospace", fontWeight:600 }}>{e.issueKey}</span>
                    <span style={{ fontSize:9, color:"#768390" }}>{e.date.split(" ")[1] || ""}</span>
                  </div>
                </div>
              ))}
              {filteredEvents.length === 0 && (
                <div style={{ textAlign:"center", padding:"30px 10px", color:"#768390", fontStyle:"italic", fontSize:12 }}>
                  No activities recorded on this date.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ISSUE CARD ───────────────────────────────────────────────────────────────
function IssueCard({ issue, onDragStart, onClick, users }) {
  const ti = ISSUE_TYPES[issue.type];
  const pi = PRIORITIES[issue.priority];
  const ep = EPICS.find(e => e.id === issue.epic);
  const au = users.find(u => u.id === issue.assignee);
  return (
    <div style={S.card} draggable onDragStart={e => onDragStart(e, issue.key)} onClick={onClick}
      onMouseEnter={e => e.currentTarget.style.borderColor="#46b3cf"}
      onMouseLeave={e => e.currentTarget.style.borderColor="#444c56"}>
      {ep && <div style={{ ...S.epicTag, background: ep.color+"25", color: ep.color }}>⚡ {ep.name}</div>}
      <div style={S.labelRow}>{issue.labels.slice(0,2).map(l => <span key={l} style={S.labelChip}>{l}</span>)}</div>
      <div style={S.cardTitle}>{issue.title}</div>
      <div style={S.cardFoot}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <span style={{ color: ti.color, fontSize:11 }}>{ti.icon}</span>
          <span style={S.issueKey}>{issue.key}</span>
          <span style={{ color: pi.color, fontSize:11 }}>{pi.icon}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          {issue.comments.length > 0 && <span style={S.cardStat}>💬{issue.comments.length}</span>}
          {issue.attach > 0 && <span style={S.cardStat}>📎{issue.attach}</span>}
          {issue.sp > 0 && <span style={S.spBadge}>{issue.sp}</span>}
          <div title={DEPARTMENTS[issue.department]?.label} style={{ fontSize:12, cursor:"help", marginLeft:2 }}>
            {DEPARTMENTS[issue.department]?.icon}
          </div>
          {au ? <Avatar user={au} size={20} /> : <div style={S.unassigned} title="Unassigned">?</div>}
        </div>
      </div>
    </div>
  );
}

// ─── BACKLOG VIEW ─────────────────────────────────────────────────────────────
function BacklogView({ issues, search, setSearch, filters, setFilters, onSelect, onCreate, canCreate, users, isMobile, t, searchInputRef }) {
  return (
    <div>
      <div style={S.toolbar}>
        <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
          
          <div style={{ position: "relative", display: "flex", alignItems: "center", width: isMobile ? "100%" : "auto", minWidth: isMobile ? "none" : 200 }}>
            <input 
              ref={searchInputRef}
              style={{ 
                ...S.searchBox, 
                paddingRight: search ? 30 : 10, 
                width: "100%",
                maxWidth: "100%",
                fontSize: isMobile ? 16 : 13
              }} 
              placeholder={`🔍  ${t("search")}`} 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              title="Search by title, key, desc, status, type, assignee, reporter, epic, or labels. Tokens: type:, p:, key:, assignee:, epic:, label:, status:"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            )}
          </div>

          <Filters filters={filters} setFilters={setFilters} users={users} t={t} />
        </div>
        {canCreate && <button style={S.createBtn} onClick={onCreate}>+ {t("create")}</button>}
      </div>
      <div style={S.backlogBox}>
        <div style={S.backlogHdr}>
          <span style={S.backlogHdrTitle}>{t("backlog")}</span>
          <span style={S.backlogCount}>{issues.length} issues</span>
        </div>
        {issues.length === 0 && <div style={S.emptyBacklog}>No issues in the backlog.</div>}
        {issues.map(issue => {
          const ti = ISSUE_TYPES[issue.type];
          const pi = PRIORITIES[issue.priority];
          const au = users.find(u => u.id === issue.assignee);
          const ep = EPICS.find(e => e.id === issue.epic);
          return (
            <div key={issue.key} style={S.backlogRow} onClick={() => onSelect(issue)}>
              <span style={{ color: ti.color, fontSize:13, width:16 }}>{ti.icon}</span>
              <span style={S.backlogKey}>{issue.key}</span>
              <span style={S.backlogTitle}>{issue.title}</span>
              {ep && <span style={{ ...S.epicTag, background: ep.color+"25", color: ep.color, flexShrink:0 }}>⚡ {ep.name}</span>}
              <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto", flexShrink:0 }}>
                {issue.labels.slice(0,1).map(l => <span key={l} style={S.labelChip}>{l}</span>)}
                <span style={{ color: pi.color, fontSize:11 }}>{pi.icon}</span>
                {issue.sp > 0 && <span style={S.spBadge}>{issue.sp}</span>}
                {au ? <Avatar user={au} size={20} /> : <div style={S.unassigned}>?</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ROADMAP ──────────────────────────────────────────────────────────────────
function RoadmapView({ issues, onSelect, isMobile }) {
  const start = new Date("2026-05-01");
  const end   = new Date("2026-07-31");
  function pct(d,s,e) { return Math.min(100, Math.max(0, ((d-s)/(e-s))*100)); }
  const todayPct = pct(new Date("2026-05-19"), start, end);
  const months = ["May 2026","Jun 2026","Jul 2026"];
  const labelWidth = isMobile ? 120 : 220;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <h2 style={S.pageH2}>Roadmap</h2>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {EPICS.map(ep => (
            <span key={ep.id} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:"#adbac7" }}>
              <span style={{ width:8, height:8, borderRadius:2, background: ep.color, display:"inline-block" }} />
              {ep.name}
            </span>
          ))}
        </div>
      </div>
      <div style={{ display:"flex", marginBottom:6 }}>
        <div style={{ width:labelWidth, flexShrink:0 }} />
        <div style={{ flex:1, display:"flex" }}>
          {months.map(m => <div key={m} style={{ flex:1, fontSize:11, color:"#768390", textAlign:"center" }}>{isMobile ? m.split(" ")[0] : m}</div>)}
        </div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
        {issues.filter(i => i.dueDate).map(issue => {
          const ep = EPICS.find(e => e.id === issue.epic);
          const ti = ISSUE_TYPES[issue.type];
          const due = new Date(issue.dueDate);
          const dp = pct(due, start, end);
          const barW = Math.max(3, dp - Math.max(0, dp-8));
          const barL = Math.max(0, dp-8);
          return (
            <div key={issue.key} style={S.roadRow} onClick={() => onSelect(issue)}>
              <div style={{ ...S.roadLabel, maxWidth: labelWidth }}>
                <span style={{ color: ti.color, fontSize:11, flexShrink:0 }}>{ti.icon}</span>
                {!isMobile && <span style={{ color:"#46b3cf", fontSize:11, fontFamily:"monospace", flexShrink:0 }}>{issue.key}</span>}
                <span style={{ color:"#adbac7", fontSize:11, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{issue.title}</span>
              </div>
              <div style={{ flex:1, position:"relative", height:24, background:"#2d333b", borderRadius:4, overflow:"hidden" }}>
                <div style={{ position:"absolute", left:`${todayPct}%`, top:0, bottom:0, width:1, background:"#ef4444", zIndex:2 }} />
                <div style={{ position:"absolute", left:`${barL}%`, width:`${barW}%`, top:3, bottom:3, background: ep?.color||"#6366f1", borderRadius:3, display:"flex", alignItems:"center", paddingLeft:5, fontSize:9, color:"#fff", overflow:"hidden", whiteSpace:"nowrap" }}>
                  {!isMobile && issue.dueDate}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop:12, fontSize:11, color:"#768390" }}>
        <span style={{ display:"inline-block", width:8, height:8, background:"#ef4444", marginRight:4 }} />Today (May 19, 2026)
      </div>
    </div>
  );
}

// ─── PEOPLE VIEW ──────────────────────────────────────────────────────────────
// ─── USER HISTORY MODAL ──────────────────────────────────────────────────────
function UserHistoryModal({ user, issues, onClose }) {
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2026-12-31");

  const userTasks = useMemo(() => issues.filter(i => i.assignee === user.id), [issues, user.id]);

  const filteredTasks = useMemo(() => {
    return userTasks.filter(i => {
      if (!i.created) return true;
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      const created = new Date(i.created);
      
      if (start) {
        start.setHours(0, 0, 0, 0);
        if (created < start) return false;
      }
      if (end) {
        end.setHours(23, 59, 59, 999);
        if (created > end) return false;
      }
      return true;
    });
  }, [userTasks, startDate, endDate]);

  const doneCount = filteredTasks.filter(t => t.status === "Done").length;
  const activeCount = filteredTasks.filter(t => t.status === "In Progress" || t.status === "In Review").length;
  const storyPoints = filteredTasks.reduce((acc, t) => acc + (t.sp || 0), 0);

  const dept = DEPARTMENTS[user.department];

  return (
    <div style={S.modalOverlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ ...S.modal, width: 500 }}>
        <div style={S.modalHdr}>
          <span style={{ fontWeight:700, color:"#e6edf3", display:"flex", alignItems:"center", gap:8 }}>
            <span>📊 Work History & Timeline</span>
          </span>
          <button style={S.iconBtn} onClick={onClose}>✕</button>
        </div>
        <div style={{ ...S.modalBody, gap:14 }}>
          {/* User Profile Summary */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#22272e", padding:12, borderRadius:10, border:"1px solid #444c56" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <Avatar user={user} size={48} />
              <div>
                <div style={{ fontWeight:700, color:"#e6edf3", fontSize:15 }}>{user.name}</div>
                <div style={{ fontSize:12, color:"#909dab" }}>{ROLES[user.role]?.label}</div>
              </div>
            </div>
            <span style={{ ...S.rolePill, background: (dept?.color||"#6366f1")+"20", color: dept?.color||"#6366f1", fontSize:12, padding:"4px 10px" }}>
              {dept?.icon} {dept?.label}
            </span>
          </div>

          {/* Date Range Picker */}
          <div>
            <div style={{ fontSize:11, color:"#909dab", fontWeight:700, textTransform:"uppercase", marginBottom:6, letterSpacing:"0.04em" }}>Select Calendar range</div>
            <div style={{ display:"flex", gap:10, background:"#22272e", padding:12, borderRadius:8, border:"1px solid #444c56" }}>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:10, color:"#768390", fontWeight:600, display:"block", marginBottom:4 }}>Start Date</label>
                <input type="date" style={S.formInput} value={startDate} onChange={e => setStartDate(e.target.value)} />
              </div>
              <div style={{ flex:1 }}>
                <label style={{ fontSize:10, color:"#768390", fontWeight:600, display:"block", marginBottom:4 }}>End Date</label>
                <input type="date" style={S.formInput} value={endDate} onChange={e => setEndDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Range KPI Statistics */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:8 }}>
            <div style={{ background:"#1c2128", border:"1px solid #444c56", padding:10, borderRadius:8, textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color:"#e6edf3" }}>{filteredTasks.length}</div>
              <div style={{ fontSize:9, color:"#768390", textTransform:"uppercase", fontWeight:700, marginTop:2 }}>Tasks</div>
            </div>
            <div style={{ background:"#1c2128", border:"1px solid #444c56", padding:10, borderRadius:8, textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color:"#10b981" }}>{doneCount}</div>
              <div style={{ fontSize:9, color:"#768390", textTransform:"uppercase", fontWeight:700, marginTop:2 }}>Completed</div>
            </div>
            <div style={{ background:"#1c2128", border:"1px solid #444c56", padding:10, borderRadius:8, textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color:"#f59e0b" }}>{activeCount}</div>
              <div style={{ fontSize:9, color:"#768390", textTransform:"uppercase", fontWeight:700, marginTop:2 }}>Active</div>
            </div>
            <div style={{ background:"#1c2128", border:"1px solid #444c56", padding:10, borderRadius:8, textAlign:"center" }}>
              <div style={{ fontSize:18, fontWeight:700, color:"#46b3cf" }}>{storyPoints}</div>
              <div style={{ fontSize:9, color:"#768390", textTransform:"uppercase", fontWeight:700, marginTop:2 }}>Points</div>
            </div>
          </div>

          {/* Activity Timeline list */}
          <div>
            <div style={{ fontSize:11, color:"#909dab", fontWeight:700, textTransform:"uppercase", marginBottom:6, letterSpacing:"0.04em" }}>Activity Timeline</div>
            <div style={{ maxHeight: 220, overflowY: "auto", display:"flex", flexDirection:"column", gap:8, paddingRight:4 }}>
              {filteredTasks.map(t => {
                const typeInfo = ISSUE_TYPES[t.type] || { icon:"❓", color:"#768390" };
                const sc = STATUS_COLORS[t.status] || { bg:"#444c56", text:"#adbac7" };
                return (
                  <div key={t.key} style={{ background:"#22272e", border:"1px solid #444c56", padding:10, borderRadius:8, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <span style={{ fontSize:12, color: typeInfo.color }}>{typeInfo.icon}</span>
                        <span style={{ fontFamily:"monospace", fontSize:11, color:"#46b3cf", fontWeight:600 }}>{t.key}</span>
                        <span style={{ fontSize:9, fontWeight:700, background: sc.bg, color: sc.text, borderRadius:4, padding:"1px 6px" }}>{t.status}</span>
                      </div>
                      <div style={{ fontSize:13, fontWeight:600, color:"#e6edf3", marginTop:4 }}>{t.title}</div>
                      <div style={{ fontSize:11, color:"#768390", marginTop:2 }}>Created: {t.created} · Due: {t.dueDate || "None"}</div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <span style={{ background:"#2d333b", border:"1px solid #444c56", color:"#adbac7", borderRadius:4, padding:"2px 6px", fontSize:10, fontWeight:700 }}>{t.sp} SP</span>
                    </div>
                  </div>
                );
              })}
              {filteredTasks.length === 0 && (
                <div style={{ textAlign:"center", padding:"30px 10px", color:"#768390", fontStyle:"italic", fontSize:13 }}>
                  No tasks or activity recorded in the selected calendar range.
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={S.modalFoot}>
          <button style={S.createBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function PeopleView({ users, issues, isAdmin, isMobile, t }) {
  const [filterDept, setFilterDept] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  
  const filtered = users.filter(u => {
    const matchesDept = filterDept === "all" || u.department === filterDept;
    const s = search.toLowerCase().trim();
    const matchesSearch = !s || 
      u.name.toLowerCase().includes(s) || 
      u.email.toLowerCase().includes(s) || 
      u.department.toLowerCase().includes(s) ||
      ROLES[u.role]?.label.toLowerCase().includes(s);
    return matchesDept && matchesSearch;
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
        <h2 style={S.pageH2}>People</h2>
        <div style={{ display:"flex", gap:8, alignItems:"center", width: isMobile ? "100%" : "auto", flexWrap:"wrap" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center", width: isMobile ? "100%" : 200 }}>
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`🔍  Search team...`}
              style={{ 
                ...S.searchBox, 
                width:"100%", 
                paddingRight: search ? 30 : 10,
                fontSize: isMobile ? 16 : 13
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            )}
          </div>
          <select style={{ ...S.sel, flex: isMobile ? 1 : "initial" }} value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="all">All Departments</option>
            {Object.entries(DEPARTMENTS).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
          </select>
        </div>
      </div>
      {!isAdmin && <div style={{ color:"#f87171", fontSize:13, marginBottom:16 }}>⚠ Admin access required to manage team members.</div>}
      <div style={S.peopleGrid}>
        {filtered.map(u => {
          const ui   = issues.filter(i => i.assignee === u.id);
          const done = ui.filter(i => i.status === "Done").length;
          const prog = ui.filter(i => i.status === "In Progress").length;
          const rev  = ui.filter(i => i.status === "In Review").length;
          const todo = ui.filter(i => i.status === "To Do").length;
          const pts  = ui.reduce((s,i) => s+(i.sp||0), 0);
          const dept = DEPARTMENTS[u.department];
          return (
            <div key={u.id} 
              style={{ ...S.personCard, opacity: u.active ? 1 : 0.5, cursor: "pointer", transition: "transform 0.15s ease, border-color 0.15s ease" }}
              onClick={() => setSelectedUser(u)}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#58a6ff"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#444c56"}
            >
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <Avatar user={u} size={44} />
                <span style={{ ...S.rolePill, background: (dept?.color||"#6366f1")+"20", color: dept?.color||"#6366f1" }}>
                  {dept?.icon} {dept?.label}
                </span>
              </div>
              <div style={{ marginTop:10 }}>
                <div style={{ fontWeight:600, color:"#e6edf3", fontSize:15 }}>{u.name}</div>
                <div style={{ fontSize:11, color:"#909dab", marginBottom:4 }}>{ROLES[u.role]?.label}</div>
                {!u.active && <div style={{ fontSize:10, color:"#ef4444", marginBottom:6 }}>⛔ Inactive</div>}
              </div>
              {[
                { label:"To Do",       val:todo, color:"#46b3cf" },
                { label:"In Progress", val:prog, color:"#f59e0b" },
                { label:"In Review",   val:rev,  color:"#8b5cf6" },
                { label:"Done",        val:done, color:"#22c55e" },
              ].map(s => (
                <div key={s.label} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4 }}>
                  <span style={{ color:"#adbac7" }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight:600 }}>{s.val}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, borderTop:"1px solid #444c56", paddingTop:8, marginTop:4 }}>
                <span style={{ color:"#909dab" }}>Story points</span>
                <span style={{ color:"#cdd9e5", fontWeight:600 }}>{pts}</span>
              </div>
              {ui.length > 0 && <div style={{ ...S.progressBar, marginTop:10 }}><div style={{ ...S.progressFill, width:`${(done/ui.length)*100}%` }} /></div>}
            </div>
          );
        })}
      </div>

      {selectedUser && (
        <UserHistoryModal user={selectedUser} issues={issues} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

// ─── DETAIL PANEL ─────────────────────────────────────────────────────────────
function DetailPanel({ issue, onClose, onUpdate, onDelete, onComment, currentUser, isAdmin, hasPermission, users }) {
  const [tab, setTab]         = useState("details");
  const [commentTxt, setCTxt] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft]     = useState({ ...issue });
  const [historyList, setHistoryList] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep draft in sync when issue changes or edit mode toggles
  useEffect(() => {
    setDraft({ ...issue });
  }, [issue, isEditing]);

  // Update clock for tickers every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchHistory = useCallback(() => {
    fetch(`/api/issues/${issue.key}/history`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setHistoryList(data);
        }
      })
      .catch(err => {
        console.error("Could not fetch history from DB", err);
        const fallback = [
          { eventType: "created", userName: users.find(u=>u.id===issue.reporter)?.name||"Unknown", date: issue.created, userAvatar: users.find(u=>u.id===issue.reporter)?.avatar },
          ...issue.comments.map(c => ({ eventType: "commented", userName: users.find(u=>u.id===c.userId)?.name||"Unknown", date: c.date, userAvatar: users.find(u=>u.id===c.userId)?.avatar, newValue: c.text }))
        ];
        setHistoryList(fallback);
      });
  }, [issue.key, issue.created, issue.reporter, issue.comments, users]);

  useEffect(() => {
    if (tab === "history" || !isEditing) {
      fetchHistory();
    }
  }, [tab, isEditing, fetchHistory]);

  const getDurationString = (startDateStr) => {
    if (!startDateStr) return "0s";
    // Parse timestamp safely (handle both space and T delimiters)
    const normalized = startDateStr.replace(' ', 'T');
    const start = new Date(normalized);
    const diffMs = currentTime - start;
    if (isNaN(diffMs) || diffMs < 0) return "0s";
    
    const seconds = Math.floor((diffMs / 1000) % 60);
    const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
    const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);
    return parts.join(' ');
  };

  const getTimeInStatusString = () => {
    // Find the latest status change event
    const statusEvent = [...historyList].reverse().find(h => h.eventType === 'status_changed');
    const startTimeStr = statusEvent ? statusEvent.date : issue.created;
    return getDurationString(startTimeStr);
  };

  const generateReportText = () => {
    const assignedUser = users.find(u => u.id === issue.assignee)?.name || "Unassigned";
    const reporterUser = users.find(u => u.id === issue.reporter)?.name || "Unknown";
    const epicName = EPICS.find(e => e.id === issue.epic)?.name || "None";
    
    let report = `==================================================
METAPHARSIC ERP - TASK SUMMARY REPORT
==================================================
Issue Key:     ${issue.key}
Title:         ${issue.title}
Status:        ${issue.status}
Priority:      ${issue.priority.toUpperCase()}
Type:          ${issue.type.toUpperCase()}
--------------------------------------------------
Assignee:      ${assignedUser}
Reporter:      ${reporterUser}
Department:    ${DEPARTMENTS[issue.department]?.label || issue.department}
Story Points:  ${issue.sp}
Sprint:        ${issue.sprint}
Epic:          ${epicName}
Due Date:      ${issue.dueDate || 'None'}
Recurrence:    ${issue.recurrence}
Notifications: ${issue.notification ? 'Enabled' : 'Disabled'}
--------------------------------------------------
TIMING & AUDITING (Precision Seconds)
Created At:    ${issue.created}
Last Updated:  ${issue.updated || issue.created}
Total Age:     ${getDurationString(issue.created)}
Time in Status:${issue.status} for ${getTimeInStatusString()}
--------------------------------------------------
DESCRIPTION
${issue.desc || 'No description provided.'}
--------------------------------------------------
COMMENTS (${issue.comments.length})
`;
    issue.comments.forEach((c) => {
      const author = users.find(u => u.id === c.userId)?.name || "Unknown";
      report += `[${c.date}] ${author}: ${c.text}\n`;
    });
    
    report += `--------------------------------------------------
ACTIVITY HISTORY LOG (${historyList.length})
`;
    historyList.forEach((h) => {
      report += `[${h.date}] ${h.userName || 'System'}: ${getHistoryText(h)}\n`;
    });
    
    report += `==================================================\n`;
    return report;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    alert("📋 Detailed task report copied to clipboard!");
  };

  const handleDownloadReport = () => {
    const element = document.createElement("a");
    const file = new Blob([generateReportText()], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `report-${issue.key}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveChanges = () => {
    onUpdate(draft);
    setIsEditing(false);
  };

  const getHistoryText = (h) => {
    switch (h.eventType) {
      case 'created':
        return `created the issue`;
      case 'commented':
        return `added a comment: "${h.newValue}"`;
      case 'status_changed':
        return `changed status from "${h.oldValue || 'None'}" to "${h.newValue}"`;
      case 'assigned':
        return `assigned this issue to "${h.newValue || 'Unassigned'}" (was "${h.oldValue || 'Unassigned'}")`;
      case 'edited':
        return `edited issue details (Title/Description)`;
      case 'labeled':
        return `updated labels from "${h.oldValue || 'None'}" to "${h.newValue}"`;
      case 'sprint_changed':
        return `moved sprint from "${h.oldValue || 'Backlog'}" to "${h.newValue}"`;
      case 'priority_changed':
        return `changed priority from "${h.oldValue}" to "${h.newValue}"`;
      case 'type_changed':
        return `changed type from "${h.oldValue}" to "${h.newValue}"`;
      case 'sp_changed':
        return `changed story points from "${h.oldValue || '0'}" to "${h.newValue}"`;
      case 'epic_changed':
        return `changed epic from "${h.oldValue}" to "${h.newValue}"`;
      case 'duedate_changed':
        return `changed due date from "${h.oldValue}" to "${h.newValue}"`;
      case 'recurrence_changed':
        return `changed recurrence from "${h.oldValue}" to "${h.newValue}"`;
      default:
        return `updated this issue`;
    }
  };

  const toggleDraftLabel = (lbl) => {
    setDraft(p => ({
      ...p,
      labels: p.labels.includes(lbl) ? p.labels.filter(l => l !== lbl) : [...p.labels, lbl]
    }));
  };

  const ti = ISSUE_TYPES[issue.type];
  const pi = PRIORITIES[issue.priority];
  const sc = STATUS_COLORS[issue.status];
  const au = users.find(u => u.id === issue.assignee);
  const ru = users.find(u => u.id === issue.reporter);
  const ep = EPICS.find(e => e.id === issue.epic);

  const canEdit = hasPermission("edit");

  return (
    <div style={S.panelOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.panel, display: "flex", flexDirection: "column", background: "var(--card-bg)" }}>
        <div style={S.panelHdr}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color: ti.color, fontSize:14 }}>{ti.icon}</span>
            <span style={S.panelKey}>{issue.key}</span>
            <span style={{ ...S.statusPill, background: sc.bg, color: sc.text }}>{issue.status}</span>
          </div>
          <div style={{ display:"flex", alignItems: "center", gap:10 }}>
            {canEdit && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                style={{ 
                  background: "#338ba8", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 6, 
                  padding: "4px 10px", 
                  fontSize: 12, 
                  fontWeight: 700, 
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4
                }}
              >
                ✏️ Edit Task
              </button>
            )}
            {isAdmin && <button style={S.iconBtn} onClick={onDelete} title="Delete">🗑</button>}
            <button style={S.iconBtn} onClick={onClose}>✕</button>
          </div>
        </div>

        {/* ── PROCESS FLOW (STEPPER) ── */}
        <div style={S.processFlow}>
          {STATUSES.map((st, i) => {
            const isActive = issue.status === st;
            const isPast = STATUSES.indexOf(issue.status) >= i;
            const bg = isPast ? "#338ba8" : "#444c56";
            const color = isPast ? "#fff" : "#768390";
            return (
              <div key={st} style={{ display:"flex", alignItems:"center", flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, cursor:(canEdit && !isEditing)?"pointer":"default" }}
                  onClick={() => canEdit && !isEditing && onUpdate({ status: st })}
                >
                  <div style={{ ...S.processDot, background: bg, color }}>
                    {isPast ? "✓" : (i+1)}
                  </div>
                  <span style={{ fontSize:12, fontWeight:isActive?700:500, color:isActive?"#cdd9e5":"#768390", whiteSpace:"nowrap" }}>{st}</span>
                </div>
                {i < STATUSES.length - 1 && (
                  <div style={{ ...S.processLine, ...(STATUSES.indexOf(issue.status) > i ? S.processLineActive : {}) }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding:"16px 20px 12px" }}>
          {isEditing ? (
            <div style={{ display:"flex", flexDirection:"column", gap:6, width: "100%" }}>
              <label style={{ fontSize: 11, color: "#909dab", fontWeight: 600 }}>Title</label>
              <input 
                style={{ ...S.titleEdit, width: "100%", boxSizing: "border-box" }} 
                value={draft.title} 
                onChange={e => setDraft(p => ({ ...p, title: e.target.value }))} 
                autoFocus 
              />
            </div>
          ) : (
            <h2 style={{ ...S.panelTitle, cursor: "default" }}>{issue.title}</h2>
          )}
        </div>
        
        <div style={S.tabBar}>
          {["details","comments","history"].map(t => (
            <button key={t} style={{ ...S.tab, ...(tab===t?S.tabActive:{}) }} onClick={() => setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
              {t==="comments" && issue.comments.length > 0 && ` (${issue.comments.length})`}
            </button>
          ))}
        </div>

        <div style={{ ...S.panelBody, flex: 1, overflowY: "auto" }}>
          {tab === "details" && (
            <div style={S.detailGrid}>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Description */}
                <div style={S.fieldGroup}>
                  <div style={S.fieldLabel}>Description</div>
                  {isEditing ? (
                    <textarea 
                      style={{ ...S.descEdit, width: "100%", boxSizing: "border-box" }} 
                      value={draft.desc} 
                      onChange={e => setDraft(p => ({ ...p, desc: e.target.value }))} 
                      rows={5} 
                    />
                  ) : (
                    <div style={{ ...S.descText, cursor: "default" }}>
                      {issue.desc || <span style={{ color:"#768390", fontStyle: "italic" }}>No description provided.</span>}
                    </div>
                  )}
                </div>

                {/* Labels */}
                <div style={S.fieldGroup}>
                  <div style={S.fieldLabel}>Labels</div>
                  {isEditing ? (
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:4 }}>
                      {ALL_LABELS.map(l => {
                        const active = draft.labels?.includes(l);
                        return (
                          <button 
                            key={l} 
                            style={{ 
                              ...S.labelPickBtn, 
                              ...(active ? S.labelPickActive : {}),
                              padding: "4px 8px",
                              fontSize: 11
                            }}
                            onClick={() => toggleDraftLabel(l)}
                          >
                            {l}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={S.labelRow}>
                      {issue.labels.map(l => <span key={l} style={S.labelChip}>{l}</span>)}
                      {issue.labels.length === 0 && <span style={{ color:"#768390", fontSize:13 }}>None</span>}
                    </div>
                  )}
                </div>

                {/* Epic (Only in View Mode if Epic exists; Editable in Edit Mode) */}
                {isEditing ? (
                  <div style={S.fieldGroup}>
                    <div style={S.fieldLabel}>Epic</div>
                    <select 
                      style={S.fieldSel} 
                      value={draft.epic || ""} 
                      onChange={e => setDraft(p => ({ ...p, epic: e.target.value || null }))}
                    >
                      <option value="">None</option>
                      {EPICS.map(ep => <option key={ep.id} value={ep.id}>{ep.name}</option>)}
                    </select>
                  </div>
                ) : (
                  ep && (
                    <div style={S.fieldGroup}>
                      <div style={S.fieldLabel}>Epic</div>
                      <span style={{ ...S.epicTag, background: ep.color+"25", color: ep.color }}>⚡ {ep.name}</span>
                    </div>
                  )
                )}

                {/* Recurrence */}
                <div style={S.fieldGroup}>
                  <div style={S.fieldLabel}>Recurrence</div>
                  {isEditing ? (
                    <select 
                      style={S.fieldSel} 
                      value={draft.recurrence} 
                      onChange={e => setDraft(p => ({ ...p, recurrence: e.target.value }))}
                    >
                      {RECURRENCE_OPTIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
                    </select>
                  ) : (
                    <span style={{ fontSize:13, color:"#adbac7", textTransform: "capitalize" }}>🔄 {issue.recurrence}</span>
                  )}
                </div>

                {/* Notifications Toggle */}
                <div style={S.fieldGroup}>
                  <div style={S.fieldLabel}>Notifications</div>
                  {isEditing ? (
                    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                      <input 
                        type="checkbox" 
                        checked={draft.notification} 
                        onChange={e => setDraft(p => ({ ...p, notification: e.target.checked }))} 
                      />
                      <span style={{ fontSize:13, color:"#adbac7" }}>{draft.notification ? "🔔 Enabled" : "🔕 Disabled"}</span>
                    </label>
                  ) : (
                    <span style={{ fontSize:13, color:"#adbac7" }}>{issue.notification ? "🔔 Active" : "🔕 Suppressed"}</span>
                  )}
                </div>

                {/* --- TIME TRACKING & METADATA SECTION --- */}
                {!isEditing && (
                  <div style={{ background: "#22272e", border: "1px solid #444c56", borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#7dc3db", borderBottom: "1px solid #444c56", paddingBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                      ⏱️ Auditing & Timing Analysis
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 10, color: "#768390" }}>Task Age (Total Duration)</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#7dc3db", textShadow: "0 0 8px rgba(125,195,219,0.3)", marginTop: 2 }}>
                          🕒 {getDurationString(issue.created)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: "#768390" }}>Time in Status ({issue.status})</div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: "#fbbf24", textShadow: "0 0 8px rgba(251,191,36,0.3)", marginTop: 2 }}>
                          ⚡ {getTimeInStatusString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 2, borderTop: "1px solid #22272e", paddingTop: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "#768390" }}>Created At:</span>
                        <span style={{ color: "#adbac7", fontFamily: "monospace" }}>{issue.created}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "#768390" }}>Last Updated:</span>
                        <span style={{ color: "#adbac7", fontFamily: "monospace" }}>{issue.updated || issue.created}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar attributes */}
              <div style={S.detailRight}>
                {[
                  { 
                    label:"Status", 
                    el: isEditing ? (
                      <select style={S.fieldSel} value={draft.status} onChange={e => setDraft(p => ({ ...p, status: e.target.value }))}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span style={{ ...S.statusPill, background: sc.bg, color: sc.text, width: "fit-content", padding: "4px 10px" }}>{issue.status}</span>
                    )
                  },
                  { 
                    label:"Priority", 
                    el: isEditing ? (
                      <select style={S.fieldSel} value={draft.priority} onChange={e => setDraft(p => ({ ...p, priority: e.target.value }))}>
                        {Object.entries(PRIORITIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    ) : (
                      <span style={{ color: pi.color, fontSize: 13, fontWeight: 700 }}>{pi.icon} {pi.label}</span>
                    )
                  },
                  { 
                    label:"Type", 
                    el: isEditing ? (
                      <select style={S.fieldSel} value={draft.type} onChange={e => setDraft(p => ({ ...p, type: e.target.value }))}>
                        {Object.entries(ISSUE_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    ) : (
                      <span style={{ color: ti.color, fontSize: 13, fontWeight: 600 }}>{ti.icon} {ti.label}</span>
                    )
                  },
                  { 
                    label:"Assignee", 
                    el: isEditing ? (
                      <select style={S.fieldSel} value={draft.assignee || ""} onChange={e => setDraft(p => ({ ...p, assignee: e.target.value ? Number(e.target.value) : null }))}>
                        <option value="">Unassigned</option>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize:13, color:"#adbac7" }}>👤 {au?.name || "Unassigned"}</span>
                    )
                  },
                  { 
                    label:"Reporter", 
                    el: isEditing && isAdmin ? (
                      <select style={S.fieldSel} value={draft.reporter} onChange={e => setDraft(p => ({ ...p, reporter: Number(e.target.value) }))}>
                        {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize:13, color:"#adbac7" }}>📢 {ru?.name || "Unknown"}</span>
                    )
                  },
                  { 
                    label:"Department", 
                    el: isEditing && isAdmin ? (
                      <select style={S.fieldSel} value={draft.department || ""} onChange={e => setDraft(p => ({ ...p, department: e.target.value }))}>
                        {Object.entries(DEPARTMENTS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                    ) : (
                      <span style={{ fontSize:13, color:"#adbac7" }}>🏢 {DEPARTMENTS[issue.department]?.label || issue.department}</span>
                    )
                  },
                  { 
                    label:"Story Points", 
                    el: isEditing ? (
                      <input 
                        type="number" 
                        style={S.fieldInput} 
                        value={draft.sp} 
                        min={0}
                        onChange={e => setDraft(p => ({ ...p, sp: Number(e.target.value) || 0 }))} 
                      />
                    ) : (
                      <span style={{ fontSize:13, color:"#adbac7", fontWeight: 700 }}>{issue.sp} pts</span>
                    )
                  },
                  { 
                    label:"Sprint", 
                    el: isEditing ? (
                      <select style={S.fieldSel} value={draft.sprint} onChange={e => setDraft(p => ({ ...p, sprint: e.target.value }))}>
                        <option>Sprint 1</option><option>Sprint 2</option><option>Backlog</option>
                      </select>
                    ) : (
                      <span style={{ fontSize:13, color:"#adbac7" }}>🏃 {issue.sprint}</span>
                    )
                  },
                  { 
                    label:"Due Date", 
                    el: isEditing ? (
                      <input 
                        type="date" 
                        style={S.fieldInput} 
                        value={draft.dueDate || ""} 
                        onChange={e => setDraft(p => ({ ...p, dueDate: e.target.value || "" }))} 
                      />
                    ) : (
                      <span style={{ fontSize:13, color: issue.dueDate ? "#adbac7" : "#768390" }}>📅 {issue.dueDate || "No due date"}</span>
                    )
                  },
                  { label:"Watchers",    el: <span style={{ fontSize:13, color:"#adbac7" }}>👁️ {issue.watchers.length} watchers</span> },
                  { label:"Attachments", el: <span style={{ fontSize:13, color:"#adbac7" }}>📎 {issue.attach} files</span> },
                ].map(({label,el}) => (
                  <div key={label} style={{ ...S.rightField, borderBottom: "1px solid rgba(255, 255, 255, 0.04)", paddingBottom: 8, marginBottom: 8 }}>
                    <div style={S.rightLabel}>{label}</div>
                    {el}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "comments" && (
            <div>
              {issue.comments.length === 0 && <div style={S.emptyComments}>No comments yet.</div>}
              {issue.comments.map(c => {
                const cu = users.find(u => u.id === c.userId);
                return (
                  <div key={c.id} style={S.comment}>
                    <Avatar user={cu} size={28} />
                    <div style={{ flex:1, background:"#22272e", borderRadius:8, padding:"8px 12px", border:"1px solid #444c56" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontWeight:600, color:"#cdd9e5", fontSize:12 }}>{cu?.name}</span>
                        <span style={{ fontSize:11, color:"#768390" }}>{c.date}</span>
                      </div>
                      <div style={{ color:"#adbac7", fontSize:13 }}>{c.text}</div>
                    </div>
                  </div>
                );
              })}
              <div style={{ display:"flex", gap:10, marginTop:14 }}>
                <Avatar user={currentUser} size={28} />
                <textarea style={S.commentArea} rows={3} placeholder="Add a comment…"
                  value={commentTxt} onChange={e => setCTxt(e.target.value)} />
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:8 }}>
                <button style={S.btnPrimary} onClick={() => { if(commentTxt.trim()){ onComment(commentTxt); setCTxt(""); } }}
                  disabled={!commentTxt.trim()}>
                  Save
                </button>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div style={{ padding:"10px 0", display:"flex", flexDirection:"column", gap:12 }}>
              {historyList.map((h, i) => (
                <div key={h.id || i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: "#2d333b", color: "#7dc3db",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700, border:"1px solid #444c56", flexShrink:0
                  }}>
                    {h.userAvatar || (h.userName ? h.userName.slice(0,2).toUpperCase() : "US")}
                  </div>
                  <div style={{ background:"#22272e", padding:"10px 12px", borderRadius:8, border:"1px solid #444c56", flex:1 }}>
                    <div style={{ fontSize:13, color:"#cdd9e5" }}>
                      <span style={{ fontWeight:700, color:"#7dc3db" }}>{h.userName || "System"}</span> {getHistoryText(h)}
                    </div>
                    <div style={{ fontSize:11, color:"#768390", marginTop:4 }}>{h.date}</div>
                  </div>
                </div>
              ))}
              {historyList.length === 0 && (
                <div style={{ textAlign:"center", padding:"30px 10px", color:"#768390", fontStyle:"italic" }}>
                  No history recorded for this issue.
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── FOOTER ACTIONS ── */}
        <div style={{ 
          padding: "12px 20px", 
          borderTop: "1px solid var(--border)", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          background: "var(--sidebar-bg)",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12
        }}>
          {/* View Mode Export tools */}
          {!isEditing ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={handleCopyReport}
                style={{ 
                  background: "transparent", 
                  color: "#7dc3db", 
                  border: "1px solid #338ba8", 
                  borderRadius: 6, 
                  padding: "6px 12px", 
                  fontSize: 12, 
                  fontWeight: 600, 
                  cursor: "pointer"
                }}
              >
                📋 Copy Report
              </button>
              <button 
                onClick={handleDownloadReport}
                style={{ 
                  background: "transparent", 
                  color: "#adbac7", 
                  border: "1px solid #444c56", 
                  borderRadius: 6, 
                  padding: "6px 12px", 
                  fontSize: 12, 
                  fontWeight: 600, 
                  cursor: "pointer"
                }}
              >
                📥 Download Report
              </button>
            </div>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {/* Edit Mode Controls */}
          {isEditing ? (
            <div style={{ display: "flex", gap: 8 }}>
              <button 
                onClick={() => setIsEditing(false)}
                style={{ 
                  background: "transparent", 
                  color: "#adbac7", 
                  border: "1px solid #444c56", 
                  borderRadius: 6, 
                  padding: "6px 16px", 
                  fontSize: 12, 
                  fontWeight: 700, 
                  cursor: "pointer"
                }}
              >
                ✕ Cancel
              </button>
              <button 
                onClick={handleSaveChanges}
                style={{ 
                  background: "#338ba8", 
                  color: "#fff", 
                  border: "none", 
                  borderRadius: 6, 
                  padding: "6px 16px", 
                  fontSize: 12, 
                  fontWeight: 700, 
                  cursor: "pointer",
                  boxShadow: "0 0 12px rgba(51,139,168,0.4)"
                }}
              >
                💾 Save Changes
              </button>
            </div>
          ) : (
            <button 
              onClick={onClose}
              style={{ 
                background: "transparent", 
                color: "#768390", 
                border: "none", 
                fontSize: 12, 
                fontWeight: 600, 
                cursor: "pointer"
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CREATE MODAL ─────────────────────────────────────────────────────────────
function CreateModal({ onClose, onCreate, currentUser, users, initialStatus = "To Do" }) {
  const [f, setF] = useState({
    title:"", type:"task", priority:"medium", assignee: String(currentUser.id),
    status: initialStatus,
    sp:"", epic:"", labels:[], desc:"", dueDate:"", sprint:"Sprint 1", recurrence:"none",
    department: currentUser.department,
  });
  const set = (k,v) => setF(p => ({...p,[k]:v}));
  const toggleLabel = (l) => setF(p => ({ ...p, labels: p.labels.includes(l) ? p.labels.filter(x=>x!==l) : [...p.labels, l] }));

  return (
    <div style={S.modalOverlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalHdr}>
          <span style={{ fontWeight:700, fontSize:15, color:"#e6edf3" }}>Create Issue</span>
          <button style={S.iconBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.modalBody}>
          <Row label="Title *">
            <input style={S.formInput} placeholder="Issue title…" value={f.title} onChange={e => set("title",e.target.value)} autoFocus />
          </Row>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Row label="Department">
              <select style={S.formSel} value={f.department} onChange={e => set("department",e.target.value)} disabled={currentUser.role !== "admin"}>
                {Object.entries(DEPARTMENTS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Row>
            <Row label="Type">
              <select style={S.formSel} value={f.type} onChange={e => set("type",e.target.value)}>
                {Object.entries(ISSUE_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Row>
            <Row label="Status">
              <select style={S.formSel} value={f.status} onChange={e => set("status",e.target.value)}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Row>
            <Row label="Priority">
              <select style={S.formSel} value={f.priority} onChange={e => set("priority",e.target.value)}>
                {Object.entries(PRIORITIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </Row>
            <Row label="Assignee">
              <select style={S.formSel} value={f.assignee} onChange={e => set("assignee",e.target.value)}>
                <option value="">Unassigned</option>
                {users.filter(u=>u.active).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </Row>
            <Row label="Story Points">
              <input type="number" style={S.formInput} placeholder="0" min="0" value={f.sp} onChange={e => set("sp",e.target.value)} />
            </Row>
            <Row label="Sprint">
              <select style={S.formSel} value={f.sprint} onChange={e => set("sprint",e.target.value)}>
                <option>Sprint 1</option><option>Sprint 2</option><option>Backlog</option>
              </select>
            </Row>
            <Row label="Epic">
              <select style={S.formSel} value={f.epic} onChange={e => set("epic",e.target.value)}>
                <option value="">None</option>
                {EPICS.map(ep => <option key={ep.id} value={ep.id}>{ep.name}</option>)}
              </select>
            </Row>
            <Row label="Due Date">
              <input type="date" style={S.formInput} value={f.dueDate} onChange={e => set("dueDate",e.target.value)} />
            </Row>
            <Row label="Recurrence">
              <select style={S.formSel} value={f.recurrence} onChange={e => set("recurrence",e.target.value)}>
                {RECURRENCE_OPTIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase()+r.slice(1)}</option>)}
              </select>
            </Row>
          </div>
          <Row label="Description">
            <textarea style={S.formTextarea} rows={3} placeholder="Describe the issue…" value={f.desc} onChange={e => set("desc",e.target.value)} />
          </Row>
          <Row label="Labels">
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {ALL_LABELS.map(l => (
                <button key={l} style={{ ...S.labelPickBtn, ...(f.labels.includes(l)?S.labelPickActive:{}) }}
                  onClick={() => toggleLabel(l)}>{l}</button>
              ))}
            </div>
          </Row>
        </div>
        <div style={S.modalFoot}>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
          <button style={S.createBtn} onClick={() => { if(f.title.trim()) onCreate({...f, assignee:f.assignee?+f.assignee:null, sp:+f.sp||0}); }}>
            Create Issue
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
      <label style={{ fontSize:12, color:"#909dab", fontWeight:600 }}>{label}</label>
      {children}
    </div>
  );
}

// ─── FILTERS ──────────────────────────────────────────────────────────────────
function Filters({ filters, setFilters, users }) {
  const set = (k,v) => setFilters(p => ({...p,[k]:v}));
  const active = Object.values(filters).filter(v => v!=="all").length;
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
      <select style={S.sel} value={filters.type}     onChange={e => set("type",e.target.value)}>
        <option value="all">All Types</option>
        {Object.entries(ISSUE_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <select style={S.sel} value={filters.priority} onChange={e => set("priority",e.target.value)}>
        <option value="all">All Priorities</option>
        {Object.entries(PRIORITIES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
      </select>
      <select style={S.sel} value={filters.assignee} onChange={e => set("assignee",e.target.value)}>
        <option value="all">All Assignees</option>
        {(users||[]).map(u => <option key={u.id} value={String(u.id)}>{u.name}</option>)}
      </select>
      <select style={S.sel} value={filters.epic}     onChange={e => set("epic",e.target.value)}>
        <option value="all">All Epics</option>
        {EPICS.map(ep => <option key={ep.id} value={ep.id}>{ep.name}</option>)}
      </select>
      <select style={S.sel} value={filters.domain}   onChange={e => set("domain",e.target.value)}>
        <option value="all">All Domains</option>
        {Object.entries(DEPARTMENTS).map(([k,v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
      </select>
      {active > 0 && (
        <button style={S.clearBtn} onClick={() => setFilters({ type:"all", priority:"all", assignee:"all", epic:"all", domain:"all" })}>
          ✕ Clear ({active})
        </button>
      )}
    </div>
  );
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ user, size=32 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:"50%",
      background: user?.color||"#6366f1",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontSize:size*0.34, fontWeight:700, color:"#fff",
      flexShrink:0, userSelect:"none",
    }} title={user?.name}>{user?.avatar}</div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────

// ─── DB ARCHITECTURE VIEW ──────────────────────────────────────────────────
function ArchitectureView() {
  const schema = [
    { name: "issues", desc: "Core entity", keys: ["id(PK)", "key(UQ)", "assignee_id(FK->users)", "reporter_id(FK->users)", "epic_id(FK->epics)", "sprint_id(FK->sprints)"] },
    { name: "users", desc: "System users", keys: ["id(PK)", "role_id(FK->roles)", "department_id(FK->departments)"] },
    { name: "departments", desc: "User groupings", keys: ["id(PK)"] },
    { name: "roles", desc: "Access roles", keys: ["id(PK)"] },
    { name: "permissions", desc: "Atomic actions", keys: ["id(PK)"] },
    { name: "role_permissions", desc: "Junction", keys: ["role_id(FK->roles)", "permission_id(FK->permissions)"] },
    { name: "epics", desc: "Large initiatives", keys: ["id(PK)"] },
    { name: "sprints", desc: "Timeboxes", keys: ["id(PK)"] },
    { name: "labels", desc: "Tags", keys: ["id(PK)"] },
    { name: "issue_labels", desc: "Junction", keys: ["issue_id(FK->issues)", "label_id(FK->labels)"] },
    { name: "issue_watchers", desc: "Junction", keys: ["issue_id(FK->issues)", "user_id(FK->users)"] },
    { name: "comments", desc: "Issue discussions", keys: ["id(PK)", "issue_id(FK->issues)", "user_id(FK->users)"] },
    { name: "history", desc: "Audit log", keys: ["id(PK)", "issue_id(FK->issues)", "user_id(FK->users)"] },
    { name: "notifications", desc: "User alerts", keys: ["id(PK)", "user_id(FK->users)"] },
    { name: "todos", desc: "My Tasks checklists", keys: ["id(PK)", "role_id(FK->roles)", "user_id(FK->users)"] }
  ];

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={S.pageH2}>Database Architecture</h2>
        <span style={{ fontSize:12, color:"#338ba8", background:"#2d4052", padding:"4px 10px", borderRadius:4, fontWeight:700 }}>
          PostgreSQL 15 Tables
        </span>
      </div>
      <p style={{ color:"#909dab", fontSize:13, marginBottom:24, maxWidth:800, lineHeight:1.5 }}>
        This dashboard visualizes the active Metapharsic ERP PostgreSQL schema. The backend operates on a fully normalized 3NF relational structure ensuring data integrity across issues, roles, and historical audit trails.
      </p>
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(280px, 1fr))", gap:20 }}>
        {schema.map(t => (
          <div key={t.name} style={{ background:"#2d333b", border:"1px solid #444c56", borderRadius:10, overflow:"hidden" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#1c2128", padding:"10px 14px", borderBottom:"1px solid #444c56" }}>
              <span style={{ fontWeight:700, color:"#e6edf3", fontSize:14, fontFamily:"monospace" }}>{t.name}</span>
              <span style={{ fontSize:11, color:"#768390" }}>{t.desc}</span>
            </div>
            <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:6 }}>
              {t.keys.map(k => {
                const isPK = k.includes("(PK)");
                const isFK = k.includes("(FK");
                const isUQ = k.includes("(UQ)");
                let color = "#cdd9e5";
                let badge = "";
                let badgeColor = "";
                
                if (isPK) { color = "#fbbf24"; badge = "PK"; badgeColor = "#b45309"; }
                else if (isFK) { color = "#46b3cf"; badge = "FK"; badgeColor = "#0c4a6e"; }
                else if (isUQ) { color = "#a78bfa"; badge = "UQ"; badgeColor = "#4c1d95"; }
                
                const cleanName = k.split("(")[0];
                const fkTarget = isFK ? k.split("->")[1].replace(")","") : null;

                return (
                  <div key={k} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, background:"#22272e", padding:"6px 10px", borderRadius:4 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span style={{ color }}>{cleanName}</span>
                      {badge && <span style={{ fontSize:9, background:badgeColor, color:"#fff", padding:"2px 4px", borderRadius:3, fontWeight:700 }}>{badge}</span>}
                    </div>
                    {fkTarget && <span style={{ fontSize:10, color:"#768390", fontFamily:"monospace" }}>→ {fkTarget}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHANGE PASSWORD SCREEN ──────────────────────────────────────────────────
function ChangePasswordScreen({ user, onChange, onLogout }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    if (newPassword !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    setLoading(true);
    const res = await onChange(newPassword);
    if (res && res.error) setError(res.error);
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#0d1117", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:400, padding:24 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:24, fontWeight:800, color:"#e6edf3" }}>Change Password</div>
          <div style={{ fontSize:14, color:"#768390", marginTop:8 }}>For security, you must update your password.</div>
        </div>
        <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:16, padding:32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8b949e", marginBottom:6 }}>NEW PASSWORD</label>
              <input type="password" style={{ ...S.formInput, width:"100%" }} value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8b949e", marginBottom:6 }}>CONFIRM NEW PASSWORD</label>
              <input type="password" style={{ ...S.formInput, width:"100%" }} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            {error && <div style={{ color:"#f87171", fontSize:13, marginBottom:16 }}>⚠ {error}</div>}
            <button type="submit" disabled={loading} style={{ width:"100%", background:"linear-gradient(135deg,#338ba8,#6366f1)", border:"none", borderRadius:8, padding:"12px", color:"#fff", fontWeight:700, cursor:"pointer" }}>
              {loading ? "Updating..." : "Update Password"}
            </button>
            <button type="button" onClick={onLogout} style={{ width:"100%", background:"none", border:"none", color:"#768390", fontSize:13, marginTop:16, cursor:"pointer" }}>
              Cancel and Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({ users, onLogin }) {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 500)); // brief loading feel
    const result = await onLogin(email.trim(), password);
    if (result && result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  const quickLogin = async (user) => {
    await onLogin(user.email, user.password);
  };

  return (
    <div style={{
      minHeight:"100vh", background:"#0d1117", display:"flex", alignItems:"center",
      justifyContent:"center", fontFamily:"'Inter',system-ui,sans-serif", position:"relative", overflow:"hidden"
    }}>


      {/* Ambient glow */}
      <div style={{ position:"absolute", top:"20%", left:"30%", width:600, height:600, borderRadius:"50%", background:"radial-gradient(circle, #338ba820 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"10%", right:"20%", width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, #6366f120 0%, transparent 70%)", pointerEvents:"none" }} />

      <div style={{ width:"100%", maxWidth:420, padding:24, position:"relative", zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <img src="/logo.png" alt="Logo" style={{ width:56, height:56, borderRadius:12, marginBottom:12, objectFit:"contain" }} onError={e=>e.target.style.display='none'} />
          <div style={{ fontSize:24, fontWeight:800, color:"#e6edf3", letterSpacing:"-0.5px" }}>Metapharsic</div>
          <div style={{ fontSize:14, color:"#768390", marginTop:4 }}>Enterprise To Do · Sign in to continue</div>
        </div>

        {/* Card */}
        <div style={{ background:"#161b22", border:"1px solid #30363d", borderRadius:16, padding:32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom:18 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8b949e", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@metapharsic.io" required autoFocus
                style={{ width:"100%", background:"#0d1117", border:"1px solid #30363d", borderRadius:8, padding:"10px 14px", color:"#e6edf3", fontSize:14, outline:"none", boxSizing:"border-box",
                  transition:"border-color 0.2s" }}
                onFocus={e => e.target.style.borderColor="#338ba8"}
                onBlur={e => e.target.style.borderColor="#30363d"}
              />
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#8b949e", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>Password</label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPw ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password" required
                  style={{ width:"100%", background:"#0d1117", border:"1px solid #30363d", borderRadius:8, padding:"10px 40px 10px 14px", color:"#e6edf3", fontSize:14, outline:"none", boxSizing:"border-box",
                    transition:"border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor="#338ba8"}
                  onBlur={e => e.target.style.borderColor="#30363d"}
                />
                <button type="button" onClick={() => setShowPw(p => !p)}
                  style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"#768390", cursor:"pointer", fontSize:16, padding:0 }}>
                  {showPw ? "🙈" : "👁"}
                </button>
              </div>
            </div>
            {error && (
              <div style={{ background:"#3d1c1c", border:"1px solid #6b2121", borderRadius:8, padding:"10px 14px", marginBottom:16, color:"#f87171", fontSize:13 }}>
                ⚠ {error}
              </div>
            )}
            <button type="submit" disabled={loading}
              style={{ width:"100%", background: loading ? "#444c56" : "linear-gradient(135deg,#338ba8,#6366f1)", border:"none", borderRadius:8, padding:"11px", color:"#fff", fontWeight:700, fontSize:15, cursor: loading ? "not-allowed" : "pointer", transition:"opacity 0.2s" }}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          {/* Quick Access panel hidden by user request */}
          {/*
          <div style={{ marginTop:24, borderTop:"1px solid #30363d", paddingTop:20 }}>
            <div style={{ fontSize:11, color:"#8b949e", textTransform:"uppercase", fontWeight:600, letterSpacing:"0.5px", marginBottom:12 }}>Quick Access</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {users.filter(u => u.active).map(u => {
                const dept = DEPARTMENTS[u.department];
                const roleLabel = ROLES[u.role]?.label;
                return (
                  <button key={u.id} onClick={() => quickLogin(u)}
                    style={{ display:"flex", alignItems:"center", gap:12, background:"#0d1117", border:"1px solid #30363d", borderRadius:8, padding:"10px 14px", cursor:"pointer", textAlign:"left", transition:"border-color 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.borderColor="#338ba8"}
                    onMouseLeave={e => e.currentTarget.style.borderColor="#30363d"}>
                    <div style={{ width:32, height:32, borderRadius:8, background: u.color+"30", color:u.color, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 }}>
                      {u.avatar}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#e6edf3" }}>{u.name}</div>
                      <div style={{ fontSize:11, color:"#768390" }}>{dept?.icon} {dept?.label} · {roleLabel}</div>
                    </div>
                    <div style={{ fontSize:10, color:"#8b949e", fontFamily:"monospace", background:"#1c2128", padding:"2px 6px", borderRadius:4 }}>{u.password}</div>
                  </button>
                );
              })}
            </div>
          </div>
          */}
        </div>
      </div>
    </div>
  );
}

// ─── USER DASHBOARD (non-admin personal view) ───────────────────────────────
function UserDashboard({ currentUser, isAdmin, todos, setTodos, issues, users, onSelectIssue, onCreateIssue, isMobile, search, setSearch, searchInputRef, t }) {
  const myIssues  = issues.filter(i => i.assignee === currentUser.id);
  const myTodo    = myIssues.filter(i => i.status === "To Do");
  const myActive  = myIssues.filter(i => i.status === "In Progress" || i.status === "In Review");
  const myDone    = myIssues.filter(i => i.status === "Done");
  const dept      = DEPARTMENTS[currentUser.department];
  const roleTodos = todos || [];

  const toggleTodo = (id) => {
    setTodos(roleTodos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const IssueRow = ({ issue }) => {
    const ti = ISSUE_TYPES[issue.type];
    const pi = PRIORITIES[issue.priority];
    const sc = STATUS_COLORS[issue.status];
    return (
      <div onClick={() => onSelectIssue(issue)}
        style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px", borderRadius:8, cursor:"pointer", marginBottom:6, background:"#22272e", border:"1px solid #444c56",
          transition:"border-color 0.15s", }}
        onMouseEnter={e => e.currentTarget.style.borderColor="#338ba8"}
        onMouseLeave={e => e.currentTarget.style.borderColor="#444c56"}>
        <span style={{ color:ti.color, fontSize:14 }}>{ti.icon}</span>
        <span style={{ fontSize:12, color:"#768390", fontFamily:"monospace" }}>{issue.key}</span>
        <span style={{ flex:1, color:"#cdd9e5", fontSize:13, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{issue.title}</span>
        {!isMobile && <span style={{ ...S.statusPill, background:sc.bg, color:sc.text, fontSize:11 }}>{issue.status}</span>}
        <span style={{ color:pi.color, fontSize:11, fontWeight:700 }}>{pi.icon}</span>
      </div>
    );
  };

  const statBoxes = [
    { label:"Assigned", value:myIssues.length, color:"#338ba8", bg:"#2d4052" },
    { label:"To Do",    value:myTodo.length,   color:"#7dc3db", bg:"#1c2d3a" },
    { label:"Active",   value:myActive.length,  color:"#fbbf24", bg:"#2d2416" },
    { label:"Done",     value:myDone.length,    color:"#4ade80", bg:"#14312a" },
  ];

  return (
    <div style={{ paddingBottom:40 }}>
      {/* Welcome header */}
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:24, padding: isMobile ? "14px" : "20px 24px", background:"linear-gradient(135deg,#1c2128,#2d333b)", border:"1px solid #444c56", borderRadius:12, flexDirection: isMobile ? "column" : "row", textAlign: isMobile ? "center" : "left" }}>
        <div style={{ width:56, height:56, borderRadius:12, background:currentUser.color+"30", color:currentUser.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, fontWeight:800 }}>
          {currentUser.avatar}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:800, color:"#e6edf3" }}>Welcome, {currentUser.name.split(" ")[0]}!</div>
          <div style={{ fontSize:13, color:"#768390", marginTop:2 }}>
            {dept?.icon} {dept?.label} · {ROLES[currentUser.role]?.label}
          </div>
        </div>
        {!isAdmin && (
          <button onClick={onCreateIssue}
            style={{ background:"#338ba8", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:700, cursor:"pointer", width: isMobile ? "100%" : "auto" }}>
            + New Issue
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ position:"relative", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
         <div style={{ position:"relative", flex:1 }}>
            <input 
              ref={searchInputRef}
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`🔍  ${t("search")}`}
              style={{ 
                ...S.searchBox, 
                width:"100%", 
                maxWidth: isMobile ? "none" : 400, 
                paddingRight: search ? 30 : 10,
                fontSize: isMobile ? 16 : 13 // Prevent zoom on iOS
              }}
              title="Search by title, key, desc, status, type, assignee, reporter, epic, or labels. Tokens: type:, p:, key:, assignee:, epic:, label:, status:"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#8b949e",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 8, // Larger hit area for mobile
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            )}
         </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4,1fr)", gap:14, marginBottom:28 }}>
        {statBoxes.map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.color}40`, borderRadius:10, padding:"12px 14px" }}>
            <div style={{ fontSize:22, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:11, color:"#768390", marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap:20 }}>
        {/* Issue sections */}
        <div>
          {myActive.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#fbbf24", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#fbbf24", display:"inline-block" }} />
                In Progress / In Review ({myActive.length})
              </div>
              {myActive.map(i => <IssueRow key={i.key} issue={i} />)}
            </div>
          )}
          {myTodo.length > 0 && (
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:13, fontWeight:700, color:"#7dc3db", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#7dc3db", display:"inline-block" }} />
                To Do ({myTodo.length})
              </div>
              {myTodo.map(i => <IssueRow key={i.key} issue={i} />)}
            </div>
          )}
          {myDone.length > 0 && (
            <div>
              <div style={{ fontSize:13, fontWeight:700, color:"#4ade80", marginBottom:10, display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ width:8, height:8, borderRadius:"50%", background:"#4ade80", display:"inline-block" }} />
                Done ({myDone.length})
              </div>
              {myDone.map(i => <IssueRow key={i.key} issue={i} />)}
            </div>
          )}
          {myIssues.length === 0 && (
            <div style={{ textAlign:"center", padding:"40px 0", color:"#768390" }}>
              <div style={{ fontSize:32, marginBottom:10 }}>✅</div>
              <div style={{ fontSize:14 }}>No issues assigned to you yet.</div>
            </div>
          )}
        </div>

        {/* Checklist sidebar */}
        <div style={{ background:"#2d333b", border:"1px solid #444c56", borderRadius:10, padding:16, height:"fit-content" }}>
          <div style={{ fontWeight:700, color:"#e6edf3", fontSize:13, marginBottom:14, paddingBottom:10, borderBottom:"1px solid #444c56" }}>
            ☑ Role Checklist
            <span style={{ marginLeft:8, fontSize:11, color:"#768390" }}>{roleTodos.filter(t=>t.done).length}/{roleTodos.length} done</span>
          </div>
          {roleTodos.map(t => {
            const pColor = { high:"#f97316", medium:"#f59e0b", low:"#22c55e" }[t.priority] || "#768390";
            return (
              <div key={t.id} onClick={() => toggleTodo(t.id)}
                style={{ display:"flex", alignItems:"flex-start", gap:9, padding:"8px 0", cursor:"pointer", borderBottom:"1px solid #22272e", opacity: t.done ? 0.5 : 1 }}>
                <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${t.done?"#4ade80":pColor}`, background: t.done?"#4ade80":"transparent",
                  display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, transition:"all 0.15s" }}>
                  {t.done && <span style={{ color:"#0d1117", fontSize:10, fontWeight:800 }}>✓</span>}
                </div>
                <span style={{ fontSize:12, color: t.done ? "#4ade80" : "#cdd9e5", textDecoration: t.done ? "line-through" : "none", lineHeight:1.4 }}>{t.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
// ─── DEPARTMENTS VIEW ────────────────────────────────────────────────────────
function DepartmentsView({ currentUser, isAdmin, users = [], onAdd, isMobile, t }) {
  const [search, setSearch] = useState("");
  
  const allDepts = Object.entries(DEPARTMENTS);
  const visibleDepts = (isAdmin
    ? allDepts
    : allDepts.filter(([key]) => key === currentUser?.department)
  ).filter(([key, d]) => {
    const s = search.toLowerCase().trim();
    return !s || d.label.toLowerCase().includes(s) || key.toLowerCase().includes(s) || d.purpose.toLowerCase().includes(s);
  });

  return (
    <div style={{ paddingBottom: 40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, borderBottom:"1px solid var(--border)", paddingBottom:24, flexDirection: isMobile ? "column" : "row", gap: 16 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <h2 style={{ ...S.pageH2, marginBottom:0 }}>Enterprise Departments</h2>
            <span style={{ background:"var(--accent)20", color:"var(--accent)", padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:700, border:"1px solid var(--accent)30", textTransform:"uppercase", letterSpacing:"0.5px" }}>
              {allDepts.length} Units
            </span>
          </div>
          <p style={{ color:"var(--text-muted)", fontSize:14, maxWidth:700, lineHeight:1.6, margin:0 }}>
            {isAdmin
              ? "Comprehensive overview of organizational structure, operational KPIs, and cross-departmental staffing modules."
              : `Operational parameters and staffing overview for your assigned unit: ${DEPARTMENTS[currentUser?.department]?.label || ""}`
            }
          </p>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center", width: isMobile ? "100%" : "auto", flexWrap:"wrap" }}>
           <div style={{ position: "relative", display: "flex", alignItems: "center", width: isMobile ? "100%" : 200 }}>
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`🔍  Search depts...`}
              style={{ 
                ...S.searchBox, 
                width:"100%", 
                paddingRight: search ? 30 : 10,
                fontSize: isMobile ? 16 : 13
              }}
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  fontSize: 14,
                  padding: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ✕
              </button>
            )}
          </div>
          {isAdmin && (
            <button 
              style={{ ...S.btnPrimary, padding:"10px 20px", borderRadius:8, display:"flex", alignItems:"center", gap:8, fontWeight:700, boxShadow:"0 4px 15px rgba(0,0,0,0.2)", width: isMobile ? "100%" : "auto" }}
              onClick={onAdd}
            >
              <span style={{ fontSize:20, lineHeight:0, marginTop:-2 }}>+</span> Add Department
            </button>
          )}
        </div>
      </div>
      
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:20 }}>
        {visibleDepts.map(([key, d]) => {
          const deptUsers = users.filter(u => u.department === key);
          const staffingPct = Math.min(100, (deptUsers.length / 10) * 100);

          return (
            <div key={key} style={{ background:"var(--card-bg)", border:"1px solid var(--border)", borderRadius:10, overflow:"hidden", display:"flex", flexDirection:"column" }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, background:"var(--border)", padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
                <div style={{ width:36, height:36, borderRadius:8, background: d.color+"25", color: d.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                  {d.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, color:"var(--text-header)", fontSize:15 }}>{d.label}</div>
                  <div style={{ fontSize:11, color:"var(--text-muted)", textTransform:"uppercase", fontWeight:600 }}>ID: {key}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:18, fontWeight:700, color:"var(--text-header)" }}>{deptUsers.length}</div>
                  <div style={{ fontSize:9, color:"var(--text-muted)", textTransform:"uppercase" }}>Staff</div>
                </div>
              </div>
              <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:16, flex:1 }}>
                <div>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <div style={S.fieldLabel}>Staffing Capacity</div>
                    <div style={{ fontSize:11, color:"var(--text-main)", fontWeight:600 }}>{deptUsers.length} / 10</div>
                  </div>
                  <div style={S.progressBar}>
                    <div style={{ ...S.progressFill, width: `${staffingPct}%`, background: d.color }}></div>
                  </div>
                </div>

                <div>
                  <div style={S.fieldLabel}>Purpose</div>
                  <div style={{ fontSize:13, color:"var(--text-main)", lineHeight:1.5 }}>{d.purpose}</div>
                </div>

                {isAdmin && (
                  <div>
                    <div style={S.fieldLabel}>Active Members</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                      {deptUsers.slice(0, 5).map(u => (
                        <div key={u.id} title={u.name} style={{ width:24, height:24, borderRadius:"50%", background:u.color, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, border:"2px solid var(--card-bg)" }}>
                          {u.avatar}
                        </div>
                      ))}
                      {deptUsers.length > 5 && (
                        <div style={{ width:24, height:24, borderRadius:"50%", background:"var(--border)", color:"var(--text-muted)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700 }}>
                          +{deptUsers.length - 5}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div style={{ display:"flex", gap:10 }}>
                  <div style={{ flex:1 }}>
                    <div style={S.fieldLabel}>Primary Roles</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {(d.roles||"").split(",").slice(0,2).map(r => (
                        <span key={r} style={{ background:"var(--bg-main)", border:"1px solid var(--border)", color:"var(--text-muted)", padding:"2px 6px", borderRadius:4, fontSize:10 }}>
                          {r.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={S.fieldLabel}>Operational KPIs</div>
                    <div style={{ display:"flex", flexWrap:"wrap", gap:4 }}>
                      {(d.kpis||"").split("·").slice(0,1).map(k => (
                        <span key={k} style={{ color:d.color, fontSize:10, fontWeight:600 }}>
                          📈 {k.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddDeptModal({ onClose, onAdd }) {
  const [f, setF] = useState({
    id: "",
    label: "",
    icon: "🏢",
    color: "#6366f1",
    purpose: "",
    roles: "",
    kpis: ""
  });
  const set = (k,v) => setF(p => ({...p,[k]:v}));

  return (
    <div style={S.modalOverlay} onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalHdr}>
          <span style={{ fontWeight:700, fontSize:15, color:"#e6edf3" }}>Add New Department</span>
          <button style={S.iconBtn} onClick={onClose}>✕</button>
        </div>
        <div style={S.modalBody}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Row label="Department ID (e.g. sales)">
              <input style={S.formInput} placeholder="it, finance, etc." value={f.id} onChange={e => set("id", e.target.value.toLowerCase())} />
            </Row>
            <Row label="Label">
              <input style={S.formInput} placeholder="Information Technology" value={f.label} onChange={e => set("label", e.target.value)} />
            </Row>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Row label="Icon (Emoji)">
              <input style={S.formInput} placeholder="🏢" value={f.icon} onChange={e => set("icon", e.target.value)} />
            </Row>
            <Row label="Brand Color">
              <input type="color" style={{ ...S.formInput, height:38, padding:2 }} value={f.color} onChange={e => set("color", e.target.value)} />
            </Row>
          </div>
          <Row label="Mission / Purpose">
            <textarea style={S.formTextarea} rows={2} placeholder="Briefly describe the unit's goal..." value={f.purpose} onChange={e => set("purpose", e.target.value)} />
          </Row>
          <Row label="Key Roles (Comma separated)">
            <input style={S.formInput} placeholder="Manager, Developer, Designer" value={f.roles} onChange={e => set("roles", e.target.value)} />
          </Row>
          <Row label="Operational KPIs (Separated by ·)">
            <input style={S.formInput} placeholder="Uptime · MTTR · Success Rate" value={f.kpis} onChange={e => set("kpis", e.target.value)} />
          </Row>
        </div>
        <div style={S.modalFoot}>
          <button style={S.btnGhost} onClick={onAdd}>Cancel</button>
          <button style={S.createBtn} onClick={() => { if(f.id && f.label) onAdd(f); }}>
            Register Department
          </button>
        </div>
      </div>
    </div>
  );
}


// ─── SETTINGS VIEW ───────────────────────────────────────────────────────────
function SettingsView({ theme, setTheme, currentUser, updateUser, users }) {
  const [profile, setProfile] = useState({
    name: currentUser?.name || "",
    avatar: currentUser?.avatar || "👤",
    email: currentUser?.email || ""
  });

  const lang = currentUser?.settingsLanguage || "en";
  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS.en[key] || key;

  const toggleBehavior = (key, field) => {
    const newVal = !currentUser[field];
    updateUser(currentUser.id, { [field]: newVal });
  };

  const toggleNotif = (key, field) => {
    const newVal = !currentUser[field];
    updateUser(currentUser.id, { [field]: newVal });
  };

  const changeLang = (l) => updateUser(currentUser.id, { settingsLanguage: l });
  const changeTZ   = (tz) => updateUser(currentUser.id, { settingsTimezone: tz });

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ ...S.pageH2, marginBottom: 4 }}>{t("systemSettings")}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Personalize your Metapharsic ERP workspace and account preferences.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit, minmax(380px, 1fr))", gap: 24 }}>
        
        {/* ── PROFILE SECTION ── */}
        <section style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-header)", display: "flex", alignItems: "center", gap: 10, margin: 0 }}>
            👤 User Profile
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ position: "relative" }}>
              <Avatar user={currentUser} size={64} />
              <button style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: "50%", background: "var(--accent)", color: "#fff", border: "2px solid var(--card-bg)", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                ✎
              </button>
            </div>
            <div style={{ flex: 1 }}>
              <input 
                style={{ ...S.formInput, fontSize: 16, fontWeight: 700, padding: "4px 8px", background: "transparent", border: "1px dashed transparent" }}
                value={profile.name}
                onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                onBlur={() => updateUser(currentUser.id, { name: profile.name })}
              />
              <div style={{ fontSize: 12, color: "var(--text-muted)", paddingLeft: 8 }}>{profile.email}</div>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button style={{ ...S.btnGhost, width: "100%", textAlign: "left", padding: "10px 14px" }}>🔐 Change Password</button>
            <button style={{ ...S.btnGhost, width: "100%", textAlign: "left", padding: "10px 14px", color: "#f87171" }}>🚪 Sign Out of All Devices</button>
          </div>
        </section>

        {/* ── THEME SECTION ── */}
        <section style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-header)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            🎨 {t("appearance")}
          </h3>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { id: "dark", label: "Deep Space", icon: "🌙" },
              { id: "light", label: "Pure Light", icon: "☀️" },
              { id: "blue", label: "Oceanic", icon: "🌊" }
            ].map(t => (
              <div
                key={t.id}
                onClick={() => setTheme(t.id)}
                style={{
                  flex: 1, padding: 16, borderRadius: 12, cursor: "pointer",
                  border: `2px solid ${theme === t.id ? "var(--accent)" : "var(--border)"}`,
                  background: theme === t.id ? "var(--accent)10" : "var(--bg-main)",
                  textAlign: "center", transition: "all 0.2s transform active:scale(0.95)"
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 8 }}>{t.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: theme === t.id ? "var(--accent)" : "var(--text-header)" }}>{t.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── NOTIFICATIONS SECTION ── */}
        <section style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, gridRow: "span 2" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-header)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            📣 {t("commPrefs")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { id: "email",    field: "notificationEmail",    label: t("email"), desc: "Receive real-time alerts for task activity", icon: "📧" },
              { id: "whatsapp", field: "notificationWhatsapp", label: t("whatsapp"), desc: "Automated updates via CallMeBot gateway", icon: "📱" },
              { id: "inApp",    field: "notificationInApp",    label: "In-App Notifications", desc: "Browser-level alerts and sidebar badges", icon: "🔔" },
              { id: "digest",   field: "notificationDigest",   label: "Daily Task Digest", desc: "3x daily summary of pending responsibilities", icon: "📅" }
            ].map((s) => (
              <div key={s.id} onClick={() => toggleNotif(s.id, s.field)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "var(--bg-main)", borderRadius: 10, cursor: "pointer", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-header)" }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.desc}</div>
                </div>
                <div style={{ width: 40, height: 22, borderRadius: 20, background: currentUser[s.field] ? "var(--accent)" : "var(--border)", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: currentUser[s.field] ? 21 : 3, transition: "left 0.2s" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── BEHAVIOR SECTION ── */}
        <section style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-header)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            ⚙️ {t("appBehavior")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { id: "autoRefresh", field: "settingsAutoRefresh", label: "Auto-refresh Data", desc: "Sync with database every 5m" },
              { id: "compactMode", field: "settingsCompactMode", label: "Compact Interface", desc: "Minimize vertical spacing in boards" },
              { id: "animations",  field: "settingsAnimations",   label: "Motion Effects", desc: "Enable UI transitions and animations" }
            ].map((s) => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.desc}</div>
                </div>
                <div 
                  onClick={() => toggleBehavior(s.id, s.field)}
                  style={{ width: 36, height: 20, borderRadius: 20, background: currentUser[s.field] ? "var(--accent)" : "var(--border)", position: "relative", cursor: "pointer" }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: currentUser[s.field] ? 19 : 3, transition: "left 0.2s" }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── LOCALIZATION SECTION ── */}
        <section style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-header)", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            🌍 {t("localization")}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Row label={t("language")}>
              <select style={S.formSel} value={currentUser.settingsLanguage} onChange={e => changeLang(e.target.value)}>
                <option value="en">English (United States)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="ar">Arabic (العربية)</option>
              </select>
            </Row>
            <Row label={t("timezone")}>
              <select style={S.formSel} value={currentUser.settingsTimezone} onChange={e => changeTZ(e.target.value)}>
                <option value="Asia/Kolkata">(GMT+05:30) Chennai, Kolkata, Mumbai</option>
                <option value="UTC">(GMT+00:00) UTC</option>
                <option value="America/New_York">(GMT-05:00) Eastern Time</option>
                <option value="Asia/Dubai">(GMT+04:00) Gulf Standard Time</option>
              </select>
            </Row>
          </div>
        </section>

      </div>
    </div>
  );
}

// ─── COMPONENTS VIEW ─────────────────────────────────────────────────────────
function ComponentsView() {
  return (
    <div>
      <h2 style={S.pageH2}>UI Component Library</h2>
      <p style={{ color:"var(--text-muted)", fontSize:13, marginBottom:24 }}>Atomic building blocks of the Metapharsic Design System.</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:24 }}>
        <div style={{ background:"var(--card-bg)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
          <div style={S.fieldLabel}>Buttons & Actions</div>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginTop:10 }}>
            <button style={S.btnPrimary}>Primary Action</button>
            <button style={S.btnGhost}>Secondary</button>
            <button style={S.iconBtn}>⚙️</button>
            <button style={S.iconBtn}>🗑️</button>
          </div>
        </div>

        <div style={{ background:"var(--card-bg)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
          <div style={S.fieldLabel}>Status Indicators</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:10 }}>
            <span style={{ ...S.statusPill, background:"#ef444420", color:"#ef4444" }}>CRITICAL</span>
            <span style={{ ...S.statusPill, background:"#f59e0b20", color:"#f59e0b" }}>PENDING</span>
            <span style={{ ...S.statusPill, background:"#22c55e20", color:"#22c55e" }}>COMPLETED</span>
            <span style={{ ...S.statusPill, background:"#46b3cf20", color:"#46b3cf" }}>IN REVIEW</span>
          </div>
        </div>

        <div style={{ background:"var(--card-bg)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
          <div style={S.fieldLabel}>Form Elements</div>
          <div style={{ marginTop:10, display:"flex", flexDirection:"column", gap:10 }}>
            <input style={S.formInput} placeholder="Text input field..." />
            <select style={S.formSel}>
              <option>Select option...</option>
              <option>Option A</option>
              <option>Option B</option>
            </select>
          </div>
        </div>

        <div style={{ background:"var(--card-bg)", border:"1px solid var(--border)", borderRadius:12, padding:20 }}>
          <div style={S.fieldLabel}>Data Visuals</div>
          <div style={{ marginTop:10 }}>
            <div style={{ fontSize:11, color:"var(--text-muted)", marginBottom:4 }}>Progress Metric</div>
            <div style={S.progressBar}>
              <div style={{ ...S.progressFill, width: "65%" }}></div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:12 }}>
              <div style={S.statCard}>
                <div style={{ fontSize:18, fontWeight:700, color:"var(--accent)" }}>42</div>
                <div style={{ fontSize:9, color:"var(--text-muted)", textTransform:"uppercase" }}>Issues</div>
              </div>
              <div style={S.statCard}>
                <div style={{ fontSize:18, fontWeight:700, color:"#22c55e" }}>89%</div>
                <div style={{ fontSize:9, color:"var(--text-muted)", textTransform:"uppercase" }}>Velocity</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

