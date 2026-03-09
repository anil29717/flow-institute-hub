import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, GraduationCap, X, Users } from 'lucide-react';

function useTeacherStudents() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['teacher_students', user?.id],
    queryFn: async () => {
      if (!user?.id) return { batches: [], students: [] };

      const [batches, students] = await Promise.all([
        api.get('/batches').catch(() => []),
        api.get('/students').catch(() => [])
      ]);

      return { batches: batches || [], students: students || [] };
    },
    enabled: !!user?.id,
  });
}

export default function TeacherStudentsPage() {
  const { data, isLoading } = useTeacherStudents();
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const filtered = useMemo(() => {
    return (data?.students ?? []).filter((s: any) =>
      `${s.firstName} ${s.lastName} ${s.studentId}`.toLowerCase().includes(search.toLowerCase())
    );
  }, [data?.students, search]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Students</h1>
          <p className="text-muted-foreground">{data?.students.length ?? 0} students across {data?.batches.length ?? 0} batches</p>
        </div>
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <GraduationCap className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No students found.</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Batch</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Guardian</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student: any, i: number) => (
                  <motion.tr key={student._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden sm:table-cell">{student.studentId}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{student.batchId?.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{student.phone || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{student.guardianName || '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {selectedStudent && <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />}
      </AnimatePresence>
    </div>
  );
}

function StudentDetailModal({ student, onClose }: { student: any; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-bold text-foreground">{student.firstName} {student.lastName}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="space-y-3">
          <InfoRow label="Student ID" value={student.studentId} />
          <InfoRow label="Phone" value={student.phone || '—'} />
          <InfoRow label="Guardian" value={student.guardianName || '—'} />
          <InfoRow label="Guardian Phone" value={student.guardianPhone || '—'} />
          <InfoRow label="Batch" value={student.batchId?.name || '—'} />
          <InfoRow label="School" value={student.school || '—'} />
          <InfoRow label="Class" value={student.standard || student.class || '—'} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
