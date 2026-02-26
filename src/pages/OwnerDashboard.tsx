import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Layers, Calendar, Loader2 } from 'lucide-react';
import { useDashboardStats, useLeaveRequests, useFees } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: leaves } = useLeaveRequests();
  const { data: fees } = useFees();

  const pendingLeaves = leaves?.filter(l => l.status === 'pending') ?? [];
  const overdueFees = fees?.filter(f => f.status === 'overdue') ?? [];

  const statCards = [
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: Users, gradient: 'stat-gradient-1' },
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: GraduationCap, gradient: 'stat-gradient-2' },
    { label: 'Active Batches', value: stats?.activeBatches ?? 0, icon: Layers, gradient: 'stat-gradient-3' },
    { label: 'Revenue Collected', value: `₹${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}k`, icon: IndianRupee, gradient: 'stat-gradient-4' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Good morning, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here's what's happening at your institute today.</p>
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

      {/* Pending Fees & Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Fee Summary</h3>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Collected</p>
              <p className="text-lg font-display font-bold text-foreground">₹{((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}k</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-display font-bold text-destructive">₹{((stats?.pendingFees ?? 0) / 1000).toFixed(0)}k</p>
            </div>
          </div>
          {overdueFees.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Overdue</p>
              {overdueFees.slice(0, 5).map((fee) => (
                <div key={fee.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <IndianRupee className="w-4 h-4 text-destructive" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{fee.student_name}</p>
                    <p className="text-xs text-muted-foreground">₹{Number(fee.amount).toLocaleString()} due {fee.due_date}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive">Overdue</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No overdue fees — great job!</p>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Pending Leave Requests</h3>
          <div className="space-y-3">
            {pendingLeaves.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending leave requests.</p>
            )}
            {pendingLeaves.map((leave) => {
              const teacherProfile = (leave as any).teachers?.profiles;
              const teacherName = teacherProfile ? `${teacherProfile.first_name} ${teacherProfile.last_name}` : 'Unknown';
              return (
                <div key={leave.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{teacherName} — {leave.leave_type} leave</p>
                    <p className="text-xs text-muted-foreground">{leave.start_date} to {leave.end_date}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">Pending</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
