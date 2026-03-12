import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Loader2, ArrowLeft, Building2, CheckCircle, User, Mail, Phone, Lock, MapPin, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/api/client';
import { SEO } from "@/components/seo/SEO";

const benefits = [
  'Manage unlimited students & teachers',
  'Automated fee tracking & receipts',
  'Smart attendance & analytics',
  'Dedicated support & setup help',
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    confirmPassword: '',
    instituteName: '',
    instituteEmail: '',
    phone: '',
    address: '',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const canGoStep2 = form.ownerFirstName && form.ownerLastName && form.ownerEmail && form.ownerPassword && form.confirmPassword && form.ownerPassword.length >= 6 && form.ownerPassword === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.ownerPassword !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.ownerPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!form.instituteName.trim()) {
      toast.error('Institute name is required');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/register-owner', {
        instituteName: form.instituteName.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        instituteEmail: form.instituteEmail.trim(),
        ownerEmail: form.ownerEmail.trim(),
        ownerPassword: form.ownerPassword,
        ownerFirstName: form.ownerFirstName.trim(),
        ownerLastName: form.ownerLastName.trim(),
        ownerPhone: form.ownerPhone.trim(),
      });

      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Success Screen ───
  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-success/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-primary/5 rounded-full blur-[80px]" />
        </div>
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          className="bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-2xl relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
            className="w-20 h-20 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-5"
          >
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <CheckCircle className="w-10 h-10 text-success" />
            </motion.div>
          </motion.div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Registration Submitted!</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Your institute registration is pending admin approval. You'll receive a notification once your account is approved.
          </p>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-shadow"
          >
            Go to Login <ArrowRight className="w-4 h-4 inline ml-1" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <SEO
        title="Register Your Institute - InstiFlow"
        description="Join 500+ institutes across India that trust InstiFlow. Register your coaching center or academy to start your free demo."
      />

      {/* ─── Left Panel ─── */}
      <div className="hidden lg:flex lg:w-[42%] relative overflow-hidden items-center justify-center p-12">
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
                width: `${180 + i * 120}px`,
                height: `${180 + i * 120}px`,
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(10)].map((_, i) => (
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
                y: [0, -35 - Math.random() * 25, 0],
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
              <Building2 className="w-10 h-10 text-primary-foreground" />
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-display font-bold text-primary-foreground mb-4"
          >
            Register Your Institute
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-primary-foreground/70 text-base mb-10"
          >
            Join InstiFlow and streamline your institute management
          </motion.p>

          <div className="space-y-3 text-left">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-primary-foreground/80 text-sm"
              >
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                {b}
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 pt-6 border-t border-primary-foreground/10"
          >
            <p className="text-primary-foreground/50 text-xs">Free setup · No credit card required</p>
          </motion.div>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-6 lg:p-10 overflow-y-auto relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 left-20 w-56 h-56 bg-secondary/5 rounded-full blur-[80px]" />
        </div>

        <div className="w-full max-w-lg relative z-10 py-6">
          {/* Back link */}
          <motion.div whileHover={{ x: -3 }}>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
          </motion.div>

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.1 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20"
            >
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-foreground">InstiFlow</h1>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-display font-bold text-foreground mb-1">Create Your Account</h2>
            <p className="text-muted-foreground mb-6 text-sm">Fill in your details to register. Admin will approve your account.</p>
          </motion.div>

          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <motion.div
                  animate={{ scale: step === s ? 1.1 : 1 }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    step >= s
                      ? 'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > s ? <CheckCircle className="w-4 h-4" /> : s}
                </motion.div>
                <span className={`text-xs font-medium transition-colors ${step >= s ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s === 1 ? 'Owner Details' : 'Institute Details'}
                </span>
                {s === 1 && <div className={`flex-1 h-0.5 rounded-full ml-2 transition-colors ${step >= 2 ? 'bg-primary' : 'bg-muted'}`} />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">First Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={form.ownerFirstName} onChange={update('ownerFirstName')} required placeholder="John"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Last Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={form.ownerLastName} onChange={update('ownerLastName')} required placeholder="Doe"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="email" value={form.ownerEmail} onChange={update('ownerEmail')} required placeholder="john@example.com"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={form.ownerPhone} onChange={update('ownerPhone')} placeholder="+91 9876543210"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type={showPass ? 'text' : 'password'} value={form.ownerPassword} onChange={update('ownerPassword')} required minLength={6} placeholder="Min 6 chars"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Confirm Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')} required minLength={6} placeholder="Re-enter"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {form.ownerPassword && form.confirmPassword && form.ownerPassword !== form.confirmPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-destructive">
                      Passwords do not match
                    </motion.p>
                  )}

                  <motion.button
                    type="button"
                    disabled={!canGoStep2}
                    whileHover={canGoStep2 ? { scale: 1.01, y: -1 } : {}}
                    whileTap={canGoStep2 ? { scale: 0.99 } : {}}
                    onClick={() => setStep(2)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    Continue to Institute Details <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <motion.button
                    type="button"
                    whileHover={{ x: -3 }}
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Owner Details
                  </motion.button>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Institute Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input value={form.instituteName} onChange={update('instituteName')} required placeholder="Excel Academy"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Institute Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="email" value={form.instituteEmail} onChange={update('instituteEmail')} placeholder="info@academy.com"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground">Institute Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input value={form.phone} onChange={update('phone')} placeholder="+91 1234567890"
                          className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input value={form.address} onChange={update('address')} placeholder="Full address"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all" />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground font-semibold text-sm shadow-lg shadow-secondary/20 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                        <Loader2 className="w-4 h-4" />
                      </motion.div>
                    ) : null}
                    {isLoading ? 'Registering...' : 'Register Institute'}
                    {!isLoading && <ArrowRight className="w-4 h-4" />}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
