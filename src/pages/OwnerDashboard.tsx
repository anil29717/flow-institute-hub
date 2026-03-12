import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Layers, Loader2, CreditCard, History, AlertTriangle, X, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { useDashboardStats, useStudents, useInstitute } from '@/hooks/useApiData';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: students } = useStudents();
  const { data: planLimits } = usePlanLimits();
  const { data: institute } = useInstitute(user?.instituteId ?? null);
  const [showHistory, setShowHistory] = useState(false);

  const feeStats = useMemo(() => {
    const all = students ?? [];
    const totalGenerated = all.reduce((s: number, st: any) => s + (Number(st.totalFees) || 0), 0);
    const totalReceived = all.reduce((s: number, st: any) => s + (Number(st.feesPaid) || 0), 0);
    const pending = totalGenerated - totalReceived;
    const pendingStudents = all.filter((s: any) => s.feeStatus !== 'paid' && (Number(s.totalFees) || 0) > 0);
    return { totalGenerated, totalReceived, pending, pendingStudents };
  }, [students]);

  const statCards = [
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: Users, gradient: 'stat-gradient-1', trend: '+12%' },
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: GraduationCap, gradient: 'stat-gradient-2', trend: '+8%' },
    { label: 'Active Batches', value: stats?.activeBatches ?? 0, icon: Layers, gradient: 'stat-gradient-3', trend: '+3' },
    { label: 'Fees Collected', value: `₹${((feeStats.totalReceived || 0) / 1000).toFixed(0)}k`, icon: IndianRupee, gradient: 'stat-gradient-4', trend: '+15%' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Expiry Warning Banner */}
      {planLimits?.hasPlan && planLimits.isExpired && (
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 backdrop-blur-sm p-4 flex items-start gap-3 shadow-sm">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          </motion.div>
          <div>
            <p className="font-semibold text-destructive">Your plan has expired!</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Your <strong>{planLimits.planName}</strong> plan expired on {planLimits.planExpiresAt ? new Date(planLimits.planExpiresAt).toLocaleDateString() : 'N/A'}.
              You cannot add new students or teachers until your plan is renewed. Please contact the administrator.
            </p>
          </div>
        </motion.div>
      )}

      {planLimits?.hasPlan && !planLimits.isExpired && planLimits.planExpiresAt && (() => {
        const daysLeft = Math.ceil((new Date(planLimits.planExpiresAt).getTime() - Date.now()) / 86400000);
        if (daysLeft <= 7) {
          return (
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="rounded-xl border border-warning/30 bg-warning/5 backdrop-blur-sm p-4 flex items-start gap-3 shadow-sm">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              </motion.div>
              <div>
                <p className="font-semibold text-warning">Plan expiring soon!</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your <strong>{planLimits.planName}</strong> plan expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>.
                  Contact the administrator to renew your plan.
                </p>
              </div>
            </motion.div>
          );
        }
        return null;
      })()}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.firstName}</span>! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's what's happening at your institute today.</p>
      </motion.div>

      {/* Plan Info Card */}
      {planLimits?.hasPlan && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className={`rounded-xl border p-5 backdrop-blur-sm ${planLimits.isExpired ? 'bg-destructive/5 border-destructive/30' : 'bg-card/80 border-border hover:shadow-lg transition-shadow duration-300'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                  {planLimits.planName} Plan
                  {planLimits.isExpired && <span className="text-destructive text-xs px-2 py-0.5 rounded-full bg-destructive/10">Expired</span>}
                </h3>
                {planLimits.planExpiresAt && (
                  <p className="text-xs text-muted-foreground">Expires: {new Date(planLimits.planExpiresAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
              <History className="w-3.5 h-3.5" /> History
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Students', current: planLimits.currentStudents, max: planLimits.maxStudents },
              { label: 'Teachers', current: planLimits.currentTeachers, max: planLimits.maxTeachers },
            ].map((item) => {
              const pct = Math.min(100, (item.current / (item.max ?? 1)) * 100);
              const isFull = item.current >= (item.max ?? 0);
              return (
                <div key={item.label} className="bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>{item.label}</span>
                    <span className="font-semibold text-foreground">{item.current}/{item.max}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${isFull ? 'bg-destructive' : 'bg-primary'}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ y: 25, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className={`${card.gradient} rounded-xl p-5 text-primary-foreground cursor-default relative overflow-hidden group`}
            >
              {/* Background glow */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex items-center gap-0.5 text-xs font-medium bg-white/15 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="w-3 h-3" /> {card.trend}
                  </span>
                </div>
                <p className="text-3xl font-display font-bold">{card.value}</p>
                <p className="text-sm opacity-80 mt-0.5">{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fee Summary */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
            <IndianRupee className="w-4 h-4 text-secondary" />
          </div>
          <h3 className="font-display font-semibold text-foreground">Fee Summary</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Generated', value: `₹${feeStats.totalGenerated.toLocaleString()}`, color: 'text-foreground' },
            { label: 'Received', value: `₹${feeStats.totalReceived.toLocaleString()}`, color: 'text-secondary' },
            { label: 'Pending', value: `₹${feeStats.pending.toLocaleString()}`, color: 'text-destructive' },
          ].map((item, i) => (
            <motion.div key={item.label} whileHover={{ scale: 1.02 }}
              className="bg-muted/50 rounded-lg p-4 hover:bg-muted/70 transition-colors cursor-default">
              <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
              <p className={`text-xl font-display font-bold ${item.color}`}>{item.value}</p>
            </motion.div>
          ))}
        </div>

        {feeStats.pendingStudents.length > 0 ? (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Pending Collections ({feeStats.pendingStudents.length})
            </p>
            <div className="space-y-2">
              {feeStats.pendingStudents.slice(0, 5).map((student: any, i: number) => {
                const due = (Number(student.totalFees) || 0) - (Number(student.feesPaid) || 0);
                return (
                  <motion.div key={student._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors cursor-default group"
                  >
                    <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/15 transition-colors">
                      <IndianRupee className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground">₹{due.toLocaleString()} pending</p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${student.feeStatus === 'partial' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                      }`}>{student.feeStatus}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <Sparkles className="w-8 h-8 text-secondary mx-auto mb-2" />
            </motion.div>
            <p className="text-sm text-muted-foreground">All fees are collected — great job! 🎉</p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showHistory && user?.instituteId && (
          <PlanHistoryModal instituteId={user.instituteId} onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function PlanHistoryModal({ instituteId, onClose }: { instituteId: string; onClose: () => void }) {
  const { data: history, isLoading } = useQuery({
    queryKey: ['plan_history', instituteId],
    queryFn: () => api.get(`/admin/institutes/${instituteId}/plan-history`),
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="bg-card rounded-2xl border border-border p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2"><History className="w-5 h-5 text-primary" /> Plan History</h2>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></motion.button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : !history?.length ? (
          <p className="text-sm text-muted-foreground text-center py-8">No plan changes recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {history.map((h: any, i: number) => (
              <motion.div key={h._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-muted/50 rounded-xl p-4 hover:bg-muted/70 transition-colors">
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
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
