import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Shield, BookOpen, Loader2, ArrowLeft, AlertTriangle, ArrowRight, Sparkles, Lock, Mail, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SEO } from "@/components/seo/SEO";

type AppRole = 'owner' | 'teacher';
type Mode = 'select' | 'login';

const roles: { role: AppRole; label: string; description: string; icon: typeof Shield; gradient: string }[] = [
  { role: 'owner', label: 'Institute Owner', description: 'Full access to manage teachers, courses, finances and reports', icon: Shield, gradient: 'from-primary to-primary/80' },
  { role: 'teacher', label: 'Teacher', description: 'Manage classes, mark attendance, enter grades', icon: BookOpen, gradient: 'from-secondary to-secondary/80' },
];

const features = [
  'Manage students, teachers & batches',
  'Track fees & generate receipts',
  'Smart attendance system',
  'Real-time analytics dashboard',
];

export default function LoginPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('select');
  const [selectedRole, setSelectedRole] = useState<AppRole>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSelectRole = (role: AppRole) => {
    setSelectedRole(role);
    setMode('login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await login(email, password);
    if (error) {
      if (error === 'NO_ACTIVE_PLAN') {
        setShowPlanDialog(true);
      } else {
        toast.error(error);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SEO
        title="Login to InstiFlow - Institute Dashboard"
        description="Access your InstiFlow dashboard to manage your institute's students, teachers, fees, and attendance."
      />

      {/* ─── Left Panel ─── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden items-center justify-center p-12">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-secondary" />

        {/* Animated circles */}
        <div className="absolute inset-0">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ rotate: 360 }}
              transition={{ duration: 25 + i * 8, repeat: Infinity, ease: 'linear' }}
              className="absolute rounded-full border border-primary-foreground/10"
              style={{
                width: `${200 + i * 130}px`,
                height: `${200 + i * 130}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-primary-foreground/10"
              style={{
                width: Math.random() * 6 + 3,
                height: Math.random() * 6 + 3,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -40 - Math.random() * 30, 0],
                opacity: [0.15, 0.4, 0.15],
              }}
              transition={{
                duration: 4 + Math.random() * 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 3,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-sm">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-2xl bg-primary-foreground/15 backdrop-blur-sm mx-auto mb-8 flex items-center justify-center shadow-2xl"
          >
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <GraduationCap className="w-10 h-10 text-primary-foreground" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-4xl font-display font-bold text-primary-foreground mb-4"
          >
            InstiFlow
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-primary-foreground/70 text-lg mb-10"
          >
            Streamline your institute operations with intelligent management tools
          </motion.p>

          {/* Feature list */}
          <div className="space-y-3 text-left">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-primary-foreground/80 text-sm"
              >
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                {f}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 pt-6 border-t border-primary-foreground/10"
          >
            <p className="text-primary-foreground/50 text-xs">Trusted by 500+ institutes across India</p>
          </motion.div>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
        {/* Subtle background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-20 w-56 h-56 bg-secondary/5 rounded-full blur-[80px]" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-foreground">InstiFlow</h1>
          </div>

          <AnimatePresence mode="wait">
            {mode === 'select' ? (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="text-3xl font-display font-bold text-foreground mb-2">Welcome back</h2>
                <p className="text-muted-foreground mb-8">Select your role to continue</p>

                <div className="space-y-3">
                  {roles.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.role}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 * i }}
                        whileHover={{ y: -3, scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelectRole(item.role)}
                        className="w-full flex items-center gap-4 p-5 rounded-2xl border border-border bg-card/80 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group text-left"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                          <Icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </motion.button>
                    );
                  })}
                </div>

                <div className="mt-8 pt-6 border-t border-border">
                  <p className="text-center text-sm text-muted-foreground">
                    New institute?{' '}
                    <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">Register here</Link>
                  </p>
                  <p className="text-center text-xs text-muted-foreground mt-3">
                    <Link to="/admin/login" className="hover:text-foreground transition-colors">Admin Login →</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.button
                  whileHover={{ x: -3 }}
                  onClick={() => setMode('select')}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to role selection
                </motion.button>

                <h2 className="text-3xl font-display font-bold text-foreground mb-2">
                  Sign In as{' '}
                  <span className={`text-transparent bg-clip-text bg-gradient-to-r ${selectedRole === 'owner' ? 'from-primary to-primary/70' : 'from-secondary to-secondary/70'}`}>
                    {selectedRole === 'owner' ? 'Owner' : 'Teacher'}
                  </span>
                </h2>
                <p className="text-muted-foreground mb-8">Enter your credentials to access your dashboard</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                        className="w-full pl-11 pr-12 py-3 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className={`w-full py-3 rounded-xl font-semibold text-sm text-primary-foreground flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 bg-gradient-to-r ${
                      selectedRole === 'owner' ? 'from-primary to-primary/80 shadow-primary/20 hover:shadow-xl hover:shadow-primary/25' : 'from-secondary to-secondary/80 shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/25'
                    }`}
                  >
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader2 className="w-4 h-4" />
                      </motion.div>
                    ) : null}
                    {isLoading ? 'Signing in...' : 'Sign In'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>

                  <p className="text-center text-sm text-muted-foreground mt-6">
                    New institute?{' '}
                    <Link to="/register" className="text-primary hover:text-primary/80 font-semibold transition-colors">Register here</Link>
                  </p>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* No Active Plan Dialog */}
      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3"
            >
              <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <AlertTriangle className="w-7 h-7 text-destructive" />
              </motion.div>
            </motion.div>
            <DialogTitle className="text-center text-lg">No Active Plan Found</DialogTitle>
            <DialogDescription className="text-center">
              Your institute does not have an active subscription plan. Please renew your subscription to continue using the platform.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowPlanDialog(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow"
            >
              Renew Plan
            </motion.button>
            <a
              href="mailto:support@instiflow.ai"
              className="w-full py-3 rounded-xl border border-border bg-card text-foreground font-medium text-sm hover:bg-muted transition-colors text-center"
            >
              Contact Support
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
