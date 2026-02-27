import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AppLayout from "./components/layout/AppLayout";
import AdminLayout from "./components/layout/AdminLayout";
import OwnerDashboard from "./pages/OwnerDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PlansPage from "./pages/PlansPage";
import AdminStudentsPage from "./pages/AdminStudentsPage";
import AdminTeachersPage from "./pages/AdminTeachersPage";
import AdminFeesPage from "./pages/AdminFeesPage";
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import TeacherStudentsPage from "./pages/TeacherStudentsPage";
import BatchesPage from "./pages/BatchesPage";
import AttendancePage from "./pages/AttendancePage";
import TeacherSalaryHistory from "./pages/TeacherSalaryHistory";
import TeacherProfilePage from "./pages/TeacherProfilePage";
import FeesPage from "./pages/FeesPage";
import LeavesPage from "./pages/LeavesPage";
import SettingsPage from "./pages/SettingsPage";
import SalaryPage from "./pages/SalaryPage";
import TestsPage from "./pages/TestsPage";
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
              <Route path="/plans" element={<PlansPage />} />
              <Route path="/students" element={<AdminStudentsPage />} />
              <Route path="/teachers" element={<AdminTeachersPage />} />
              <Route path="/fees" element={<AdminFeesPage />} />
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
      {/* Public routes */}
      <Route path="/" element={!isAuthenticated ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} />

      {/* Authenticated institute/teacher routes */}
      {isAuthenticated && user?.role !== 'admin' ? (
        <Route path="/*" element={
          <AppLayout>
            <Routes>
              <Route path="/dashboard" element={user?.role === 'teacher' ? <TeacherDashboard /> : <OwnerDashboard />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/students" element={user?.role === 'teacher' ? <TeacherStudentsPage /> : <StudentsPage />} />
              <Route path="/batches" element={<BatchesPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/fees" element={<FeesPage />} />
              <Route path="/salary" element={user?.role === 'teacher' ? <TeacherSalaryHistory /> : <SalaryPage />} />
              <Route path="/leaves" element={<LeavesPage />} />
              <Route path="/tests" element={<TestsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<TeacherProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        } />
      ) : !isAuthenticated ? (
        <Route path="*" element={<Navigate to="/" replace />} />
      ) : null}
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
