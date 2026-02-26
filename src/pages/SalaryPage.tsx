import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeachers } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IndianRupee, Loader2, X, Search, Plus, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function useSalaryPayments() {
  return useQuery({
    queryKey: ['salary_payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salary_payments')
        .select('*, teachers(*, profiles(first_name, last_name))')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useAddSalaryPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: { teacher_id: string; amount: number; payment_mode: string; payment_date: string; period_label?: string; notes?: string }) => {
      const { data, error } = await supabase.from('salary_payments').insert(payment).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salary_payments'] });
      toast.success('Salary payment recorded');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export default function SalaryPage() {
  const { data: teachers, isLoading: teachersLoading } = useTeachers();
  const { data: payments, isLoading: paymentsLoading } = useSalaryPayments();
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showPayForm, setShowPayForm] = useState(false);
  const [search, setSearch] = useState('');

  const isLoading = teachersLoading || paymentsLoading;

  const totalPaid = useMemo(() => {
    return (payments ?? []).reduce((s, p) => s + Number(p.amount), 0);
  }, [payments]);

  const teacherList = useMemo(() => {
    return (teachers ?? []).filter(t => {
      const p = (t as any).profiles;
      if (!p) return false;
      return `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase());
    });
  }, [teachers, search]);

  const salaryTypeLabel: Record<string, string> = { per_hour: 'Per Hour', per_day: 'Per Day', per_month: 'Per Month' };
  const freqLabel: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', custom: 'Custom' };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Salary Management</h1>
          <p className="text-muted-foreground">Pay teachers and track payment history</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Teachers</p>
            <p className="text-xl font-display font-bold text-foreground">{teachers?.length ?? 0}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-success/10 text-success">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Paid</p>
            <p className="text-xl font-display font-bold text-foreground">₹{totalPaid.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning/10 text-warning">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Payments This Month</p>
            <p className="text-xl font-display font-bold text-foreground">
              {(payments ?? []).filter(p => {
                const d = new Date(p.payment_date);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </p>
          </div>
        </div>
      </div>

      {/* Teacher list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3">
          <h3 className="font-display font-semibold text-foreground">Teachers</h3>
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Salary</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Frequency</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {teacherList.map((teacher, i) => {
                const p = (teacher as any).profiles;
                const teacherPayments = (payments ?? []).filter(pay => pay.teacher_id === teacher.id);
                const totalTeacherPaid = teacherPayments.reduce((s: number, pay: any) => s + Number(pay.amount), 0);
                return (
                  <motion.tr key={teacher.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {p?.first_name?.[0]}{p?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{p?.first_name} {p?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">₹{Number(teacher.salary_amount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{salaryTypeLabel[teacher.salary_type] || 'Per Month'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{freqLabel[teacher.payment_frequency] || 'Monthly'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedTeacher(teacher); setShowPayForm(true); }}
                          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                          Pay
                        </button>
                        <button onClick={() => setSelectedTeacher(teacher)}
                          className="px-3 py-1.5 rounded-md border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors">
                          History
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">Recent Payments</h3>
        </div>
        {(payments ?? []).length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No salary payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mode</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Period</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {(payments ?? []).slice(0, 20).map((p: any) => {
                  const prof = p.teachers?.profiles;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{prof?.first_name} {prof?.last_name}</td>
                      <td className="px-4 py-3 text-success font-medium">₹{Number(p.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{p.payment_mode.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.period_label || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.payment_date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTeacher && showPayForm && (
          <PaySalaryModal teacher={selectedTeacher} onClose={() => { setSelectedTeacher(null); setShowPayForm(false); }} />
        )}
        {selectedTeacher && !showPayForm && (
          <PaymentHistoryModal teacher={selectedTeacher} payments={(payments ?? []).filter(p => p.teacher_id === selectedTeacher.id)} onClose={() => setSelectedTeacher(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function PaySalaryModal({ teacher, onClose }: { teacher: any; onClose: () => void }) {
  const addPayment = useAddSalaryPayment();
  const p = teacher.profiles;
  const [form, setForm] = useState({
    amount: String(teacher.salary_amount || ''),
    payment_mode: 'bank_transfer',
    payment_date: new Date().toISOString().split('T')[0],
    period_label: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    addPayment.mutate(
      { teacher_id: teacher.id, amount, payment_mode: form.payment_mode, payment_date: form.payment_date, period_label: form.period_label || undefined, notes: form.notes || undefined },
      { onSuccess: onClose }
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Pay Salary</h2>
            <p className="text-sm text-muted-foreground">{p?.first_name} {p?.last_name} · {teacher.employee_id}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Amount (₹) *</label>
            <input type="number" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Payment Mode</label>
              <Select value={form.payment_mode} onValueChange={v => setForm(f => ({ ...f, payment_mode: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Date</label>
              <input type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Period (e.g. "Feb 2026")</label>
            <input value={form.period_label} onChange={e => setForm(f => ({ ...f, period_label: e.target.value }))} placeholder="Optional"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Notes</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={addPayment.isPending}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {addPayment.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Record Payment
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function PaymentHistoryModal({ teacher, payments, onClose }: { teacher: any; payments: any[]; onClose: () => void }) {
  const p = teacher.profiles;
  const totalPaid = payments.reduce((s, pay) => s + Number(pay.amount), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Payment History</h2>
            <p className="text-sm text-muted-foreground">{p?.first_name} {p?.last_name} · Total Paid: <span className="text-success font-medium">₹{totalPaid.toLocaleString()}</span></p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map(pay => (
              <div key={pay.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">₹{Number(pay.amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{pay.payment_date} · <span className="capitalize">{pay.payment_mode.replace('_', ' ')}</span>{pay.period_label ? ` · ${pay.period_label}` : ''}</p>
                </div>
                {pay.notes && <p className="text-xs text-muted-foreground max-w-[120px] truncate">{pay.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
