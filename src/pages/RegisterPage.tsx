import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, Loader2, ArrowLeft, Building2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    ownerFirstName: '',
    ownerLastName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: '',
    confirmPassword: '',
    instituteName: '',
    code: '',
    instituteEmail: '',
    phone: '',
    address: '',
  });

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

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
    if (!form.instituteName.trim() || !form.code.trim()) {
      toast.error('Institute name and code are required');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('register-owner', {
        body: {
          instituteName: form.instituteName.trim(),
          code: form.code.trim().toUpperCase(),
          address: form.address.trim(),
          phone: form.phone.trim(),
          instituteEmail: form.instituteEmail.trim(),
          ownerEmail: form.ownerEmail.trim(),
          ownerPassword: form.ownerPassword,
          ownerFirstName: form.ownerFirstName.trim(),
          ownerLastName: form.ownerLastName.trim(),
          ownerPhone: form.ownerPhone.trim(),
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSuccess(true);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-card border border-border rounded-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-display font-bold text-foreground mb-2">Registration Submitted!</h2>
          <p className="text-muted-foreground mb-6">
            Your institute registration is pending admin approval. You'll be able to login once your account is approved.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">Go to Login</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-2/5 stat-gradient-1 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-primary-foreground/20"
              style={{ width: `${180 + i * 100}px`, height: `${180 + i * 100}px`, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />
          ))}
        </div>
        <div className="relative z-10 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 rounded-2xl bg-accent mx-auto mb-6 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-accent-foreground" />
          </motion.div>
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-3xl font-display font-bold text-primary-foreground mb-4">
            Register Your Institute
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-primary-foreground/70 text-base max-w-sm mx-auto">
            Join InstiFlow and streamline your institute management with powerful tools
          </motion.p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 overflow-y-auto">
        <div className="w-full max-w-lg">
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">InstiFlow</h1>
          </div>

          <h2 className="text-2xl font-display font-bold text-foreground mb-1">Create Your Account</h2>
          <p className="text-muted-foreground mb-6 text-sm">Fill in details to register. Admin will approve your account.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Owner Details */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">1</span>
                Owner Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">First Name *</Label>
                  <Input value={form.ownerFirstName} onChange={update('ownerFirstName')} required placeholder="John" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Last Name *</Label>
                  <Input value={form.ownerLastName} onChange={update('ownerLastName')} required placeholder="Doe" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Email *</Label>
                  <Input type="email" value={form.ownerEmail} onChange={update('ownerEmail')} required placeholder="john@example.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input value={form.ownerPhone} onChange={update('ownerPhone')} placeholder="+91 9876543210" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Password *</Label>
                  <Input type="password" value={form.ownerPassword} onChange={update('ownerPassword')} required minLength={6} placeholder="Min 6 characters" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Confirm Password *</Label>
                  <Input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} required minLength={6} placeholder="Re-enter password" />
                </div>
              </div>
            </div>

            {/* Institute Details */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">2</span>
                Institute Details
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Institute Name *</Label>
                  <Input value={form.instituteName} onChange={update('instituteName')} required placeholder="Excel Academy" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Institute Code *</Label>
                  <Input value={form.code} onChange={update('code')} required placeholder="EXL" maxLength={10} className="uppercase" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Institute Email</Label>
                  <Input type="email" value={form.instituteEmail} onChange={update('instituteEmail')} placeholder="info@academy.com" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Institute Phone</Label>
                  <Input value={form.phone} onChange={update('phone')} placeholder="+91 1234567890" />
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <Label className="text-xs">Address</Label>
                <Input value={form.address} onChange={update('address')} placeholder="Full address" />
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : 'Register Institute'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
