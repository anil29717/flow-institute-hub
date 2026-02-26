import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeachers } from '@/hooks/useSupabaseData';
import { Search, Plus, Mail, Phone, Loader2, X, IndianRupee, CalendarIcon, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const { data: teachers, isLoading } = useTeachers();
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [showForm, setShowForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const filtered = (teachers ?? []).filter(t => {
    const p = (t as any).profiles;
    if (!p) return false;
    return `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const salaryLabel = (t: any) => {
    if (!t.salary_amount) return null;
    const typeMap: Record<string, string> = { per_hour: '/hr', per_day: '/day', per_month: '/mo' };
    return `₹${Number(t.salary_amount).toLocaleString()}${typeMap[t.salary_type] || '/mo'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground">Manage your teaching staff</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Add Teacher
          </button>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No teachers found</p>
          <p className="text-sm mt-1">Add your first teacher to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher, i) => {
            const p = (teacher as any).profiles;
            const sal = salaryLabel(teacher);
            return (
              <motion.div key={teacher.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTeacher(teacher)}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {p?.first_name?.[0]}{p?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{p?.first_name} {p?.last_name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.employee_id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${p?.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {p?.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-1">{teacher.qualification || 'No qualification listed'}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(teacher.specialization ?? []).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 text-xs rounded-md bg-accent/10 text-accent font-medium">{s}</span>
                  ))}
                </div>

                {sal && (
                  <div className="flex items-center gap-1.5 text-sm font-medium text-secondary mb-3">
                    <IndianRupee className="w-3.5 h-3.5" /> {sal}
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {p?.email}</span>
                </div>
                {p?.phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Phone className="w-3.5 h-3.5" /> {p.phone}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                  <span>{teacher.experience_years ?? 0} yrs experience</span>
                  <span>Joined {teacher.join_date}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showForm && <AddTeacherModal onClose={() => setShowForm(false)} />}
        {selectedTeacher && <TeacherDetailModal teacher={selectedTeacher} onClose={() => setSelectedTeacher(null)} />}
      </AnimatePresence>
    </div>
  );
}

function TeacherDetailModal({ teacher, onClose }: { teacher: any; onClose: () => void }) {
  const p = teacher.profiles;
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['teacher_attendance_history', teacher.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teacher_attendance')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const presentCount = attendance?.filter(a => a.status === 'present').length ?? 0;
  const absentCount = attendance?.filter(a => a.status === 'absent').length ?? 0;
  const lateCount = attendance?.filter(a => a.status === 'late').length ?? 0;

  const salaryTypeLabel: Record<string, string> = { per_hour: 'Per Hour', per_day: 'Per Day', per_month: 'Per Month' };
  const freqLabel: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', custom: 'Custom' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-foreground">Teacher Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
            {p?.first_name?.[0]}{p?.last_name?.[0]}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{p?.first_name} {p?.last_name}</p>
            <p className="text-sm text-muted-foreground">{teacher.employee_id} · {teacher.qualification || 'N/A'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <InfoItem label="Email" value={p?.email} />
          <InfoItem label="Phone" value={p?.phone || '—'} />
          <InfoItem label="Experience" value={`${teacher.experience_years ?? 0} years`} />
          <InfoItem label="Joined" value={teacher.join_date} />
        </div>

        {/* Salary Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-5">
          <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Salary</h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><span className="text-muted-foreground text-xs">Amount</span><p className="font-medium text-foreground">₹{Number(teacher.salary_amount || 0).toLocaleString()}</p></div>
            <div><span className="text-muted-foreground text-xs">Type</span><p className="font-medium text-foreground">{salaryTypeLabel[teacher.salary_type] || 'Per Month'}</p></div>
            <div><span className="text-muted-foreground text-xs">Payment</span><p className="font-medium text-foreground">{freqLabel[teacher.payment_frequency] || 'Monthly'}</p></div>
          </div>
        </div>

        {/* Attendance */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Attendance (Last 30 records)</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-success/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-success">{presentCount}</p><p className="text-xs text-muted-foreground">Present</p></div>
            <div className="bg-destructive/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-destructive">{absentCount}</p><p className="text-xs text-muted-foreground">Absent</p></div>
            <div className="bg-warning/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-warning">{lateCount}</p><p className="text-xs text-muted-foreground">Late</p></div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (attendance?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">No attendance records yet.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {attendance?.map(a => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 text-sm">
                  <span className="text-foreground">{a.date}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    a.status === 'present' ? 'bg-success/10 text-success' :
                    a.status === 'absent' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  );
}

function AddTeacherModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', phone: '',
    qualification: '', specialization: '', experienceYears: '',
    salaryAmount: '', salaryType: 'per_month', paymentFrequency: 'monthly',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await supabase.functions.invoke('create-teacher', {
        body: {
          email: form.email,
          password: form.password,
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone || undefined,
          qualification: form.qualification || undefined,
          specialization: form.specialization ? form.specialization.split(',').map(s => s.trim()) : undefined,
          experienceYears: form.experienceYears ? parseInt(form.experienceYears) : 0,
          salaryAmount: form.salaryAmount ? parseFloat(form.salaryAmount) : 0,
          salaryType: form.salaryType,
          paymentFrequency: form.paymentFrequency,
        },
      });

      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      toast.success(`Teacher account created! They can login with ${form.email}`);
      qc.invalidateQueries({ queryKey: ['teachers'] });
      qc.invalidateQueries({ queryKey: ['dashboard_stats'] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create teacher');
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
          <h2 className="text-xl font-display font-bold text-foreground">Add New Teacher</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First Name" value={form.firstName} onChange={set('firstName')} required />
            <Field label="Last Name" value={form.lastName} onChange={set('lastName')} required />
          </div>
          <Field label="Email" type="email" value={form.email} onChange={set('email')} required />
          <Field label="Password" type="password" value={form.password} onChange={set('password')} required minLength={6} placeholder="Min 6 characters" />
          <Field label="Phone" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
          <Field label="Qualification" value={form.qualification} onChange={set('qualification')} placeholder="e.g. M.Tech, IIT Delhi" />
          <Field label="Specialization" value={form.specialization} onChange={set('specialization')} placeholder="Comma-separated" />
          <Field label="Experience (years)" type="number" value={form.experienceYears} onChange={set('experienceYears')} placeholder="0" />

          <div className="border-t border-border pt-4">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Salary Details</p>
            <Field label="Salary Amount (₹)" type="number" value={form.salaryAmount} onChange={set('salaryAmount')} placeholder="e.g. 25000" />
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Salary Type</label>
                <Select value={form.salaryType} onValueChange={v => setForm(p => ({ ...p, salaryType: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="per_hour">Per Hour</SelectItem>
                    <SelectItem value="per_day">Per Day</SelectItem>
                    <SelectItem value="per_month">Per Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1 block">Payment Frequency</label>
                <Select value={form.paymentFrequency} onValueChange={v => setForm(p => ({ ...p, paymentFrequency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="custom">Custom / Anytime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Teacher
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <input {...props}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
