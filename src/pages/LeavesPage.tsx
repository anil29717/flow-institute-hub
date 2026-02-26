import { useLeaveRequests, useUpdateLeaveStatus } from '@/hooks/useSupabaseData';
import { motion } from 'framer-motion';
import { Calendar, Check, X, Loader2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

const typeColors: Record<string, string> = {
  sick: 'bg-destructive/10 text-destructive',
  casual: 'bg-info/10 text-info',
  earned: 'bg-accent/10 text-accent',
  emergency: 'bg-warning/10 text-warning',
};

export default function LeavesPage() {
  const { data: leaves, isLoading } = useLeaveRequests();
  const updateStatus = useUpdateLeaveStatus();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Leave Requests</h1>

      {(leaves ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No leave requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(leaves ?? []).map((leave, i) => {
            const teacherProfile = (leave as any).teachers?.profiles;
            const teacherName = teacherProfile ? `${teacherProfile.first_name} ${teacherProfile.last_name}` : 'Unknown';
            const initials = teacherName.split(' ').map((n: string) => n[0]).join('');

            return (
              <motion.div key={leave.id} initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {initials}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{teacherName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${typeColors[leave.leave_type] ?? ''}`}>{leave.leave_type}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {leave.start_date} → {leave.end_date}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[leave.status] ?? ''}`}>{leave.status}</span>
                    {leave.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus.mutate({ id: leave.id, status: 'approved' })}
                          className="w-8 h-8 rounded-lg bg-success/10 hover:bg-success/20 flex items-center justify-center text-success transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateStatus.mutate({ id: leave.id, status: 'rejected' })}
                          className="w-8 h-8 rounded-lg bg-destructive/10 hover:bg-destructive/20 flex items-center justify-center text-destructive transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-3">{leave.reason}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
