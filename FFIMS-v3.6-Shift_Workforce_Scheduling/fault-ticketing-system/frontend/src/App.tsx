import type { ReactElement } from "react";
<<<<<<< HEAD
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
=======
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
import { Toaster } from "sonner";
import { ShellLayout } from "@/components/ffims/ShellLayout";
import { LoadingPanel } from "@/components/ffims/LoadingPanel";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/lib/api";
import { FaultDashboardPage } from "@/pages/FaultDashboardPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import NotFound from "@/pages/NotFound";
import { ReportFaultPage } from "@/pages/ReportFaultPage";
import { TechnicianWorkspacePage } from "@/pages/TechnicianWorkspacePage";
import { TicketDetailsPage } from "@/pages/TicketDetailsPage";
import { TicketsPage } from "@/pages/TicketsPage";

function RequireRole({ allow, children }: { allow: UserRole[]; children: ReactElement }) {
  const { user } = useAuth();
  const role = user?.role;

  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function ProtectedRoutes() {
  const { initializing, isAuthenticated } = useAuth();
<<<<<<< HEAD
=======
  const location = useLocation();
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29

  if (initializing) {
    return (
      <div className="p-4 md:p-8">
        <LoadingPanel label="Loading FFIMS workspace..." />
      </div>
    );
  }

  if (!isAuthenticated) {
<<<<<<< HEAD
    return <Navigate to="/login" replace />;
=======
    return <Navigate to="/login" state={{ from: location }} replace />;
>>>>>>> 877612de4d8f4b8638124d5d512959a33afc6a29
  }

  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/fault-ticketing"
          element={
            <RequireRole allow={["admin"]}>
              <FaultDashboardPage />
            </RequireRole>
          }
        />
        <Route path="/fault-ticketing/report" element={<ReportFaultPage />} />
        <Route path="/fault-ticketing/tickets" element={<TicketsPage />} />
        <Route
          path="/fault-ticketing/workspace"
          element={
            <RequireRole allow={["technician", "admin"]}>
              <TechnicianWorkspacePage />
            </RequireRole>
          }
        />
        <Route path="/fault-ticketing/:id" element={<TicketDetailsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function PublicRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <PublicRoutes />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}
