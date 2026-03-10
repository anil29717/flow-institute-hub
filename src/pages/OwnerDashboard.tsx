import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Layers, Loader2, CreditCard, History, AlertTriangle, X } from 'lucide-react';
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
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: Users, gradient: 'stat-gradient-1' },
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: GraduationCap, gradient: 'stat-gradient-2' },
    { label: 'Active Batches', value: stats?.activeBatches ?? 0, icon: Layers, gradient: 'stat-gradient-3' },
    { label: 'Fees Collected', value: `₹${((feeStats.totalReceived || 0) / 1000).toFixed(0)}k`, icon: IndianRupee, gradient: 'stat-gradient-4' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Expiry Warning Banner */}
      {planLimits?.hasPlan && planLimits.isExpired && (
        <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
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
            <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="rounded-xl border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
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

      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Good morning, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here's what's happening at your institute.</p>
      </div>

      {/* Plan Info Card */}
      {planLimits?.hasPlan && (
        <div className={`rounded-xl border p-5 ${planLimits.isExpired ? 'bg-destructive/5 border-destructive/30' : 'bg-card border-border'}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">
                {planLimits.planName} Plan
                {planLimits.isExpired && <span className="text-destructive text-sm ml-2">(Expired)</span>}
              </h3>
            </div>
            <button onClick={() => setShowHistory(true)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
              <History className="w-3.5 h-3.5" /> History
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Students</span>
                <span className="font-medium text-foreground">{planLimits.currentStudents}/{planLimits.maxStudents}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${planLimits.currentStudents >= (planLimits.maxStudents ?? 0) ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, (planLimits.currentStudents / (planLimits.maxStudents ?? 1)) * 100)}%` }} />
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Teachers</span>
                <span className="font-medium text-foreground">{planLimits.currentTeachers}/{planLimits.maxTeachers}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${planLimits.currentTeachers >= (planLimits.maxTeachers ?? 0) ? 'bg-destructive' : 'bg-primary'}`}
                  style={{ width: `${Math.min(100, (planLimits.currentTeachers / (planLimits.maxTeachers ?? 1)) * 100)}%` }} />
              </div>
            </div>
          </div>

          {planLimits.planExpiresAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Expires: {new Date(planLimits.planExpiresAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

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
              {feeStats.pendingStudents.slice(0, 5).map((student: any) => {
                const due = (Number(student.totalFees) || 0) - (Number(student.feesPaid) || 0);
                return (
                  <div key={student._id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <IndianRupee className="w-4 h-4 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{student.firstName} {student.lastName}</p>
                      <p className="text-xs text-muted-foreground">₹{due.toLocaleString()} pending</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${student.feeStatus === 'partial' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'
                      }`}>{student.feeStatus}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">All fees are collected — great job!</p>
        )}
      </div>

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

