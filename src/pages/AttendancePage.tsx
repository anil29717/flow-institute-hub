import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useBatches, useStudents, useTeachers } from '@/hooks/useSupabaseData';
import { Loader2, CheckCircle, XCircle, Users, Calendar, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

// ─── Hooks ───

function useAttendanceByDate(batchId: string | null, date: string) {
  return useQuery({
    queryKey: ['attendance', batchId, date],
    queryFn: async () => {
      if (!batchId) return [];
      const { data, error } = await supabase.from('attendance').select('*').eq('batch_id', batchId).eq('date', date);
      if (error) throw error;
      return data;
    },
    enabled: !!batchId,
  });
}

function useTeacherAttendanceByDate(date: string) {
  return useQuery({
    queryKey: ['teacher_attendance', date],
    queryFn: async () => {
      const { data, error } = await supabase.from('teacher_attendance').select('*').eq('date', date);
      if (error) throw error;
      return data;
    },
  });
}

function useMarkAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (records: { student_id: string; student_name: string; batch_id: string; date: string; status: string }[]) => {
      if (records.length === 0) return;
      const { batch_id, date } = records[0];
      await supabase.from('attendance').delete().eq('batch_id', batch_id).eq('date', date);
      const { error } = await supabase.from('attendance').insert(records);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['attendance'] }); toast.success('Student attendance saved'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useMarkTeacherAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (records: { teacher_id: string; date: string; status: string }[]) => {
      if (records.length === 0) return;
      const { date } = records[0];
      // Delete existing for this date, then insert
      const teacherIds = records.map(r => r.teacher_id);
      for (const tid of teacherIds) {
        await supabase.from('teacher_attendance').delete().eq('teacher_id', tid).eq('date', date);
      }
      const { error } = await supabase.from('teacher_attendance').insert(records);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['teacher_attendance'] }); toast.success('Teacher attendance saved'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

function useAttendanceStats() {
  return useQuery({
    queryKey: ['attendance_stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('attendance').select('status');
      if (error) throw error;
      const present = data.filter(a => a.status === 'present').length;
      const absent = data.filter(a => a.status === 'absent').length;
      return { total: data.length, present, absent };
    },
  });
}

// ─── Page ───

export default function AttendancePage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const isTeacher = user?.role === 'teacher';
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: allStudents, isLoading: studentsLoading } = useStudents();
  const { data: teachers, isLoading: teachersLoading } = useTeachers();
  const { data: stats, isLoading: statsLoading } = useAttendanceStats();

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherDate, setTeacherDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: existingAttendance, isLoading: attendanceLoading } = useAttendanceByDate(selectedBatchId || null, selectedDate);
  const { data: existingTeacherAttendance } = useTeacherAttendanceByDate(teacherDate);
  const markAttendance = useMarkAttendance();
  const markTeacherAttendance = useMarkTeacherAttendance();

  // Students in selected batch
  const batchStudents = useMemo(() => {
    if (!selectedBatchId || !allStudents) return [];
    return allStudents.filter(s => s.batch_id === selectedBatchId && s.is_active);
  }, [selectedBatchId, allStudents]);

  // Student attendance map
  const [studentMap, setStudentMap] = useState<Record<string, string>>({});
  useMemo(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const map: Record<string, string> = {};
      existingAttendance.forEach(a => { if (a.student_id) map[a.student_id] = a.status; });
      setStudentMap(map);
    } else if (existingAttendance && existingAttendance.length === 0 && batchStudents.length > 0) {
      const map: Record<string, string> = {};
      batchStudents.forEach(s => { map[s.id] = 'present'; });
      setStudentMap(map);
    }
  }, [existingAttendance, batchStudents]);

  // Teacher attendance map
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  useMemo(() => {
    if (existingTeacherAttendance && teachers) {
      const map: Record<string, string> = {};
      teachers.forEach(t => { map[t.id] = 'present'; });
      existingTeacherAttendance.forEach(a => { map[a.teacher_id] = a.status; });
      setTeacherMap(map);
    } else if (teachers) {
      const map: Record<string, string> = {};
      teachers.forEach(t => { map[t.id] = 'present'; });
      setTeacherMap(map);
    }
  }, [existingTeacherAttendance, teachers]);

  const toggleStudentStatus = (id: string) => {
    setStudentMap(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : prev[id] === 'absent' ? 'late' : 'present' }));
  };

  const toggleTeacherStatus = (id: string) => {
    setTeacherMap(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : prev[id] === 'absent' ? 'late' : 'present' }));
  };

  const handleSaveStudents = () => {
    if (!selectedBatchId) return;
    const records = batchStudents.map(s => ({
      student_id: s.id,
      student_name: `${s.first_name} ${s.last_name}`,
      batch_id: selectedBatchId,
      date: selectedDate,
      status: studentMap[s.id] || 'present',
    }));
    markAttendance.mutate(records);
  };

  const handleSaveTeachers = () => {
    if (!teachers) return;
    const records = teachers.map(t => ({
      teacher_id: t.id,
      date: teacherDate,
      status: teacherMap[t.id] || 'present',
    }));
    markTeacherAttendance.mutate(records);
  };

  const isLoading = batchesLoading || studentsLoading || statsLoading || teachersLoading;
  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const sPresentCount = Object.values(studentMap).filter(s => s === 'present').length;
  const sAbsentCount = Object.values(studentMap).filter(s => s === 'absent').length;
  const tPresentCount = Object.values(teacherMap).filter(s => s === 'present').length;
  const tAbsentCount = Object.values(teacherMap).filter(s => s === 'absent').length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>

      {/* Overall stats — Owner only */}
      {isOwner && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total Records" value={stats?.total ?? 0} color="bg-primary/10 text-primary" />
          <StatCard icon={CheckCircle} label="Present" value={stats?.present ?? 0} color="bg-success/10 text-success" />
          <StatCard icon={XCircle} label="Absent" value={stats?.absent ?? 0} color="bg-destructive/10 text-destructive" />
          <StatCard icon={UserCheck} label="Teachers" value={teachers?.length ?? 0} color="bg-accent/10 text-accent" />
        </div>
      )}

      {/* Teacher Attendance — Owner only */}
      {isOwner && (
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-accent" /> Teacher Attendance
            </h3>
            <input type="date" value={teacherDate} onChange={e => setTeacherDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
          </div>

          {(teachers ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No teachers found</p>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-3 text-sm">
                <span className="text-success font-medium">Present: {tPresentCount}</span>
                <span className="text-destructive font-medium">Absent: {tAbsentCount}</span>
                <span className="text-muted-foreground">/ {teachers?.length ?? 0} teachers</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {(teachers ?? []).map((teacher, i) => {
                  const p = (teacher as any).profiles;
                  const status = teacherMap[teacher.id] || 'present';
                  return (
                    <motion.div key={teacher.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {p?.first_name?.[0]}{p?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p?.first_name} {p?.last_name}</p>
                          <p className="text-xs text-muted-foreground">{teacher.employee_id}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleTeacherStatus(teacher.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
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

              <button onClick={handleSaveTeachers} disabled={markTeacherAttendance.isPending}
                className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {markTeacherAttendance.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Teacher Attendance
              </button>
            </>
          )}
        </div>
      )}

      {/* Student Attendance */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-display font-semibold text-foreground mb-4">Student Attendance</h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="flex-1">
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Batch</label>
            <select value={selectedBatchId} onChange={e => setSelectedBatchId(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="">Select batch</option>
              {(batches ?? []).map(b => (
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
            <div className="flex items-center gap-4 mb-4 text-sm">
              <span className="text-success font-medium">Present: {sPresentCount}</span>
              <span className="text-destructive font-medium">Absent: {sAbsentCount}</span>
              <span className="text-muted-foreground">/ {batchStudents.length} students</span>
            </div>

            <div className="space-y-2">
              {batchStudents.map((student, i) => {
                const status = studentMap[student.id] || 'present';
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
                    <button onClick={() => toggleStudentStatus(student.id)}
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

            <button onClick={handleSaveStudents} disabled={markAttendance.isPending}
              className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {markAttendance.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Student Attendance
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
