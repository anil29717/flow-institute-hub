import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Layers, Loader2, CalendarIcon } from 'lucide-react';
import { useDashboardStats, useStudents } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: students } = useStudents();

  const feeStats = useMemo(() => {
    const all = students ?? [];
    const totalGenerated = all.reduce((s, st) => s + (Number(st.total_fee) || 0), 0);
    const totalReceived = all.reduce((s, st) => s + (Number(st.fee_paid) || 0), 0);
    const pending = totalGenerated - totalReceived;
    const pendingStudents = all.filter(s => s.fee_status !== 'paid' && (Number(s.total_fee) || 0) > 0);
    return { totalGenerated, totalReceived, pending, pendingStudents };
  }, [students]);

  const statCards = [
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: Users, gradient: 'stat-gradient-1' },
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: GraduationCap, gradient: 'stat-gradient-2' },
    { label: 'Active Batches', value: stats?.activeBatches ?? 0, icon: Layers, gradient: 'stat-gradient-3' },
    { label: 'Fees Collected', value: `₹${(feeStats.totalReceived / 1000).toFixed(0)}k`, icon: IndianRupee, gradient: 'stat-gradient-4' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Good morning, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here's what's happening at your institute.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`${card.gradient} rounded-xl p-5 text-primary-foreground`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 opacity-80" />
                <TrendingUp className="w-4 h-4 opacity-60" />
              </div>
              <p className="text-2xl font-display font-bold">{card.value}</p>
              <p className="text-sm opacity-75">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Fee Summary */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Fee Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Generated</p>
            <p className="text-lg font-display font-bold text-foreground">₹{feeStats.totalGenerated.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="text-lg font-display font-bold text-secondary">₹{feeStats.totalReceived.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-display font-bold text-destructive">₹{feeStats.pending.toLocaleString()}</p>
          </div>
        </div>

        {feeStats.pendingStudents.length > 0 ? (
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Pending Collections ({feeStats.pendingStudents.length})</p>
            <div className="space-y-2">
              {feeStats.pendingStudents.slice(0, 5).map((student) => {
                const due = (Number(student.total_fee) || 0) - (Number(student.fee_paid) || 0);
                return (
                  <div key={student.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{student.first_name} {student.last_name}</p>
                      <p className="text-xs text-muted-foreground">₹{due.toLocaleString()} pending</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      student.fee_status === 'partial' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                    }`}>{student.fee_status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">All fees are collected — great job!</p>
        )}
      </div>
    </div>
  );
}
