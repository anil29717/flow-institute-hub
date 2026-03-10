import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface CalendarProps {
    role: 'owner' | 'teacher';
    teacherId?: string; // Optional: Only required if owner wants to filter a specific teacher, though owners usually want totals
}

export function TeacherAttendanceCalendar({ role, teacherId }: CalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Fetch attendance for the specific month
    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ['teacher_attendance', format(currentDate, 'yyyy-MM'), teacherId],
        queryFn: async () => {
            // Create date range for current month view
            const start = startOfMonth(currentDate);
            const end = endOfMonth(currentDate);

            let url = `/attendance?date=${start.toISOString()}`; // The backend handles date range poorly if we just pass one day. 
            // Wait, the current backend filters by exact day if `date` is passed.
            // Let's just fetch all teacher attendance without date filter and sort it locally, or modify the API.
            // Actually, since there relies on query params, let's just fetch all and filter locally for simplicity, or we can fetch without date.
            url = `/attendance?isTeacher=true`;
            if (teacherId) url += `&teacherId=${teacherId}`;

            const res = await api.get(url);

            // Filter the records that are for teachers. 
            // The backend now populates teacherId. Records without studentId and with teacherId are teacher records.
            return Array.isArray(res) ? res.filter((a: any) => a.teacherId) : [];
        }
    });

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

    const daysInMonth = useMemo(() => {
        return eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) });
    }, [currentDate]);

    // Aggregate stats per day
    const dailyStats = useMemo(() => {
        if (!attendanceData) return {};

        const stats: Record<string, any> = {};

        attendanceData.forEach((record: any) => {
            const dateStr = new Date(record.date).toISOString().split('T')[0];
            if (!stats[dateStr]) {
                stats[dateStr] = { present: 0, absent: 0, late: 0, myStatus: null };
            }

            if (record.status === 'present') stats[dateStr].present++;
            else if (record.status === 'absent') stats[dateStr].absent++;
            else if (record.status === 'late') stats[dateStr].late++;

            // If viewing as a specific teacher
            stats[dateStr].myStatus = record.status;
        });

        return stats;
    }, [attendanceData]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-10 bg-card rounded-xl border border-border">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    // Calculate starting empty boxes for correct day of week alignment
    const startDay = startOfMonth(currentDate).getDay(); // 0 is Sunday
    const emptyBoxes = Array.from({ length: startDay }, (_, i) => i);

    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden p-5">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                    {role === 'owner' ? 'Teacher Attendance Overview' : 'My Attendance Record'}
                </h3>

                <div className="flex items-center gap-4">
                    <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="font-medium text-foreground w-32 text-center">
                        {format(currentDate, 'MMMM yyyy')}
                    </span>
                    <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-1 mb-2 text-center max-w-sm mx-auto">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={`${day}-${i}`} className="w-8 text-[10px] font-semibold text-muted-foreground py-1">{day}</div>
                ))}
            </div>

            <div className="flex flex-wrap gap-1 max-w-sm mx-auto justify-start">
                {emptyBoxes.map(i => (
                    <div key={`empty-${i}`} className="w-8 h-8 rounded-sm" />
                ))}

                {daysInMonth.map(day => {
                    const dateStr = day.toISOString().split('T')[0];
                    const stats = dailyStats[dateStr] || null;
                    const isCurrentDay = isToday(day);

                    let boxColor = 'bg-muted/20 border border-border/40 text-muted-foreground hover:border-primary/50';
                    let tooltipContent = <span className="text-muted-foreground">No records</span>;

                    if (stats) {
                        if (role === 'owner') {
                            if (stats.present > 0 && stats.absent === 0) boxColor = 'bg-success/20 border-success/40 text-success-foreground';
                            else if (stats.absent > 0 && stats.present === 0) boxColor = 'bg-destructive/20 border-destructive/40 text-destructive-foreground';
                            else boxColor = 'bg-warning/20 border-warning/40 text-warning-foreground'; // Mixed

                            tooltipContent = (
                                <div className="flex flex-col gap-1">
                                    <span className="text-success font-medium">✓ Present: {stats.present}</span>
                                    {stats.absent > 0 && <span className="text-destructive font-medium">✗ Absent: {stats.absent}</span>}
                                    {stats.late > 0 && <span className="text-warning font-medium">⏱ Late: {stats.late}</span>}
                                </div>
                            );
                        } else {
                            // Teacher role
                            if (stats.myStatus === 'present') boxColor = 'bg-success/20 border border-success/50';
                            else if (stats.myStatus === 'absent') boxColor = 'bg-destructive/20 border border-destructive/40';
                            else if (stats.myStatus === 'late') boxColor = 'bg-warning/20 border border-warning/40';

                            tooltipContent = (
                                <span className={`font-medium ${stats.myStatus === 'present' ? 'text-success' : stats.myStatus === 'absent' ? 'text-destructive' : 'text-warning'}`}>
                                    {stats.myStatus === 'present' ? '✓ Present' : stats.myStatus === 'absent' ? '✗ Absent' : '⏱ Late'}
                                </span>
                            );
                        }
                    }

                    if (isCurrentDay) {
                        boxColor += ' ring-1 ring-primary ring-offset-1 ring-offset-card';
                    }

                    return (
                        <div key={dateStr} className="relative group">
                            <div className={`w-8 h-8 rounded-sm rounded-md flex items-center justify-center transition-all cursor-default ${boxColor}`}>
                                <span className="text-[10px] sm:text-xs">{format(day, 'd')}</span>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-2 bg-popover text-popover-foreground text-xs rounded-md shadow-md border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-display">
                                <p className="font-semibold mb-1 pb-1 border-b border-border/50">{format(day, 'MMM d, yyyy')}</p>
                                {tooltipContent}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
