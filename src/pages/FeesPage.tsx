import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudents } from '@/hooks/useSupabaseData';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IndianRupee, TrendingUp, AlertTriangle, CheckCircle, Loader2, X, Clock, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

function useFeePayments() {
  return useQuery({
    queryKey: ['fee_payments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_payments')
        .select('*, students(first_name, last_name, student_id)')
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payment: { student_id: string; amount: number; payment_mode: string; payment_date: string; notes?: string }) => {
      const { data, error } = await supabase.from('fee_payments').insert(payment).select().single();
      if (error) throw error;

      // Update fee_paid on student
      const { data: student } = await supabase.from('students').select('fee_paid, total_fee').eq('id', payment.student_id).single();
      if (student) {
        const newPaid = (Number(student.fee_paid) || 0) + payment.amount;
        const totalFee = Number(student.total_fee) || 0;
        const feeStatus = newPaid >= totalFee ? 'paid' : newPaid > 0 ? 'partial' : 'pending';
        await supabase.from('students').update({ fee_paid: newPaid, fee_status: feeStatus }).eq('id', payment.student_id);
      }
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee_payments'] });
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Payment recorded');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export default function FeesPage() {
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: payments, isLoading: paymentsLoading } = useFeePayments();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const isLoading = studentsLoading || paymentsLoading;

  const stats = useMemo(() => {
    const all = students ?? [];
    const totalGenerated = all.reduce((s, st) => s + (Number(st.total_fee) || 0), 0);
    const totalReceived = all.reduce((s, st) => s + (Number(st.fee_paid) || 0), 0);
    const pending = totalGenerated - totalReceived;
    return { totalGenerated, totalReceived, pending };
  }, [students]);

  const pendingStudents = useMemo(() => {
    return (students ?? []).filter(s => s.fee_status !== 'paid' && (Number(s.total_fee) || 0) > 0);
  }, [students]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Fee Management</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={IndianRupee} label="Total Generated" value={stats.totalGenerated} color="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle} label="Total Received" value={stats.totalReceived} color="bg-success/10 text-success" />
        <StatCard icon={AlertTriangle} label="Pending" value={stats.pending} color="bg-warning/10 text-warning" />
      </div>

      {/* Upcoming / Pending collections */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground">Pending Fee Collections</h3>
        </div>
        {pendingStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">All fees collected — great job!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total Fee</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Due</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map((student, i) => {
                  const total = Number(student.total_fee) || 0;
                  const paid = Number(student.fee_paid) || 0;
                  const due = total - paid;
                  return (
                    <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => setSelectedStudent(student)}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{student.student_id}</p>
                      </td>
                      <td className="px-4 py-3 text-foreground">₹{total.toLocaleString()}</td>
                      <td className="px-4 py-3 text-success font-medium">₹{paid.toLocaleString()}</td>
                      <td className="px-4 py-3 text-destructive font-medium">₹{due.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          student.fee_status === 'partial' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                        }`}>
                          {student.fee_status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(student); }}
                          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity">
                          Update Fee
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All students fee overview */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-display font-semibold text-foreground">All Students</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Paid</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {(students ?? []).map((student, i) => (
                <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => setSelectedStudent(student)}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{student.student_id}</p>
                  </td>
                  <td className="px-4 py-3 text-foreground">₹{(Number(student.total_fee) || 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-success font-medium">₹{(Number(student.fee_paid) || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      student.fee_status === 'paid' ? 'bg-success/10 text-success' :
                      student.fee_status === 'partial' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {student.fee_status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedStudent && (
          <StudentFeeModal
            student={selectedStudent}
            payments={(payments ?? []).filter(p => p.student_id === selectedStudent.id)}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-display font-bold text-foreground">₹{value.toLocaleString()}</p>
      </div>
    </div>
  );
}

function StudentFeeModal({ student, payments, onClose }: { student: any; payments: any[]; onClose: () => void }) {
  const addPayment = useAddPayment();
  const [form, setForm] = useState({ amount: '', payment_mode: 'cash', payment_date: new Date().toISOString().split('T')[0], notes: '' });

  const totalFee = Number(student.total_fee) || 0;
  const feePaid = Number(student.fee_paid) || 0;
  const due = totalFee - feePaid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Enter a valid amount'); return; }
    addPayment.mutate(
      { student_id: student.id, amount, payment_mode: form.payment_mode, payment_date: form.payment_date, notes: form.notes || undefined },
      { onSuccess: () => { setForm({ amount: '', payment_mode: 'cash', payment_date: new Date().toISOString().split('T')[0], notes: '' }); onClose(); } }
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-display font-bold text-foreground">{student.first_name} {student.last_name}</h2>
            <p className="text-xs text-muted-foreground font-mono">{student.student_id}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        {/* Fee summary */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-bold text-foreground">₹{totalFee.toLocaleString()}</p>
          </div>
          <div className="bg-success/5 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Paid</p>
            <p className="font-bold text-success">₹{feePaid.toLocaleString()}</p>
          </div>
          <div className="bg-destructive/5 rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">Due</p>
            <p className="font-bold text-destructive">₹{due.toLocaleString()}</p>
          </div>
        </div>

        {/* Record payment form */}
        {due > 0 && (
          <form onSubmit={handleSubmit} className="mb-5 p-4 rounded-lg border border-border bg-muted/30 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">Record Payment</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Amount (₹) *</label>
                <input type="number" required value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder={`Max ₹${due.toLocaleString()}`}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Mode</label>
                <select value={form.payment_mode} onChange={e => setForm(p => ({ ...p, payment_mode: e.target.value }))}
                  className="w-full h-9 rounded-lg border border-input bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Date</label>
                <input type="date" value={form.payment_date} onChange={e => setForm(p => ({ ...p, payment_date: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Notes</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional"
                  className="w-full px-3 py-2 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <button type="submit" disabled={addPayment.isPending}
              className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {addPayment.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Record Payment
            </button>
          </form>
        )}

        {/* Payment history */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Payment History</h4>
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No payments recorded yet</p>
          ) : (
            <div className="space-y-2">
              {payments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">₹{Number(p.amount).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{p.payment_date} · <span className="capitalize">{p.payment_mode.replace('_', ' ')}</span></p>
                  </div>
                  {p.notes && <p className="text-xs text-muted-foreground max-w-[120px] truncate">{p.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
