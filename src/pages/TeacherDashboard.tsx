import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Users, GraduationCap, Layers, CheckCircle, Calendar, ArrowUpRight, Sparkles, Clock } from 'lucide-react';
import { TeacherAttendanceCalendar } from '@/components/attendance/TeacherAttendanceCalendar';

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
      const batchIds = (batches ?? []).map((b: any) => String(b._id || b.id));

      const teacherStudents = (students || []).filter((s: any) => batchIds.includes(String(s.batchId?._id || s.batchId)));

      const todayAttendance = (allAttendance ?? []).filter((a: any) => {
        if (!a.studentId) return false;
        const aBatchId = String(a.batchId?._id || a.batchId);
        return batchIds.includes(aBatchId) && new Date(a.date).toISOString().split('T')[0] === today;
      });

      return { teacher: user, batches: batches || [], students: teacherStudents, todayAttendance, salaryPayments: salaryPayments || [] };
    },
    enabled: !!user?.id,
  });
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useTeacherDashboard();

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  const { batches, students, todayAttendance, salaryPayments } = data;
  const presentToday = todayAttendance.filter((a: any) => a.status === 'present').length;
  const totalMarkedToday = todayAttendance.length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { label: 'My Batches', value: batches.length, icon: Layers, gradient: 'stat-gradient-1', trend: `${batches.length} active` },
    { label: 'Total Students', value: students.length, icon: GraduationCap, gradient: 'stat-gradient-2', trend: 'Enrolled' },
    { label: 'Present Today', value: `${presentToday}/${totalMarkedToday || students.length}`, icon: CheckCircle, gradient: 'stat-gradient-3', trend: totalMarkedToday > 0 ? `${Math.round((presentToday / totalMarkedToday) * 100)}%` : 'N/A' },
    { label: 'Salary Payments', value: salaryPayments.length, icon: Calendar, gradient: 'stat-gradient-4', trend: 'Records' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user?.firstName}</span>! 👋
        </h1>
        <p className="text-muted-foreground mt-1">Here's your teaching overview for today.</p>
      </motion.div>

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
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-colors" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium bg-white/15 px-2 py-0.5 rounded-full">{card.trend}</span>
                </div>
                <p className="text-3xl font-display font-bold">{card.value}</p>
                <p className="text-sm opacity-80 mt-0.5">{card.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-8 space-y-6">
          {/* My Batches */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Layers className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground">My Batches</h3>
            </div>
            {batches.length === 0 ? (
              <div className="text-center py-8">
                <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
                  <Sparkles className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                </motion.div>
                <p className="text-sm text-muted-foreground">No batches assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {batches.map((batch: any, i: number) => {
                  const batchIdStr = String(batch._id || batch.id);
                  const batchStudents = students.filter((s: any) => String(s.batchId?._id || s.batchId) === batchIdStr);
                  return (
                    <motion.div key={batch._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -3, scale: 1.01 }}
                      className="p-4 rounded-xl border border-border bg-muted/30 hover:bg-muted/50 hover:border-primary/20 hover:shadow-md transition-all duration-300 cursor-default"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground text-sm">{batch.name}</h4>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${batch.status === 'ongoing' ? 'bg-success/10 text-success' :
                            batch.status === 'upcoming' ? 'bg-warning/10 text-warning' :
                              'bg-muted text-muted-foreground'
                          }`}>{batch.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{batch.courseId?.name || 'No course'}</p>
                      <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground pt-2 border-t border-border/50">
                        <Users className="w-3.5 h-3.5" />
                        <span>{batchStudents.length} students</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Recent Salary */}
          {salaryPayments.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-card/80 backdrop-blur-sm rounded-xl border border-border p-5 hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-secondary" />
                </div>
                <h3 className="font-display font-semibold text-foreground">Recent Salary Payments</h3>
              </div>
              <div className="space-y-2">
                {salaryPayments.map((pay: any, i: number) => (
                  <motion.div key={pay._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border hover:bg-muted/50 transition-all cursor-default"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">₹{Number(pay.amount).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{pay.month} {pay.year} · {pay.paymentMode?.replace('_', ' ')}</p>
                    </div>
                    <span className="text-xs text-success font-medium bg-success/10 px-2.5 py-1 rounded-full">Paid</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-4">
          <TeacherAttendanceCalendar role="teacher" />
        </div>
      </div>
    </div>
  );
}
