/**
 * FFIMS — Combined Supervisor Dashboard
 * File: dashboard.jsx
 *
 * Contains:
 *  1. Executive Overview (KPI bar + 6 dashboard cards)
 *  2. Task Management (add, complete, delete tasks)
 *  3. Team Status (who is on duty)
 *  4. Project Progress (progress bars)
 *  5. Recent Activity Feed
 *  6. Quick Actions
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
const C = {
  red:     '#c0392b',
  redDark: '#96281b',
  redSoft: '#fde8e8',
  bg:      '#f4f4f6',
  card:    '#ffffff',
  border:  '#e8e8ec',
  text:    '#1a1a2e',
  muted:   '#6b7280',
  green:   '#16a34a',
  amber:   '#d97706',
  blue:    '#2563eb',
  purple:  '#7c3aed',
  teal:    '#0d9488',
  indigo:  '#4f46e5',
};

// ─── DASHBOARD REGISTRY ───────────────────────────────────────────────────────
const DASHBOARDS = [
  {
    id: 'workforce',
    label: 'Workforce & Scheduling',
    path: '/dashboards/workforce',
    icon: '👥',
    color: C.blue,
    description: 'Active rosters, shift planning, overtime approvals, availability board',
    kpis: [
      { label: 'On Duty Now',       value: '24',   sub: 'staff active' },
      { label: 'Overtime Requests', value: '3',    sub: 'pending approval' },
      { label: 'Compliance',        value: '94%',  sub: 'labor standards' },
    ],
    status: 'operational',
  },
  {
    id: 'ffu-bookings',
    label: 'FFU Booking System',
    path: '/dashboards/ffu-bookings',
    icon: '📋',
    color: C.purple,
    description: 'Facility bookings, equipment logistics, departmental approvals',
    kpis: [
      { label: 'Active Bookings',  value: '12',  sub: 'this week' },
      { label: 'Pending Approval', value: '5',   sub: 'awaiting sign-off' },
      { label: 'Utilisation',      value: '78%', sub: 'facility use rate' },
    ],
    status: 'attention',
  },
  {
    id: 'inventory',
    label: 'Inventory Management',
    path: '/dashboards/inventory',
    icon: '📦',
    color: C.teal,
    description: 'Stock levels, requisitions, low-stock alerts, category tracking',
    kpis: [
      { label: 'Total Products',   value: '1,245', sub: 'in stock' },
      { label: 'Low Stock Alerts', value: '12',    sub: 'need reorder' },
      { label: 'Pending Reqs',     value: '8',     sub: 'open requisitions' },
    ],
    status: 'warning',
  },
  {
    id: 'internal-billing',
    label: 'Internal Billing',
    path: '/dashboards/internal-billing',
    icon: '💰',
    color: C.green,
    description: 'Cost recovery, transactions, department billing, revenue analytics',
    kpis: [
      { label: 'Gross Revenue',  value: '$1.42M', sub: 'this period' },
      { label: 'Overdue Bills',  value: '3',      sub: 'action needed' },
      { label: 'Pending Bills',  value: '142',    sub: 'awaiting payment' },
    ],
    status: 'attention',
  },
  {
    id: 'campus-monitoring',
    label: 'Campus Monitoring',
    path: '/dashboards/campus-monitoring',
    icon: '⚡',
    color: C.red,
    description: 'Energy & water utilities, tank levels, building usage, live alerts',
    kpis: [
      { label: 'Energy Level',  value: '72%', sub: 'current capacity' },
      { label: 'Water Level',   value: '58%', sub: 'tank average' },
      { label: 'Active Alerts', value: '2',   sub: 'require attention' },
    ],
    status: 'warning',
  },
  {
    id: 'documents',
    label: 'Document Management',
    path: '/dashboards/documents',
    icon: '🗂️',
    color: C.indigo,
    description: 'PDFs, photos, reports, version control, module-linked document governance',
    kpis: [
      { label: 'Total Documents', value: '284', sub: 'across all modules' },
      { label: 'Recent Uploads',  value: '11',  sub: 'last 7 days' },
      { label: 'Modules Covered', value: '23',  sub: 'out of 23' },
    ],
    status: 'operational',
  },
];

// ─── TEAM MEMBERS ─────────────────────────────────────────────────────────────
const TEAM = [
  { name: 'John',       role: 'Maintenance Tech',  status: 'on-duty',    avatar: 'JO' },
  { name: 'Mary',       role: 'Facilities Officer', status: 'on-duty',   avatar: 'MA' },
  { name: 'Brian',      role: 'Bus Driver',         status: 'standby',   avatar: 'BR' },
  { name: 'Tendai',     role: 'Security Guard',     status: 'off-duty',  avatar: 'TE' },
  { name: 'Supervisor', role: 'Supervisor',         status: 'on-duty',   avatar: 'SV' },
];

const TEAM_STATUS_CFG = {
  'on-duty':  { label: 'On Duty',  color: C.green,  bg: '#dcfce7' },
  'standby':  { label: 'Standby',  color: C.amber,  bg: '#fef3c7' },
  'off-duty': { label: 'Off Duty', color: C.muted,  bg: '#f3f4f6' },
};

// ─── INITIAL PROJECTS ─────────────────────────────────────────────────────────
const INITIAL_PROJECTS = [
  { id: 1, name: 'Fleet Management System',    progress: 85, color: C.blue   },
  { id: 2, name: 'Campus Utilities Dashboard', progress: 72, color: C.teal   },
  { id: 3, name: 'Internal Billing Module',    progress: 60, color: C.green  },
  { id: 4, name: 'Document Management',        progress: 90, color: C.indigo },
  { id: 5, name: 'FFU Booking Integration',    progress: 45, color: C.purple },
];

// ─── ACTIVITY FEED DATA ───────────────────────────────────────────────────────
const ACTIVITY = [
  { time: '09:24', module: 'Workforce',    msg: 'Overtime request approved for Driver Team A',   type: 'success' },
  { time: '09:18', module: 'Billing',      msg: '3 bills overdue by more than 30 days',          type: 'warning' },
  { time: '09:05', module: 'Inventory',    msg: 'Projector Bulbs stock reached 0 — reorder now', type: 'danger'  },
  { time: '08:51', module: 'Campus',       msg: 'Water Tank 2 below 50% — auto refill triggered',type: 'info'    },
  { time: '08:40', module: 'FFU Bookings', msg: 'New booking request from Engineering Dept',     type: 'info'    },
  { time: '08:22', module: 'Documents',    msg: 'Governance Matrix v2 uploaded by P3 Lead',      type: 'success' },
];

const TYPE_COLOR = { success: C.green, warning: C.amber, danger: C.red, info: C.blue };

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      marginBottom: 14,
    }}>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>
          {icon} {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── STATUS PILL ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  operational: { label: 'Operational',    color: C.green, dot: '#22c55e' },
  attention:   { label: 'Needs Attention', color: C.amber, dot: '#f59e0b' },
  warning:     { label: 'Warning',         color: C.red,   dot: '#ef4444' },
};

function StatusPill({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.operational;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 700, letterSpacing: '0.4px',
      color: cfg.color, background: cfg.color + '18',
      padding: '3px 9px', borderRadius: 20,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label.toUpperCase()}
    </span>
  );
}

// ─── SUMMARY BAR ──────────────────────────────────────────────────────────────
function SummaryBar() {
  const operational = DASHBOARDS.filter(d => d.status === 'operational').length;
  const attention   = DASHBOARDS.filter(d => d.status === 'attention').length;
  const warning     = DASHBOARDS.filter(d => d.status === 'warning').length;

  const items = [
    { label: 'Total Modules',   value: DASHBOARDS.length, color: C.blue,   icon: '🧩' },
    { label: 'Operational',     value: operational,       color: C.green,  icon: '✅' },
    { label: 'Needs Attention', value: attention,         color: C.amber,  icon: '⚠️' },
    { label: 'Warnings Active', value: warning,           color: C.red,    icon: '🔴' },
    { label: 'Staff On Duty',   value: '24',              color: C.purple, icon: '👤' },
    { label: 'Open Alerts',     value: '7',               color: C.red,    icon: '🔔' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 28 }}>
      {items.map(({ label, value, color, icon }) => (
        <div key={label} style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderTop: `3px solid ${color}`,
          borderRadius: 10, padding: '14px 16px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: C.text, lineHeight: 1 }}>{value}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.4px' }}>{label}</div>
        </div>
      ))}
    </div>
  );
}

// ─── DASHBOARD CARD ───────────────────────────────────────────────────────────
function DashboardCard({ dash }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: C.card,
        border: `1.5px solid ${hovered ? dash.color : C.border}`,
        borderRadius: 14, overflow: 'hidden',
        boxShadow: hovered ? `0 8px 28px ${dash.color}22` : '0 1px 4px rgba(0,0,0,0.05)',
        transition: 'all 0.22s ease',
        transform: hovered ? 'translateY(-3px)' : 'none',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        background: hovered ? dash.color : dash.color + '12',
        padding: '18px 20px 16px',
        borderBottom: `1px solid ${dash.color}22`,
        transition: 'background 0.22s ease',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>{dash.icon}</span>
          <div style={{ fontSize: 14, fontWeight: 800, color: hovered ? '#fff' : C.text, transition: 'color 0.22s' }}>
            {dash.label}
          </div>
        </div>
        <StatusPill status={dash.status} />
      </div>

      <div style={{ padding: '12px 20px 0', fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
        {dash.description}
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        gap: 1, margin: '14px 20px',
        background: C.border, borderRadius: 8, overflow: 'hidden',
      }}>
        {dash.kpis.map(kpi => (
          <div key={kpi.label} style={{ background: C.card, padding: '10px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: dash.color }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.3px', marginTop: 2 }}>{kpi.label}</div>
            <div style={{ fontSize: 10, color: C.muted + 'aa', marginTop: 1 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '0 20px 18px', marginTop: 'auto' }}>
        <Link to={dash.path} style={{
          display: 'block', textAlign: 'center',
          background: hovered ? dash.color : 'transparent',
          color: hovered ? '#fff' : dash.color,
          border: `1.5px solid ${dash.color}`,
          borderRadius: 8, padding: '9px 0',
          fontSize: 13, fontWeight: 700,
          textDecoration: 'none', transition: 'all 0.22s ease',
        }}>
          Open Dashboard →
        </Link>
      </div>
    </div>
  );
}

// ─── TASK PANEL ───────────────────────────────────────────────────────────────
const OWNERS = ['John', 'Mary', 'Brian', 'Tendai', 'Supervisor'];
const PRIORITIES = ['High', 'Medium', 'Low'];
const PRIORITY_COLOR = { High: C.red, Medium: C.amber, Low: C.green };

const INITIAL_TASKS = [
  { id: 1, title: 'Inspect generator fuel levels',   owner: 'John',    due: '2026-04-09', priority: 'High',   done: false },
  { id: 2, title: 'Review pending overtime requests', owner: 'Supervisor', due: '2026-04-09', priority: 'High', done: false },
  { id: 3, title: 'Restock whiteboard markers',      owner: 'Mary',    due: '2026-04-10', priority: 'Low',    done: false },
  { id: 4, title: 'Confirm FFU bookings for Friday', owner: 'Brian',   due: '2026-04-10', priority: 'Medium', done: false },
  { id: 5, title: 'Upload maintenance photos',       owner: 'Tendai',  due: '2026-04-11', priority: 'Low',    done: true  },
];

function TaskPanel() {
  const [tasks, setTasks]       = useState(INITIAL_TASKS);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter]     = useState('all');
  const [form, setForm]         = useState({ title: '', owner: 'John', due: '', priority: 'Medium' });

  const filtered = tasks.filter(t =>
    filter === 'all'  ? true :
    filter === 'todo' ? !t.done :
    filter === 'done' ? t.done  : true
  );

  function addTask() {
    if (!form.title.trim()) return;
    setTasks(prev => [...prev, { ...form, id: Date.now(), done: false }]);
    setForm({ title: '', owner: 'John', due: '', priority: 'Medium' });
    setShowModal(false);
  }

  function toggleDone(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTask(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
  }

  const inp = {
    padding: '8px 10px', border: `1px solid ${C.border}`,
    borderRadius: 6, fontSize: 13, width: '100%',
    outline: 'none', fontFamily: 'inherit', color: C.text,
    background: '#fafafa',
  };

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <SectionHeader
        icon="✅" title="Today's Tasks"
        subtitle={`${tasks.filter(t => !t.done).length} remaining · ${tasks.filter(t => t.done).length} done`}
        action={
          <button onClick={() => setShowModal(true)} style={{
            background: C.red, color: '#fff', border: 'none',
            borderRadius: 7, padding: '7px 14px', fontSize: 12,
            fontWeight: 700, cursor: 'pointer',
          }}>+ New Task</button>
        }
      />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
        {['all', 'todo', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
            border: `1px solid ${filter === f ? C.red : C.border}`,
            background: filter === f ? C.redSoft : 'transparent',
            color: filter === f ? C.red : C.muted, cursor: 'pointer',
            textTransform: 'capitalize',
          }}>{f === 'all' ? 'All' : f === 'todo' ? 'To Do' : 'Done'}</button>
        ))}
      </div>

      {/* Task list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: C.muted, fontSize: 13, padding: '20px 0' }}>No tasks here</div>
        )}
        {filtered.map(task => (
          <div key={task.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8,
            border: `1px solid ${task.done ? C.border : C.border}`,
            background: task.done ? '#fafafa' : '#fff',
            opacity: task.done ? 0.7 : 1,
          }}>
            <input type="checkbox" checked={task.done} onChange={() => toggleDone(task.id)}
              style={{ width: 16, height: 16, accentColor: C.green, cursor: 'pointer', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: C.text,
                textDecoration: task.done ? 'line-through' : 'none',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{task.title}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                {task.owner} · {task.due || 'No due date'}
              </div>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10,
              color: PRIORITY_COLOR[task.priority],
              background: PRIORITY_COLOR[task.priority] + '18',
            }}>{task.priority}</span>
            <button onClick={() => deleteTask(task.id)} style={{
              background: 'none', border: 'none', color: '#ccc', cursor: 'pointer',
              fontSize: 16, lineHeight: 1, padding: '0 2px', flexShrink: 0,
            }}>×</button>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
        }} onClick={() => setShowModal(false)}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 24, width: 380,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 18 }}>New Task</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input style={inp} placeholder="Task title..." value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <select style={inp} value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}>
                  {OWNERS.map(o => <option key={o}>{o}</option>)}
                </select>
                <select style={inp} value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                  {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>

              <input style={inp} type="date" value={form.due}
                onChange={e => setForm(f => ({ ...f, due: e.target.value }))} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '9px 0', border: `1px solid ${C.border}`,
                borderRadius: 7, background: '#fff', fontSize: 13, fontWeight: 600,
                color: C.muted, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={addTask} style={{
                flex: 1, padding: '9px 0', border: 'none',
                borderRadius: 7, background: C.red, fontSize: 13, fontWeight: 700,
                color: '#fff', cursor: 'pointer',
              }}>Add Task</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TEAM STATUS PANEL ────────────────────────────────────────────────────────
function TeamStatus() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <SectionHeader icon="👥" title="Team Status" subtitle="Live availability" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TEAM.map(member => {
          const cfg = TEAM_STATUS_CFG[member.status];
          return (
            <div key={member.name} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${C.border}`, background: '#fafafa',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: `linear-gradient(135deg, ${C.red}, ${C.redDark})`,
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0,
              }}>{member.avatar}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{member.name}</div>
                <div style={{ fontSize: 11, color: C.muted }}>{member.role}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: cfg.color, background: cfg.bg,
                padding: '3px 10px', borderRadius: 20,
              }}>{cfg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROJECT PROGRESS ─────────────────────────────────────────────────────────
function ProjectProgress() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <SectionHeader icon="📊" title="Project Progress" subtitle="FFIMS module completion" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {INITIAL_PROJECTS.map(proj => (
          <div key={proj.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{proj.name}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: proj.color }}>{proj.progress}%</span>
            </div>
            <div style={{ height: 7, background: C.border, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${proj.progress}%`,
                background: `linear-gradient(90deg, ${proj.color}aa, ${proj.color})`,
                borderRadius: 4, transition: 'width 0.6s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
function ActivityFeed() {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <SectionHeader icon="🕐" title="Recent Activity" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {ACTIVITY.map((a, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '10px 0',
            borderBottom: i < ACTIVITY.length - 1 ? `1px solid ${C.border}` : 'none',
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
              background: TYPE_COLOR[a.type] || C.muted,
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>{a.msg}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                <span style={{ fontWeight: 700 }}>{a.module}</span> · {a.time}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── QUICK ACTIONS ────────────────────────────────────────────────────────────
function QuickActions() {
  const actions = [
    { label: 'Approve Overtime',     icon: '✅', path: '/dashboards/workforce',        color: C.blue   },
    { label: 'Review Overdue Bills', icon: '💳', path: '/dashboards/internal-billing', color: C.red    },
    { label: 'Reorder Inventory',    icon: '📦', path: '/dashboards/inventory',        color: C.teal   },
    { label: 'View Campus Alerts',   icon: '⚡', path: '/dashboards/campus-monitoring',color: C.amber  },
    { label: 'Pending Bookings',     icon: '📋', path: '/dashboards/ffu-bookings',     color: C.purple },
    { label: 'Upload Document',      icon: '📄', path: '/dashboards/documents',        color: C.indigo },
  ];

  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
      <SectionHeader icon="⚡" title="Quick Actions" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {actions.map(a => (
          <Link key={a.label} to={a.path} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8,
              border: `1px solid ${C.border}`,
              fontSize: 13, fontWeight: 600, color: C.text,
              transition: 'all 0.18s', cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + '10'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 15 }}>{a.icon}</span>
              {a.label}
              <span style={{ marginLeft: 'auto', color: a.color, fontWeight: 700 }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── TOP NAV ──────────────────────────────────────────────────────────────────
function TopNav({ darkMode, setDarkMode }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <header style={{
      background: `linear-gradient(135deg, ${C.red}, ${C.redDark})`,
      padding: '0 28px', height: 58,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 2px 12px rgba(192,57,43,0.35)',
      position: 'sticky', top: 0, zIndex: 200,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 22 }}>🏛️</span>
        <div>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 15, letterSpacing: '-0.3px', lineHeight: 1.1 }}>
            AFRICA UNIVERSITY — FFIMS
          </div>
          <div style={{ color: 'rgba(255,255,255,0.72)', fontSize: 11 }}>
            Facilities & Infrastructure Management System · Mutare Campus
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontFamily: 'monospace' }}>
          {time.toLocaleTimeString('en-GB')} · {time.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
        <button onClick={() => setDarkMode(d => !d)} style={{
          background: 'rgba(255,255,255,0.15)', border: 'none',
          borderRadius: 6, padding: '5px 10px', cursor: 'pointer',
          fontSize: 16, color: '#fff',
        }}>{darkMode ? '☀️' : '🌙'}</button>
        <div style={{
          width: 34, height: 34, borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 800, fontSize: 13,
        }}>SV</div>
      </div>
    </header>
  );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export default function SupervisorDashboard() {
  const [darkMode, setDarkMode] = useState(false);

  const bg   = darkMode ? '#0f0f1a' : C.bg;
  const text = darkMode ? '#e5e7eb' : C.text;

  return (
    <div style={{ background: bg, minHeight: '100vh', color: text, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <TopNav darkMode={darkMode} setDarkMode={setDarkMode} />

      <div style={{ padding: '24px 28px 48px', maxWidth: 1400, margin: '0 auto' }}>

        {/* ── Page Title ── */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: text, margin: 0, letterSpacing: '-0.5px' }}>
            Supervisor Dashboard
          </h1>
          <p style={{ fontSize: 13, color: C.muted, margin: '4px 0 0' }}>
            Monitor tasks, team performance, and project progress · Africa University FFIMS
          </p>
        </div>

        {/* ── Section 1: KPI Summary Bar ── */}
        <SummaryBar />

        {/* ── Section 2: 6 Dashboard Cards ── */}
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: text, marginBottom: 14 }}>
            🧩 Module Overview
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18, marginBottom: 28 }}>
            {DASHBOARDS.map(d => <DashboardCard key={d.id} dash={d} />)}
          </div>
        </div>

        {/* ── Section 3: Tasks + Team (side by side) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 18, marginBottom: 18 }}>
          <TaskPanel />
          <TeamStatus />
        </div>

        {/* ── Section 4: Project Progress + Activity + Quick Actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 300px', gap: 18 }}>
          <ProjectProgress />
          <ActivityFeed />
          <QuickActions />
        </div>

      </div>
    </div>
  );
}