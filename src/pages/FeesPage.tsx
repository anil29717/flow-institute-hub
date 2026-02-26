import { mockFees } from '@/data/mockData';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';

const statusColors: Record<string, string> = {
  paid: 'bg-success/10 text-success',
  pending: 'bg-warning/10 text-warning',
  overdue: 'bg-destructive/10 text-destructive',
};

export default function FeesPage() {
  const totalCollected = mockFees.filter(f => f.status === 'paid').reduce((s, f) => s + f.amount, 0);
  const totalPending = mockFees.filter(f => f.status !== 'paid').reduce((s, f) => s + f.amount, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Fee Management</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center"><CheckCircle className="w-5 h-5 text-success" /></div>
          <div><p className="text-sm text-muted-foreground">Collected</p><p className="text-xl font-display font-bold text-foreground">₹{totalCollected.toLocaleString()}</p></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-warning" /></div>
          <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-xl font-display font-bold text-foreground">₹{totalPending.toLocaleString()}</p></div>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center"><TrendingUp className="w-5 h-5 text-info" /></div>
          <div><p className="text-sm text-muted-foreground">Total</p><p className="text-xl font-display font-bold text-foreground">₹{(totalCollected + totalPending).toLocaleString()}</p></div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Due Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Receipt</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockFees.map((fee, i) => (
              <motion.tr key={fee.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{fee.studentName}</td>
                <td className="px-4 py-3 text-foreground">₹{fee.amount.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{fee.dueDate}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{fee.receiptNo || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[fee.status]}`}>{fee.status}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
