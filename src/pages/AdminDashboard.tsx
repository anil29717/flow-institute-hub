import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Building2, Users, Plus, Loader2, X, Search, CheckCircle, CreditCard, History, Key, ArrowUpRight, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [historyInstId, setHistoryInstId] = useState<string | null>(null);
  const [assignModal, setAssignModal] = useState<any>(null);
  const [resetPassInst, setResetPassInst] = useState<any>(null);

  const { data: institutes, isLoading: loadingInstitutes } = useQuery({
    queryKey: ['admin_institutes'],
    queryFn: () => api.get('/admin/institutes'),
  });

  const { data: plans } = useQuery({
    queryKey: ['admin_plans'],
    queryFn: () => api.get('/admin/plans'),
  });

  // Fetch usage counts for all institutes
  const { data: usageCounts } = useQuery({
    queryKey: ['admin_institute_usage'],
    queryFn: () => api.get('/admin/institutes/usage'),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: () => api.get('/admin/stats'),
  });

  const filtered = (institutes ?? []).filter((i: any) =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Institutes', value: stats?.totalInstitutes ?? 0, icon: Building2, color: 'stat-gradient-1', trend: 'Active' },
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: Users, color: 'stat-gradient-2', trend: 'Across all' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage all institutes, plans, and users</p>
        </motion.div>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-medium text-sm hover:shadow-lg hover:shadow-primary/20 transition-shadow"
        >
          <Plus className="w-4 h-4" /> Add Institute
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label}
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`${stat.color} rounded-xl p-5 text-primary-foreground cursor-default relative overflow-hidden group`}
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium bg-white/15 px-2 py-0.5 rounded-full">{stat.trend}</span>
                </div>
                <p className="text-3xl font-display font-bold mt-3">{stat.value}</p>
                <p className="text-sm opacity-80">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search institutes..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-input bg-card/80 backdrop-blur-sm text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all" />
      </div>

      {/* Institutes List */}
      {loadingInstitutes ? (
        <div className="flex items-center justify-center h-32">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
            <Loader2 className="w-8 h-8 text-primary" />
          </motion.div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-40" />
          </motion.div>
          <p className="text-lg font-medium">No institutes found</p>
          <p className="text-sm mt-1">Create your first institute to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((inst: any, i: number) => {
            const plan = inst.planId;
            const usage = usageCounts?.find((u: any) => u.instituteId === inst._id) || { students: 0, teachers: 0 };
            const studentCount = usage.students;
            const teacherCount = usage.teachers;
            const isExpired = inst.planExpiresAt ? new Date(inst.planExpiresAt) < new Date() : false;

            return (
              <motion.div key={inst._id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 hover:shadow-xl hover:border-primary/15 transition-all duration-300 cursor-default group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {inst.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{inst.name}</p>
                      <p className="text-xs text-muted-foreground">{inst.code}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {inst.isApproved ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success">
                        <CheckCircle className="w-3 h-3" /> Approved
                      </span>
                    ) : (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await api.put(`/admin/institutes/${inst._id}/approve`, { isApproved: true });
                              toast.success(`${inst.name} approved`);
                              qc.invalidateQueries({ queryKey: ['admin_institutes'] });
                            } catch (err: any) {
                              toast.error(err.message);
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success hover:bg-success/20 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning">
                          Pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {inst.address && <p className="text-sm text-muted-foreground mb-2">{inst.address}</p>}
                {inst.email && <p className="text-xs text-muted-foreground mb-1">📧 {inst.email}</p>}
                {inst.phone && <p className="text-xs text-muted-foreground">📞 {inst.phone}</p>}

                {/* Usage Stats */}
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 gap-2">
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Students</p>
                    <p className="text-sm font-bold text-foreground">
                      {studentCount}{plan ? `/${plan.maxStudents}` : ''}
                    </p>
                    {plan && (
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${studentCount >= plan.maxStudents ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (studentCount / plan.maxStudents) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                  <div className="bg-muted/50 rounded-lg p-2 text-center">
                    <p className="text-xs text-muted-foreground">Teachers</p>
                    <p className="text-sm font-bold text-foreground">
                      {teacherCount}{plan ? `/${plan.maxTeachers}` : ''}
                    </p>
                    {plan && (
                      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${teacherCount >= plan.maxTeachers ? 'bg-destructive' : 'bg-primary'}`}
                          style={{ width: `${Math.min(100, (teacherCount / plan.maxTeachers) * 100)}%` }} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Plan Assignment */}
                <div className="mt-2 pt-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs font-medium text-foreground flex-1">
                      {plan ? plan.name : 'No Plan'}
                      {isExpired && <span className="text-destructive ml-1">(Expired)</span>}
                    </span>
                    <button onClick={() => setAssignModal(inst)}
                      className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      Change
                    </button>
                    <button onClick={() => setResetPassInst(inst)} title="Reset Owner Password"
                      className="text-xs px-2 py-1 rounded bg-warning/10 text-warning hover:bg-warning/20 transition-colors">
                      <Key className="w-3 h-3" />
                    </button>
                    <button onClick={() => setHistoryInstId(inst._id)} title="Plan History"
                      className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                      <History className="w-3 h-3" />
                    </button>
                  </div>
                  {inst.planExpiresAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Expires: {new Date(inst.planExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                  Created {new Date(inst.createdAt).toLocaleDateString()}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && <AddInstituteModal onClose={() => setShowForm(false)} />}
        {assignModal && <AssignPlanModal institute={assignModal} plans={plans ?? []} onClose={() => setAssignModal(null)} />}
        {historyInstId && <PlanHistoryModal instituteId={historyInstId} onClose={() => setHistoryInstId(null)} />}
        {resetPassInst && <ResetPasswordModal institute={resetPassInst} onClose={() => setResetPassInst(null)} />}
      </AnimatePresence>
    </div>
  );
}

/* ── Assign Plan Modal with payment tracking ── */
function AssignPlanModal({ institute, plans, onClose }: { institute: any; plans: any[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    planId: institute.planId?._id || '',
    amountPaid: '',
    paymentMode: 'cash',
    notes: '',
  });

  const selectedPlan = plans.find(p => p._id === form.planId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/admin/institutes/${institute._id}/plan`, {
        planId: form.planId || null,
        amountPaid: parseFloat(form.amountPaid) || 0,
        paymentMode: form.paymentMode,
        notes: form.notes || null,
      });

      toast.success('Plan updated');
      qc.invalidateQueries({ queryKey: ['admin_institutes'] });
      qc.invalidateQueries({ queryKey: ['admin_institute_usage'] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Assign Plan</h2>
            <p className="text-sm text-muted-foreground">{institute.name}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Plan</label>
            <select value={form.planId} onChange={e => setForm(p => ({ ...p, planId: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="">No Plan</option>
              {plans.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price} ({p.maxDays} days)</option>)}
            </select>
          </div>

          {selectedPlan && (
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground space-y-1">
              <p>Max Students: <strong className="text-foreground">{selectedPlan.maxStudents}</strong></p>
              <p>Max Teachers: <strong className="text-foreground">{selectedPlan.maxTeachers}</strong></p>
              <p>Validity: <strong className="text-foreground">{selectedPlan.maxDays} days</strong></p>
              <p>Price: <strong className="text-foreground">₹{selectedPlan.price}</strong></p>
            </div>
          )}

          <FormField label="Amount Paid (₹)" type="number" value={form.amountPaid} onChange={e => setForm(p => ({ ...p, amountPaid: e.target.value }))} placeholder="0" />

          <div>
            <label className="text-sm font-medium text-foreground mb-1 block">Payment Mode</label>
            <select value={form.paymentMode} onChange={e => setForm(p => ({ ...p, paymentMode: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="cash">Cash</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </div>

          <FormField label="Notes" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes" />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Update Plan
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── Plan History Modal ── */
function PlanHistoryModal({ instituteId, onClose }: { instituteId: string; onClose: () => void }) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['plan_history', instituteId],
    queryFn: () => api.get(`/admin/institutes/${instituteId}/plan-history`),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2"><History className="w-5 h-5" /> Plan History</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : !history?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No plan changes recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h: any) => (
              <div key={h._id} className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-foreground">{h.planName}</span>
                  <span className="text-xs text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Paid</span>
                    <p className="font-medium text-foreground">₹{Number(h.amountPaid).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mode</span>
                    <p className="font-medium text-foreground capitalize">{h.paymentMode?.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires</span>
                    <p className="font-medium text-foreground">{h.expiresAt ? new Date(h.expiresAt).toLocaleDateString() : '—'}</p>
                  </div>
                </div>
                {h.notes && <p className="text-xs text-muted-foreground mt-2 italic">{h.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Add Institute Modal ── */
function AddInstituteModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    instituteName: '', address: '', phone: '', instituteEmail: '',
    ownerEmail: '', ownerPassword: '', ownerFirstName: '', ownerLastName: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/admin/institutes', form);
      toast.success(`Institute "${form.instituteName}" created! Owner can login with ${form.ownerEmail}`);
      qc.invalidateQueries({ queryKey: ['admin_institutes'] });
      qc.invalidateQueries({ queryKey: ['admin_stats'] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">Add New Institute</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Institute Details</p>
          <div className="grid grid-cols-1 mb-3">
            <FormField label="Institute Name" value={form.instituteName} onChange={set('instituteName')} required />
          </div>
          <FormField label="Address" value={form.address} onChange={set('address')} placeholder="Optional" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Institute Email" type="email" value={form.instituteEmail} onChange={set('instituteEmail')} placeholder="Optional" />
            <FormField label="Institute Phone" value={form.phone} onChange={set('phone')} placeholder="Optional" />
          </div>
          <p className="text-sm font-medium text-muted-foreground border-b border-border pb-2 pt-2">Owner Account</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" value={form.ownerFirstName} onChange={set('ownerFirstName')} required />
            <FormField label="Last Name" value={form.ownerLastName} onChange={set('ownerLastName')} required />
          </div>
          <FormField label="Owner Email" type="email" value={form.ownerEmail} onChange={set('ownerEmail')} required />
          <FormField label="Owner Password" type="password" value={form.ownerPassword} onChange={set('ownerPassword')} required minLength={6} placeholder="Min 6 characters" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Create Institute
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ── Reset Password Modal ── */
function ResetPasswordModal({ institute, onClose }: { institute: any; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Passwords do not match");
    }
    if (form.newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setLoading(true);
    try {
      await api.put(`/admin/institutes/${institute._id}/reset-password`, {
        newPassword: form.newPassword
      });
      toast.success(`Password for ${institute.name} updated successfully!`);
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-display font-bold text-foreground">Reset Owner Password</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Are you sure you want to force an update on the primary Owner password for <strong>{institute.name}</strong>?
          </p>
          <FormField label="New Password" type="text" value={form.newPassword} onChange={set('newPassword')} required minLength={6} placeholder="Min 6 characters" />
          <FormField label="Confirm Password" type="text" value={form.confirmPassword} onChange={set('confirmPassword')} required minLength={6} placeholder="Re-enter password" />

          <div className="flex gap-3 pt-4 border-t border-border">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-warning text-warning-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Reset Password
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <input {...props}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}

