import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  CreditCard, MessageSquare, BarChart3, Settings, LogOut, Menu, X,
  ClipboardList, Bell, ChevronRight, Layers
} from 'lucide-react';

const ownerNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Teachers', path: '/teachers', icon: Users },
  { label: 'Students', path: '/students', icon: GraduationCap },
  { label: 'Courses', path: '/courses', icon: BookOpen },
  { label: 'Batches', path: '/batches', icon: Layers },
  { label: 'Attendance', path: '/attendance', icon: ClipboardList },
  { label: 'Fees', path: '/fees', icon: CreditCard },
  { label: 'Leave Requests', path: '/leaves', icon: Calendar },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const teacherNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Classes', path: '/classes', icon: BookOpen },
  { label: 'Attendance', path: '/attendance', icon: ClipboardList },
  { label: 'Leave', path: '/leaves', icon: Calendar },
  { label: 'Feedback', path: '/feedback', icon: MessageSquare },
];

const studentNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Courses', path: '/courses', icon: BookOpen },
  { label: 'Attendance', path: '/attendance', icon: ClipboardList },
  { label: 'Fees', path: '/fees', icon: CreditCard },
  { label: 'Feedback', path: '/feedback', icon: MessageSquare },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = user?.role === 'owner' ? ownerNav : user?.role === 'teacher' ? teacherNav : studentNav;

  const roleBadge = user?.role === 'owner' ? 'Owner' : user?.role === 'teacher' ? 'Teacher' : 'Student';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col sidebar-bg sidebar-text transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-accent-foreground" />
          </div>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display font-bold text-lg text-primary-foreground">
              InstiFlow
            </motion.span>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent text-accent-foreground shadow-md'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
                {isActive && sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-3 border-t border-sidebar-border">
          <div className={`flex items-center gap-3 px-3 py-2 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-9 h-9 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent text-sm font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-foreground truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-sidebar-foreground truncate">{roleBadge}</p>
              </div>
            )}
          </div>
          <button
            onClick={logout}
            className="mt-2 flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/20 hover:text-destructive transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center px-4 lg:px-6 gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Menu className="w-6 h-6" />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block text-muted-foreground hover:text-foreground">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button className="relative text-muted-foreground hover:text-foreground">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive rounded-full text-[10px] text-destructive-foreground flex items-center justify-center font-bold">3</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
