import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, IndianRupee, Clock, Wallet } from 'lucide-react';

function useTeacherSalary() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['teacher_salary', user?.id],
    queryFn: async () => {
      if (!user?.profileId) return null;

      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('profile_id', user.profileId)
        .single();

      if (!teacher) return null;

      const { data: payments } = await supabase
        .from('salary_payments')
        .select('*')
        .eq('teacher_id', teacher.id)
        .order('payment_date', { ascending: false });

      return { teacher, payments: payments ?? [] };
    },
    enabled: !!user?.profileId,
  });
}

const salaryTypeLabel: Record<string, string> = { per_hour: 'Per Hour', per_day: 'Per Day', per_month: 'Per Month' };
const freqLabel: Record<string, string> = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', custom: 'Custom' };

export default function TeacherSalaryHistory() {
  const { data, isLoading } = useTeacherSalary();

  if (isLoading || !data) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const { teacher, payments } = data;
  const totalReceived = payments.reduce((s, p) => s + Number(p.amount), 0);
  const thisMonth = payments.filter(p => {
    const d = new Date(p.payment_date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonth.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Salary History</h1>
        <p className="text-muted-foreground">
          {salaryTypeLabel[teacher.salary_type] || 'Per Month'} · ₹{Number(teacher.salary_amount || 0).toLocaleString()} · {freqLabel[teacher.payment_frequency] || 'Monthly'}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-success/10 text-success">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Received</p>
            <p className="text-xl font-display font-bold text-foreground">₹{totalReceived.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">This Month</p>
            <p className="text-xl font-display font-bold text-foreground">₹{thisMonthTotal.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-warning/10 text-warning">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Payments</p>
            <p className="text-xl font-display font-bold text-foreground">{payments.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-foreground">Payment Records</h3>
        </div>
        {payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">No salary payments received yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mode</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Period</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay, i) => (
                  <motion.tr key={pay.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-foreground">{pay.payment_date}</td>
                    <td className="px-4 py-3 text-success font-medium">₹{Number(pay.amount).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">{pay.payment_mode.replace('_', ' ')}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{pay.period_label || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{pay.notes || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
