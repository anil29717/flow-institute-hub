import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useInstituteDetails, useUpdateInstitute } from '@/hooks/useApiData';
import { api } from '@/api/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { User, Lock, Save, Loader2, ShieldCheck, Building2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { user } = useAuth();
  const { data: planLimits } = usePlanLimits();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  // Institute specific state
  const { data: institute, isLoading: instLoading } = useInstituteDetails(user?.instituteId ?? null);
  const { mutateAsync: updateInstitute } = useUpdateInstitute();

  const [instName, setInstName] = useState('');
  const [instEmail, setInstEmail] = useState('');
  const [instPhone, setInstPhone] = useState('');
  const [instAddress, setInstAddress] = useState('');
  const [savingInst, setSavingInst] = useState(false);

  useEffect(() => {
    if (institute) {
      setInstName(institute.name || '');
      setInstEmail(institute.email || '');
      setInstPhone(institute.phone || '');
      setInstAddress(institute.address || '');
    }
  }, [institute]);

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/me', { firstName, lastName });
      toast.success('Profile updated successfully');
      // Note: A context reload might be needed to reflect names globally
    } catch (e: any) {
      toast.error(e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setChangingPw(true);
    try {
      await api.put('/auth/me', { password: newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) {
      toast.error(e.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  const handleUpdateInstitute = async () => {
    setSavingInst(true);
    try {
      await updateInstitute({ name: instName, email: instEmail, phone: instPhone, address: instAddress });
    } finally {
      setSavingInst(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and account.</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Profile</TabsTrigger>
          <TabsTrigger value="password" className="gap-2"><Lock className="w-4 h-4" /> Password</TabsTrigger>
          {user?.role === 'owner' && (
            <TabsTrigger value="institute" className="gap-2"><Building2 className="w-4 h-4" /> Institute</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="profile">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {user?.role === 'admin' ? <ShieldCheck className="w-8 h-8" /> : user?.role === 'owner' ? <Building2 className="w-8 h-8" /> : <User className="w-8 h-8" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-foreground">{user?.firstName} {user?.lastName}</p>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">First Name</label>
                <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <Input value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input value={user?.email ?? ''} disabled className="opacity-60" />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Role</label>
              <Input value={user?.role === 'owner' ? 'Owner' : user?.role === 'teacher' ? 'Teacher' : 'Admin'} disabled className="opacity-60" />
            </div>

            {user?.role === 'owner' && planLimits?.hasPlan && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Current Plan</label>
                <div className="flex items-center gap-2 h-10 px-3 w-full rounded-md border border-input bg-transparent text-sm opacity-60">
                  <span>{planLimits.planName}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${planLimits.isExpired ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}`}>
                    {planLimits.isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
              </div>
            )}

            <Button onClick={handleUpdateProfile} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="password">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">New Password</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Enter new password" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirm New Password</label>
              <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
            </div>

            <Button onClick={handleChangePassword} disabled={changingPw} className="gap-2">
              {changingPw ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </Button>
          </motion.div>
        </TabsContent>

        {user?.role === 'owner' && (
          <TabsContent value="institute">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6 space-y-5">

              {instLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Institute Name *</label>
                      <Input value={instName} onChange={e => setInstName(e.target.value)} required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Institute Code</label>
                      <Input value={institute?.code || ''} disabled className="opacity-60" placeholder="Auto-generated" />
                      <p className="text-[10px] text-muted-foreground">Unique code to identify your institute.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Contact Email</label>
                      <Input value={instEmail} onChange={e => setInstEmail(e.target.value)} type="email" placeholder="Optional" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Phone Number</label>
                      <Input value={instPhone} onChange={e => setInstPhone(e.target.value)} placeholder="Optional" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground">Address</label>
                    <Input value={instAddress} onChange={e => setInstAddress(e.target.value)} placeholder="Optional" />
                  </div>

                  <Button onClick={handleUpdateInstitute} disabled={savingInst || !instName.trim()} className="gap-2">
                    {savingInst ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Institute Details
                  </Button>
                </>
              )}
            </motion.div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
