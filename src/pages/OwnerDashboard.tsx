import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, IndianRupee, TrendingUp, Layers, Calendar, Loader2 } from 'lucide-react';
import { useDashboardStats, useLeaveRequests, useFees } from '@/hooks/useSupabaseData';
import { revenueData, attendanceData, courseDistribution } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
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
    { label: 'Revenue', value: `₹${((stats?.totalRevenue ?? 0) / 1000).toFixed(0)}k`, icon: IndianRupee, gradient: 'stat-gradient-4' },
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

      {/* Charts row — still using mock chart data for visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Revenue Overview</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(175, 60%, 40%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(175, 60%, 40%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(175, 60%, 40%)" fill="url(#revGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Course Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={courseDistribution} dataKey="students" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {courseDistribution.map((entry, index) => (<Cell key={index} fill={entry.fill} />))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {courseDistribution.map((c) => (
              <div key={c.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.fill }} />
                <span className="text-muted-foreground flex-1">{c.name}</span>
                <span className="font-medium text-foreground">{c.students}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Weekly Attendance</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 89%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(220, 10%, 46%)' }} />
              <Tooltip />
              <Bar dataKey="present" fill="hsl(175, 60%, 40%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Pending Actions</h3>
          <div className="space-y-3">
            {pendingLeaves.length === 0 && overdueFees.length === 0 && (
              <p className="text-sm text-muted-foreground">No pending actions — everything's up to date!</p>
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
            {overdueFees.map((fee) => (
              <div key={fee.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                  <IndianRupee className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{fee.student_name} — Fee overdue</p>
                  <p className="text-xs text-muted-foreground">₹{Number(fee.amount).toLocaleString()} due {fee.due_date}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-destructive/10 text-destructive">Overdue</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
