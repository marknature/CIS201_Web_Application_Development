
 

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

// ─── Dashboard Imports ────────────────────────────────────────────────────────
// Executive overview (this repo)
import ExecutiveDashboard from './pages/Dashboards/ExecutiveDashboard';

// Existing dashboards — adjust paths if your folder names differ
import ShiftSchedulingDashboard  from './pages/Dashboards/Shift_and_Workforce_Scheduling/react/App';
import FFUBookingDashboard       from './pages/Dashboards/FFU_Booking_System/react/App';
import InventoryDashboard        from './pages/Dashboards/Inventory_Management/react/App';
import InternalBillingDashboard  from './pages/Dashboards/Internal_Billing/react/App';
import CampusMonitoringDashboard from './pages/Dashboards/Campus_Monitoring/react/App';
import DocumentManagementApp    from './pages/Dashboards/Document_Management/react/App';

// ─── Sidebar nav items (keep in sync with ExecutiveDashboard.jsx DASHBOARDS) ──
const NAV_ITEMS = [
  { path: '/dashboards',                   label: 'Executive Overview', icon: '🏛️'  },
  { path: '/dashboards/workforce',          label: 'Workforce',          icon: '👥' },
  { path: '/dashboards/ffu-bookings',       label: 'FFU Bookings',       icon: '📋' },
  { path: '/dashboards/inventory',          label: 'Inventory',          icon: '📦' },
  { path: '/dashboards/internal-billing',   label: 'Billing',            icon: '💰' },
  { path: '/dashboards/campus-monitoring',  label: 'Campus Monitoring',  icon: '⚡' },
  { path: '/dashboards/documents',          label: 'Documents',          icon: '🗂️' },
];

// ─── Shared Sidebar Layout (wraps all sub-dashboards) ─────────────────────────
function DashboardLayout({ children }) {
  const location = useLocation();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, flexShrink: 0, background: '#1a1a2e',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Logo area */}
        <div style={{
          padding: '18px 16px 14px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ color: '#fff', fontWeight: 900, fontSize: 13, letterSpacing: '-0.3px' }}>
            FFIMS System
          </div>
          <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 10, marginTop: 2 }}>
            Africa University
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ padding: '10px 10px', flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = item.path === '/dashboards'
              ? location.pathname === '/dashboards' || location.pathname === '/dashboards/'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: 9,
                  padding: '9px 12px', borderRadius: 7, marginBottom: 2,
                  textDecoration: 'none',
                  background: active ? 'rgba(192,57,43,0.85)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          fontSize: 11, color: 'rgba(255,255,255,0.35)',
        }}>
          FFIMS v1.0 · Supervisor View
        </div>
      </aside>

      {/* Main content area */}
      <div style={{ flex: 1, overflowY: 'auto', background: '#f4f4f6' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────
export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect bare "/" to the executive dashboard */}
        <Route path="/" element={<Navigate to="/dashboards" replace />} />

        {/* Executive overview — no sidebar wrapper, it has its own TopNav */}
        <Route path="/dashboards" element={<ExecutiveDashboard />} />

        {/* All sub-dashboards share the sidebar layout */}
        <Route path="/dashboards/workforce" element={
          <DashboardLayout><ShiftSchedulingDashboard /></DashboardLayout>
        } />
        <Route path="/dashboards/ffu-bookings" element={
          <DashboardLayout><FFUBookingDashboard /></DashboardLayout>
        } />
        <Route path="/dashboards/inventory" element={
          <DashboardLayout><InventoryDashboard /></DashboardLayout>
        } />
        <Route path="/dashboards/internal-billing" element={
          <DashboardLayout><InternalBillingDashboard /></DashboardLayout>
        } />
        <Route path="/dashboards/campus-monitoring" element={
          <DashboardLayout><CampusMonitoringDashboard /></DashboardLayout>
        } />
        <Route path="/dashboards/documents" element={
          <DashboardLayout><DocumentManagementApp /></DashboardLayout>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboards" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
