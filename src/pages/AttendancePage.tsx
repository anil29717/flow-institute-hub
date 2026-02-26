import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches, useStudents } from '@/hooks/useSupabaseData';
import { Loader2, CheckCircle, XCircle, Users, Calendar } from 'lucide-react';
import { toast } from 'sonner';

function useAttendanceByDate(batchId: string | null, date: string) {
  return useQuery({
    queryKey: ['attendance', batchId, date],
    queryFn: async () => {
      if (!batchId) return [];
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('batch_id', batchId)
        .eq('date', date);
      if (error) throw error;
      return data;
    },
    enabled: !!batchId,
  });
}

function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (records: { student_id: string; student_name: string; batch_id: string; date: string; status: string; marked_by?: string }[]) => {
      // Upsert: delete existing for this batch+date, then insert fresh
      if (records.length === 0) return;
      const { batch_id, date } = records[0];
      await supabase.from('attendance').delete().eq('batch_id', batch_id).eq('date', date);
      const { error } = await supabase.from('attendance').insert(records);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useAttendanceStats() {
  return useQuery({
    queryKey: ['attendance_stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('attendance').select('status');
      if (error) throw error;
      const total = data.length;
      const present = data.filter(a => a.status === 'present').length;
      const absent = data.filter(a => a.status === 'absent').length;
      const late = data.filter(a => a.status === 'late').length;
      return { total, present, absent, late };
    },
  });
}

export default function AttendancePage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const isTeacher = user?.role === 'teacher';
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: allStudents, isLoading: studentsLoading } = useStudents();
  const { data: stats, isLoading: statsLoading } = useAttendanceStats();

  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: existingAttendance, isLoading: attendanceLoading } = useAttendanceByDate(selectedBatchId || null, selectedDate);
  const markAttendance = useMarkAttendance();

  // For teachers, only show their assigned batches
  const availableBatches = useMemo(() => {
    if (!batches) return [];
    return batches;
  }, [batches]);

  // Students in selected batch
  const batchStudents = useMemo(() => {
    if (!selectedBatchId || !allStudents) return [];
    return allStudents.filter(s => s.batch_id === selectedBatchId && s.is_active);
  }, [selectedBatchId, allStudents]);

  // Attendance map from existing records
  const [attendanceMap, setAttendanceMap] = useState<Record<string, string>>({});

  // Sync existing attendance when it loads
  useMemo(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const map: Record<string, string> = {};
      existingAttendance.forEach(a => {
        if (a.student_id) map[a.student_id] = a.status;
      });
      setAttendanceMap(map);
    } else if (existingAttendance && existingAttendance.length === 0 && batchStudents.length > 0) {
      // Default all to present
      const map: Record<string, string> = {};
      batchStudents.forEach(s => { map[s.id] = 'present'; });
      setAttendanceMap(map);
    }
  }, [existingAttendance, batchStudents]);

  const toggleStatus = (studentId: string) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: prev[studentId] === 'present' ? 'absent' : prev[studentId] === 'absent' ? 'late' : 'present',
    }));
  };

  const handleSave = () => {
    if (!selectedBatchId) return;
    const records = batchStudents.map(s => ({
      student_id: s.id,
      student_name: `${s.first_name} ${s.last_name}`,
      batch_id: selectedBatchId,
      date: selectedDate,
      status: attendanceMap[s.id] || 'present',
    }));
    markAttendance.mutate(records);
  };

  const isLoading = batchesLoading || studentsLoading || statsLoading;

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const presentCount = Object.values(attendanceMap).filter(s => s === 'present').length;
  const absentCount = Object.values(attendanceMap).filter(s => s === 'absent').length;
  const lateCount = Object.values(attendanceMap).filter(s => s === 'late').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>

      {/* Overall stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Records" value={stats?.total ?? 0} color="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle} label="Present" value={stats?.present ?? 0} color="bg-success/10 text-success" />
        <StatCard icon={XCircle} label="Absent" value={stats?.absent ?? 0} color="bg-destructive/10 text-destructive" />
        <StatCard icon={Calendar} label="Late" value={stats?.late ?? 0} color="bg-warning/10 text-warning" />
      </div>

      {/* Mark attendance section */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Mark Attendance</h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Batch</label>
            <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select batch</option>
              {availableBatches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} — {(b as any).teachers?.profiles?.first_name ? `${(b as any).teachers.profiles.first_name} ${(b as any).teachers.profiles.last_name}` : 'No teacher'}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label>
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>
        </div>

        {!selectedBatchId ? (
          <p className="text-sm text-muted-foreground text-center py-6">Select a batch to mark attendance</p>
        ) : attendanceLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : batchStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No students in this batch</p>
        ) : (
          <>
            {/* Summary bar */}
            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="text-success font-medium">Present: {presentCount}</span>
              <span className="text-destructive font-medium">Absent: {absentCount}</span>
              <span className="text-warning font-medium">Late: {lateCount}</span>
              <span className="text-muted-foreground">/ {batchStudents.length} students</span>
            </div>

            <div className="space-y-2">
              {batchStudents.map((student, i) => {
                const status = attendanceMap[student.id] || 'present';
                return (
                  <motion.div key={student.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                        {student.first_name[0]}{student.last_name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{student.first_name} {student.last_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{student.student_id}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleStatus(student.id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                        status === 'present' ? 'bg-success/10 text-success hover:bg-success/20' :
                        status === 'absent' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' :
                        'bg-warning/10 text-warning hover:bg-warning/20'
                      }`}>
                      {status === 'present' ? '✓ Present' : status === 'absent' ? '✗ Absent' : '⏱ Late'}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <button onClick={handleSave} disabled={markAttendance.isPending}
              className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {markAttendance.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Attendance
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-display font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
