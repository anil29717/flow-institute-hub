import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import {
  IndianRupee,
  Search,
  Plus,
  ArrowUpRight,
  Loader2,
  Calendar,
  Users,
  History,
  X,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useTeachers } from '@/hooks/useApiData';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// --- Hooks ---
function useSalaryPayments() {
  return useQuery({
    queryKey: ['salary_payments'],
    queryFn: () => api.get('/salaries'),
  });
}

function useAddSalaryPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.post('/salaries', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salary_payments'] });
      toast.success('Salary payment recorded successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to record payment');
    }
  });
}

export default function SalaryPage() {
  const { user } = useAuth();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();
  const { data: payments, isLoading: paymentsLoading } = useSalaryPayments();
  const addPayment = useAddSalaryPayment();

  const [search, setSearch] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const isLoading = teachersLoading || paymentsLoading;

  const totalPaid = useMemo(() => {
    return (payments ?? []).reduce((s: number, p: any) => s + Number(p.amount), 0);
  }, [payments]);

  const teacherList = useMemo(() => {
    return (teachers ?? []).filter((t: any) => {
      return `${t.firstName} ${t.lastName}`.toLowerCase().includes(search.toLowerCase());
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
              {(payments ?? []).filter((p: any) => {
                const d = new Date(p.paymentDate);
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
              {teacherList.map((teacher: any, i: number) => {
                return (
                  <motion.tr key={teacher.id || teacher._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                          {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{teacher.firstName} {teacher.lastName}</p>
                          <p className="text-xs text-muted-foreground">{teacher.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">₹{Number(teacher.salaryAmount || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{salaryTypeLabel[teacher.salaryType] || 'Per Month'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{freqLabel[teacher.paymentFrequency] || 'Monthly'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedTeacher(teacher); setShowPayForm(true); }}
                          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity font-display">
                          Pay
                        </button>
                        <button onClick={() => setSelectedTeacher(teacher)}
                          className="px-3 py-1.5 rounded-md border border-border text-foreground text-xs font-medium hover:bg-muted transition-colors font-display">
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
                  const prof = p.teacherId?.userId;
                  return (
                    <tr key={p.id || p._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{prof?.firstName} {prof?.lastName}</td>
                      <td className="px-4 py-3 text-success font-medium">₹{Number(p.amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground capitalize">{p.paymentMode.replace('_', ' ')}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.month} {p.year}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(p.paymentDate).toLocaleDateString()}</td>
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
          <PaymentHistoryModal teacher={selectedTeacher} payments={(payments ?? []).filter((p: any) => p.teacherId?._id === (selectedTeacher.id || selectedTeacher._id))} onClose={() => setSelectedTeacher(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function PaySalaryModal({ teacher, onClose }: { teacher: any; onClose: () => void }) {
  const addPayment = useAddSalaryPayment();
  const [form, setForm] = useState({
    amount: String(teacher.salaryAmount || ''),
    paymentMode: 'bank_transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    month: new Date().toLocaleString('default', { month: 'long' }),
    year: String(new Date().getFullYear()),
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    addPayment.mutate(
      {
        teacherId: teacher.id || teacher._id,
        amount,
        paymentMode: form.paymentMode,
        paymentDate: form.paymentDate,
        month: form.month,
        year: parseInt(form.year),
        notes: form.notes || undefined
      },
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
            <p className="text-sm text-muted-foreground">{teacher.firstName} {teacher.lastName} · {teacher.employeeId}</p>
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
              <Select value={form.paymentMode} onValueChange={v => setForm(f => ({ ...f, paymentMode: v }))}>
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
              <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Month</label>
              <Select value={form.month} onValueChange={v => setForm(f => ({ ...f, month: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'
                  ].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Year</label>
              <input type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Notes</label>
            <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional"
              className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
          </div>
          <button type="submit" disabled={addPayment.isPending}
            className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 font-display">
            {addPayment.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Record Payment
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

function PaymentHistoryModal({ teacher, payments, onClose }: { teacher: any; payments: any[]; onClose: () => void }) {
  const totalPaid = payments.reduce((s, pay) => s + Number(pay.amount), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">Payment History</h2>
            <p className="text-sm text-muted-foreground">{teacher.firstName} {teacher.lastName} · Total Paid: <span className="text-success font-medium">₹{totalPaid.toLocaleString()}</span></p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {payments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No payments recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {payments.map((pay: any) => (
              <div key={pay.id || pay._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">₹{Number(pay.amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(pay.paymentDate).toLocaleDateString()} · <span className="capitalize">{pay.paymentMode.replace('_', ' ')}</span>{pay.month ? ` · ${pay.month} ${pay.year}` : ''}</p>
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
