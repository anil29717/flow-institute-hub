import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { GraduationCap, Shield, BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

type AppRole = 'owner' | 'teacher';
type Mode = 'select' | 'login' | 'signup';

const roles: { role: AppRole; label: string; description: string; icon: typeof Shield }[] = [
  { role: 'owner', label: 'Institute Owner', description: 'Full access to manage teachers, courses, finances and reports', icon: Shield },
  { role: 'teacher', label: 'Teacher', description: 'Manage classes, mark attendance, enter grades', icon: BookOpen },
];

export default function LoginPage() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<Mode>('select');
  const [selectedRole, setSelectedRole] = useState<AppRole>('owner');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const handleSelectRole = (role: AppRole) => {
    setSelectedRole(role);
    setMode('login');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignup) {
      const { error } = await signup(email, password, firstName, lastName, selectedRole);
      if (error) {
        toast.error(error);
      } else {
        toast.success('Account created! Please check your email to verify your account.');
        setIsSignup(false);
      }
    } else {
      const { error } = await login(email, password);
      if (error) {
        toast.error(error);
      }
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 stat-gradient-1 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-primary-foreground/20"
              style={{ width: `${200 + i * 120}px`, height: `${200 + i * 120}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-2xl bg-accent mx-auto mb-6 flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-accent-foreground" />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-4xl font-display font-bold text-primary-foreground mb-4">
            InstiFlow CRM
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-primary-foreground/70 text-lg max-w-sm mx-auto">
            Streamline your institute operations with intelligent management tools
          </motion.p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">InstiFlow</h1>
          </div>

          {mode === 'select' ? (
            <>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">Welcome</h2>
              <p className="text-muted-foreground mb-8">Select your role to continue</p>
              <div className="space-y-3">
                {roles.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <motion.button key={item.role} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 * i }}
                      onClick={() => handleSelectRole(item.role)}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent hover:shadow-lg transition-all duration-300 group text-left">
                      <div className="w-12 h-12 rounded-lg bg-muted group-hover:bg-accent/10 flex items-center justify-center transition-colors">
                        <Icon className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{item.label}</p>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <button onClick={() => { setMode('select'); setIsSignup(false); }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to role selection
              </button>
              <h2 className="text-2xl font-display font-bold text-foreground mb-2">
                {isSignup ? 'Create Account' : 'Sign In'} — {selectedRole === 'owner' ? 'Owner' : 'Teacher'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {isSignup ? 'Fill in your details to get started' : 'Enter your credentials to continue'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">First Name</label>
                      <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1 block">Last Name</label>
                      <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1 block">Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" minLength={6}
                    className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <button type="submit" disabled={isLoading}
                  className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSignup ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <p className="text-sm text-muted-foreground mt-6 text-center">
                {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button onClick={() => setIsSignup(!isSignup)} className="text-accent font-medium hover:underline">
                  {isSignup ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
