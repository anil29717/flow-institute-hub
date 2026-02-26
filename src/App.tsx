import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/layout/AppLayout";
import OwnerDashboard from "./pages/OwnerDashboard";
import TeachersPage from "./pages/TeachersPage";
import StudentsPage from "./pages/StudentsPage";
import CoursesPage from "./pages/CoursesPage";
import FeesPage from "./pages/FeesPage";
import LeavesPage from "./pages/LeavesPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginPage />;

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<OwnerDashboard />} />
        <Route path="/teachers" element={<TeachersPage />} />
        <Route path="/students" element={<StudentsPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/batches" element={<PlaceholderPage title="Batches" />} />
        <Route path="/attendance" element={<PlaceholderPage title="Attendance" />} />
        <Route path="/fees" element={<FeesPage />} />
        <Route path="/leaves" element={<LeavesPage />} />
        <Route path="/reports" element={<PlaceholderPage title="Reports & Analytics" />} />
        <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
        <Route path="/classes" element={<PlaceholderPage title="My Classes" />} />
        <Route path="/feedback" element={<PlaceholderPage title="Feedback" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
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
