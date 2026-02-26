import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, IndianRupee, TrendingUp, Layers, Loader2, CalendarIcon } from 'lucide-react';
import { useDashboardStats, useFees } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, isWithinInterval, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

type FilterMode = 'all' | 'today' | 'this_month' | 'last_month' | 'custom';

export default function OwnerDashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { data: fees } = useFees();

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined);

  const filteredFees = useMemo(() => {
    if (!fees) return [];
    if (filterMode === 'all') return fees;

    const now = new Date();
    let start: Date, end: Date;

    switch (filterMode) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'this_month':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'last_month':
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'custom':
        if (!customDate) return fees;
        start = startOfDay(customDate);
        end = endOfDay(customDate);
        break;
      default:
        return fees;
    }

    return fees.filter(f => {
      const dateStr = f.paid_date || f.due_date;
      if (!dateStr) return false;
      try {
        const d = parseISO(dateStr);
        return isWithinInterval(d, { start, end });
      } catch {
        return false;
      }
    });
  }, [fees, filterMode, customDate]);

  const feeStats = useMemo(() => {
    const total = filteredFees.reduce((s, f) => s + Number(f.amount), 0);
    const paid = filteredFees.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0);
    const pending = filteredFees.filter(f => f.status === 'pending').reduce((s, f) => s + Number(f.amount), 0);
    const overdue = filteredFees.filter(f => f.status === 'overdue').reduce((s, f) => s + Number(f.amount), 0);
    return { total, paid, pending, overdue, count: filteredFees.length };
  }, [filteredFees]);

  const overdueFees = filteredFees.filter(f => f.status === 'overdue');
  const pendingFeesList = filteredFees.filter(f => f.status === 'pending');

  const statCards = [
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: Users, gradient: 'stat-gradient-1' },
    { label: 'Total Students', value: stats?.totalStudents ?? 0, icon: GraduationCap, gradient: 'stat-gradient-2' },
    { label: 'Active Batches', value: stats?.activeBatches ?? 0, icon: Layers, gradient: 'stat-gradient-3' },
    { label: 'Fees Collected', value: `₹${(feeStats.paid / 1000).toFixed(0)}k`, icon: IndianRupee, gradient: 'stat-gradient-4' },
  ];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const filterLabel = filterMode === 'all' ? 'All Time' :
    filterMode === 'today' ? 'Today' :
    filterMode === 'this_month' ? 'This Month' :
    filterMode === 'last_month' ? 'Last Month' :
    customDate ? format(customDate, 'dd MMM yyyy') : 'Custom';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Good morning, {user?.firstName}!</h1>
          <p className="text-muted-foreground">Here's what's happening at your institute.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterMode} onValueChange={(v) => setFilterMode(v as FilterMode)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="custom">Custom Date</SelectItem>
            </SelectContent>
          </Select>
          {filterMode === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal", !customDate && "text-muted-foreground")}>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {customDate ? format(customDate, 'PPP') : 'Pick date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar mode="single" selected={customDate} onSelect={setCustomDate} initialFocus className={cn("p-3 pointer-events-auto")} />
              </PopoverContent>
            </Popover>
          )}
        </div>
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
        <h3 className="font-display font-semibold text-foreground mb-4">Fee Summary — {filterLabel}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total Generated</p>
            <p className="text-lg font-display font-bold text-foreground">₹{feeStats.total.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Received</p>
            <p className="text-lg font-display font-bold text-secondary">₹{feeStats.paid.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg font-display font-bold text-warning">₹{feeStats.pending.toLocaleString()}</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className="text-lg font-display font-bold text-destructive">₹{feeStats.overdue.toLocaleString()}</p>
          </div>
        </div>

        {(overdueFees.length > 0 || pendingFeesList.length > 0) && (
          <div className="space-y-4">
            {overdueFees.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Overdue ({overdueFees.length})</p>
                <div className="space-y-2">
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
              </div>
            )}
            {pendingFeesList.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Pending ({pendingFeesList.length})</p>
                <div className="space-y-2">
                  {pendingFeesList.slice(0, 5).map((fee) => (
                    <div key={fee.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50">
                      <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                        <IndianRupee className="w-4 h-4 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{fee.student_name}</p>
                        <p className="text-xs text-muted-foreground">₹{Number(fee.amount).toLocaleString()} due {fee.due_date}</p>
                      </div>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-warning/10 text-warning">Pending</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        {overdueFees.length === 0 && pendingFeesList.length === 0 && (
          <p className="text-sm text-muted-foreground">All fees are collected for this period!</p>
        )}
      </div>
    </div>
  );
}
