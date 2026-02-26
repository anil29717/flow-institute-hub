import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import BatchesPage from "./pages/BatchesPage";
import AttendancePage from "./pages/AttendancePage";

import FeesPage from "./pages/FeesPage";
import LeavesPage from "./pages/LeavesPage";
import SettingsPage from "./pages/SettingsPage";
import SalaryPage from "./pages/SalaryPage";
import NotFound from "./pages/NotFound";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Admin login route - always accessible */}
      <Route path="/admin/login" element={
        isAuthenticated && user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLoginPage />
      } />

      {/* Admin routes */}
      {isAuthenticated && user?.role === 'admin' && (
        <Route path="/admin/*" element={
          <AdminLayout>
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AdminLayout>
        } />
      )}

      {/* Redirect admin away from institute routes */}
      {isAuthenticated && user?.role === 'admin' && (
        <Route path="*" element={<Navigate to="/admin" replace />} />
      )}

      {/* Institute/Teacher routes */}
      {!isAuthenticated ? (
        <Route path="*" element={<LoginPage />} />
      ) : (
        <Route path="*" element={
          <AppLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<OwnerDashboard />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/batches" element={<BatchesPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/salary" element={<SalaryPage />} />
              <Route path="/leaves" element={<LeavesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/classes" element={<NotFound />} />
              <Route path="/feedback" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        } />
      )}
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
