import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle, XCircle, Users, Calendar, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AttendancePage() {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';

  const [batches, setBatches] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [teacherDate, setTeacherDate] = useState(new Date().toISOString().split('T')[0]);

  const [existingAttendance, setExistingAttendance] = useState<any[]>([]);
  const [existingTeacherAttendance, setExistingTeacherAttendance] = useState<any[]>([]);

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingStudents, setSavingStudents] = useState(false);
  const [savingTeachers, setSavingTeachers] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [bRes, sRes, tRes, attRes] = await Promise.all([
        api.get('/batches'),
        api.get('/students'),
        isOwner ? api.get('/teachers') : Promise.resolve([]),
        api.get('/attendance')
      ]);
      setBatches(bRes);
      setAllStudents(sRes);
      if (isOwner) setTeachers(tRes);

      // compute global stats manually from API response as no dedicated stats EP right now
      const present = attRes.filter((a: any) => a.status === 'present').length;
      const absent = attRes.filter((a: any) => a.status === 'absent').length;
      setStats({ total: attRes.length, present, absent });
    } catch (e: any) {
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBatchId && selectedDate) {
      api.get(`/attendance?batchId=${selectedBatchId}&date=${selectedDate}`).then(res => {
        // we filter manually just in case api does not honor query param yet
        const filtered = Array.isArray(res) ? res.filter(a => a.batchId === selectedBatchId && (new Date(a.date).toISOString().split('T')[0] === selectedDate)) : [];
        setExistingAttendance(filtered);
      }).catch(() => setExistingAttendance([]));
    }
  }, [selectedBatchId, selectedDate]);

  useEffect(() => {
    if (teacherDate && isOwner) {
      // No teacher attendance endpoint exists in current backend (just student attendance). 
      // We will fallback to empty array for now logic-wise to avoid crash
      setExistingTeacherAttendance([]);
    }
  }, [teacherDate, isOwner]);


  // Students in selected batch
  const batchStudents = useMemo(() => {
    if (!selectedBatchId || !allStudents) return [];
    return allStudents.filter(s => (s.batchId?.id || s.batchId?._id) === selectedBatchId && s.isActive);
  }, [selectedBatchId, allStudents]);

  // Student attendance map
  const [studentMap, setStudentMap] = useState<Record<string, string>>({});
  useEffect(() => {
    if (existingAttendance && existingAttendance.length > 0) {
      const map: Record<string, string> = {};
      existingAttendance.forEach(a => { if (a.studentId?.id || a.studentId?._id) map[a.studentId.id || a.studentId._id] = a.status; });
      setStudentMap(map);
    } else if (existingAttendance && existingAttendance.length === 0 && batchStudents.length > 0) {
      const map: Record<string, string> = {};
      batchStudents.forEach(s => { map[s.id || s._id] = 'present'; });
      setStudentMap(map);
    }
  }, [existingAttendance, batchStudents]);

  // Teacher attendance map
  const [teacherMap, setTeacherMap] = useState<Record<string, string>>({});
  useEffect(() => {
    if (existingTeacherAttendance && teachers.length > 0) {
      const map: Record<string, string> = {};
      teachers.forEach(t => { map[t.id || t._id] = 'present'; });
      existingTeacherAttendance.forEach(a => { map[a.teacherId] = a.status; });
      setTeacherMap(map);
    } else if (teachers.length > 0) {
      const map: Record<string, string> = {};
      teachers.forEach(t => { map[t.id || t._id] = 'present'; });
      setTeacherMap(map);
    }
  }, [existingTeacherAttendance, teachers]);

  const toggleStudentStatus = (id: string) => {
    setStudentMap(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : prev[id] === 'absent' ? 'late' : 'present' }));
  };

  const toggleTeacherStatus = (id: string) => {
    setTeacherMap(prev => ({ ...prev, [id]: prev[id] === 'present' ? 'absent' : prev[id] === 'absent' ? 'late' : 'present' }));
  };

  const handleSaveStudents = async () => {
    if (!selectedBatchId) return;
    setSavingStudents(true);

    // Instead of bulk save loop that deletes and reinserts, we'd need a multi-mark endpoint or loop them
    // API current just has POST /attendance that expects single object. We will simulate bulk with Promise.all
    try {
      const promises = batchStudents.map(s => api.post('/attendance', {
        studentId: s.id || s._id,
        batchId: selectedBatchId,
        date: selectedDate,
        status: studentMap[s.id || s._id] || 'present'
      }));
      await Promise.all(promises);
      toast.success('Student attendance saved!');
    } catch (e: any) {
      toast.error('Failed to save student attendance');
    } finally {
      setSavingStudents(false);
    }
  };

  const handleSaveTeachers = async () => {
    if (!teachers) return;
    // We don't have a teacher attendance API route in Node yet.
    toast.error('Teacher attendance saving is not yet implemented on the backend API');
  };

  if (loading) {
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
                  const status = teacherMap[teacher.id || teacher._id] || 'present';
                  return (
                    <motion.div key={teacher.id || teacher._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{teacher.firstName} {teacher.lastName}</p>
                          <p className="text-xs text-muted-foreground">{teacher.employeeId}</p>
                        </div>
                      </div>
                      <button onClick={() => toggleTeacherStatus(teacher.id || teacher._id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${status === 'present' ? 'bg-success/10 text-success hover:bg-success/20' :
                          status === 'absent' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' :
                            'bg-warning/10 text-warning hover:bg-warning/20'
                          }`}>
                        {status === 'present' ? '✓ Present' : status === 'absent' ? '✗ Absent' : '⏱ Late'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              <button onClick={handleSaveTeachers} disabled={savingTeachers}
                className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
                {savingTeachers && <Loader2 className="w-4 h-4 animate-spin" />}
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
              {batches.map(b => (
                <option key={b.id || b._id} value={b.id || b._id}>
                  {b.name} — {b.teacherId ? `${b.teacherId.firstName} ${b.teacherId.lastName}` : 'No teacher'}
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
                const status = studentMap[student.id || student._id] || 'present';
                return (
                  <motion.div key={student.id || student._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{student.studentId}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleStudentStatus(student.id || student._id)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${status === 'present' ? 'bg-success/10 text-success hover:bg-success/20' :
                        status === 'absent' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' :
                          'bg-warning/10 text-warning hover:bg-warning/20'
                        }`}>
                      {status === 'present' ? '✓ Present' : status === 'absent' ? '✗ Absent' : '⏱ Late'}
                    </button>
                  </motion.div>
                );
              })}
            </div>

            <button onClick={handleSaveStudents} disabled={savingStudents}
              className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
              {savingStudents && <Loader2 className="w-4 h-4 animate-spin" />}
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
