import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/crm';
import { motion } from 'framer-motion';
import { GraduationCap, Shield, BookOpen, Users } from 'lucide-react';

const roles: { role: UserRole; label: string; description: string; icon: typeof Shield }[] = [
  { role: 'owner', label: 'Institute Owner', description: 'Full access to manage teachers, students, finances and reports', icon: Shield },
  { role: 'teacher', label: 'Teacher', description: 'Manage classes, mark attendance, enter grades', icon: BookOpen },
  { role: 'student', label: 'Student', description: 'View courses, attendance, grades and pay fees', icon: Users },
];

export default function LoginPage() {
  const { login } = useAuth();

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
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-20 h-20 rounded-2xl bg-accent mx-auto mb-6 flex items-center justify-center"
          >
            <GraduationCap className="w-10 h-10 text-accent-foreground" />
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-display font-bold text-primary-foreground mb-4"
          >
            InstiFlow CRM
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-primary-foreground/70 text-lg max-w-sm mx-auto"
          >
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
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground mb-8">Select your role to continue</p>

          <div className="space-y-3">
            {roles.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.role}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 * i }}
                  onClick={() => login(item.role)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent hover:shadow-lg transition-all duration-300 group text-left"
                >
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

          <p className="text-xs text-muted-foreground mt-8 text-center">
            Demo mode — select any role to explore the CRM
          </p>
        </div>
      </div>
    </div>
  );
}
