import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, GraduationCap, Layers, CheckCircle, Calendar } from 'lucide-react';

function useTeacherDashboard() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['teacher_dashboard', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const [batches, students, allAttendance, salaryPayments] = await Promise.all([
        api.get('/batches').catch(() => []),
        api.get('/students').catch(() => []),
        api.get('/attendance').catch(() => []),
        api.get('/salaries').catch(() => [])
      ]);

      const today = new Date().toISOString().split('T')[0];
      const batchIds = (batches ?? []).map((b: any) => b._id);

      const todayAttendance = (allAttendance ?? []).filter((a: any) => {
        const aBatchId = typeof a.batchId === 'string' ? a.batchId : a.batchId?._id;
        return batchIds.includes(aBatchId) && new Date(a.date).toISOString().split('T')[0] === today;
      });

      return { teacher: user, batches: batches || [], students: students || [], todayAttendance, salaryPayments: salaryPayments || [] };
    },
    enabled: !!user?.id,
  });
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useTeacherDashboard();

  if (isLoading || !data) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const { batches, students, todayAttendance, salaryPayments } = data;
  const presentToday = todayAttendance.filter((a: any) => a.status === 'present').length;
  const totalMarkedToday = todayAttendance.length;

  const statCards = [
    { label: 'My Batches', value: batches.length, icon: Layers, gradient: 'stat-gradient-1' },
    { label: 'Total Students', value: students.length, icon: GraduationCap, gradient: 'stat-gradient-2' },
    { label: 'Present Today', value: `${presentToday}/${totalMarkedToday || students.length}`, icon: CheckCircle, gradient: 'stat-gradient-3' },
    { label: 'Salary Payments', value: salaryPayments.length, icon: Calendar, gradient: 'stat-gradient-4' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Welcome, {user?.firstName}!</h1>
        <p className="text-muted-foreground">Here's your teaching overview.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`${card.gradient} rounded-xl p-5 text-primary-foreground`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 opacity-80" />
              </div>
              <p className="text-2xl font-display font-bold">{card.value}</p>
              <p className="text-sm opacity-75">{card.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* My Batches */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">My Batches</h3>
        {batches.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No batches assigned yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {batches.map((batch: any, i: number) => {
              const batchStudents = students.filter((s: any) => s.batchId?._id === batch._id || s.batchId === batch._id);
              return (
                <motion.div key={batch._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{batch.name}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${batch.status === 'ongoing' ? 'bg-success/10 text-success' :
                      batch.status === 'upcoming' ? 'bg-warning/10 text-warning' :
                        'bg-muted text-muted-foreground'
                      }`}>{batch.status}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{batch.courseId?.name || 'No course'}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>{batchStudents.length} students</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Salary */}
      {salaryPayments.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Recent Salary Payments</h3>
          <div className="space-y-2">
            {salaryPayments.map((pay: any) => (
              <div key={pay._id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">₹{Number(pay.amount).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{pay.month} {pay.year} · {pay.paymentMode?.replace('_', ' ')}</p>
                </div>
                <span className="text-xs text-success font-medium">Paid</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
