import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, Calendar,
  CreditCard, MessageSquare, BarChart3, Settings, LogOut, Menu, X,
  ClipboardList, Bell, ChevronRight, Layers, Wallet, FileText,
  Building2, User, ChevronLeft, Sparkles
} from 'lucide-react';

const ownerNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Teachers', path: '/teachers', icon: Users },
  { label: 'Students', path: '/students', icon: GraduationCap },
  { label: 'Batches', path: '/batches', icon: Layers },
  { label: 'Attendance', path: '/attendance', icon: ClipboardList },
  { label: 'Fees', path: '/fees', icon: CreditCard },
  { label: 'Salary', path: '/salary', icon: Wallet },
  { label: 'Tests', path: '/tests', icon: FileText },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const teacherNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Students', path: '/students', icon: GraduationCap },
  { label: 'Attendance', path: '/attendance', icon: ClipboardList },
  { label: 'Salary', path: '/salary', icon: Wallet },
  { label: 'Tests', path: '/tests', icon: FileText },
  { label: 'Profile', path: '/profile', icon: Users },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: planLimits } = usePlanLimits();

  const navItems = user?.role === 'teacher' ? teacherNav : ownerNav;
  const roleBadge = user?.role === 'owner' ? 'Owner' : 'Teacher';

  const showPlanBlock = user?.role !== 'admin' && planLimits && !planLimits.hasPlan;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar ── */}
      <motion.aside
        className={`fixed lg:static inset-y-0 left-0 z-50 flex flex-col sidebar-bg sidebar-text transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-[72px]'
          } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-sidebar-border relative">
          <motion.div
            whileHover={{ rotate: 8, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400 }}
            className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent/20"
          >
            <GraduationCap className="w-5 h-5 text-accent-foreground" />
          </motion.div>
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
              className="font-display font-bold text-lg text-primary-foreground">
              InstiFlow
            </motion.span>
          )}
          {/* Collapse btn (desktop) */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex ml-auto w-7 h-7 items-center justify-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
            <ChevronLeft className={`w-4 h-4 transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`} />
          </button>
          {/* Close btn (mobile) */}
          <button onClick={() => setMobileOpen(false)}
            className="lg:hidden ml-auto text-sidebar-foreground hover:text-primary-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2.5 space-y-0.5 overflow-y-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  whileHover={{ x: 3 }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 relative group ${isActive
                      ? 'bg-accent text-accent-foreground shadow-md shadow-accent/15'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    } ${!sidebarOpen ? 'justify-center' : ''}`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-accent-foreground rounded-r-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>{item.label}</span>}
                  {isActive && sidebarOpen && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-2.5 border-t border-sidebar-border">
          <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent/50 transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center flex-shrink-0 text-accent ring-2 ring-accent/20">
              {user?.role === 'teacher' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            {sidebarOpen && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-foreground truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-sidebar-foreground truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  {roleBadge}
                </p>
              </motion.div>
            )}
          </div>
          <motion.button
            onClick={logout}
            whileHover={{ x: 3 }}
            className={`mt-1 flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-sidebar-foreground hover:bg-destructive/15 hover:text-destructive transition-colors ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </motion.button>
        </div>
      </motion.aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-card/80 backdrop-blur-lg border-b border-border/60 flex items-center px-4 lg:px-6 gap-4 sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden lg:block text-muted-foreground hover:text-foreground transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />

          {/* Notification Bell */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="relative text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
          </motion.button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {showPlanBlock ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center max-w-md space-y-4 bg-card rounded-2xl border border-border p-10 shadow-xl">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto"
                >
                  <AlertTriangle className="w-8 h-8 text-destructive" />
                </motion.div>
                <h2 className="text-2xl font-display font-bold text-foreground">No Active Plan</h2>
                <p className="text-muted-foreground">
                  Your institute does not have an active plan. Please contact the administrator to activate a plan and regain access.
                </p>
                <button onClick={logout}
                  className="mt-4 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20">
                  Logout
                </button>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>
    </div>
  );
}
