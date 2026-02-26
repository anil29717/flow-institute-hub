import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStudents, useCreateStudent, useBatches, useInstitute } from '@/hooks/useSupabaseData';
import { usePlanLimits } from '@/hooks/usePlanLimits';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Loader2, X, CalendarIcon, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const feeColors: Record<string, string> = {
  paid: 'bg-success/10 text-success',
  partial: 'bg-warning/10 text-warning',
  pending: 'bg-destructive/10 text-destructive',
};

const defaultForm = { first_name: '', last_name: '', email: '', phone: '', guardian_name: '', guardian_phone: '', batch_id: '', class: '', school: '', total_fee: '', enrollment_date: '' };

export default function StudentsPage() {
  const { user } = useAuth();
  const { data: students, isLoading } = useStudents();
  const { data: batches } = useBatches();
  const { data: institute } = useInstitute(user?.instituteId ?? null);
  const { data: planLimits } = usePlanLimits();
  const createStudent = useCreateStudent();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const filtered = (students ?? []).filter(s =>
    `${s.first_name} ${s.last_name} ${s.student_id}`.toLowerCase().includes(search.toLowerCase())
  );

  const generateStudentId = (firstName: string) => {
    const prefix = (institute?.code || 'INST').toUpperCase().slice(0, 4);
    const namePart = firstName.toUpperCase().slice(0, 3);
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${namePart}-${rand}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.instituteId) {
      toast.error('No institute linked to your account. Please re-login.');
      return;
    }
    if (planLimits?.hasPlan && !planLimits.canAddStudent) {
      toast.error(planLimits.isExpired ? 'Your plan has expired. Contact admin.' : `Student limit reached (${planLimits.maxStudents}). Upgrade your plan.`);
      return;
    }
    const studentId = generateStudentId(form.first_name);
    createStudent.mutate(
      {
        student_id: studentId, first_name: form.first_name, last_name: form.last_name,
        email: form.email || undefined, phone: form.phone || undefined,
        guardian_name: form.guardian_name || undefined, guardian_phone: form.guardian_phone || undefined,
        batch_id: form.batch_id || undefined, class: form.class || undefined, school: form.school || undefined,
        total_fee: form.total_fee ? parseFloat(form.total_fee) : undefined,
        enrollment_date: form.enrollment_date || undefined, institute_id: user.instituteId,
      },
      { onSuccess: () => { setOpen(false); setForm(defaultForm); } }
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">View and manage student records</p>
        </div>
        <Dialog open={open} onOpenChange={v => {
          if (v && planLimits?.hasPlan && !planLimits.canAddStudent) {
            toast.error(planLimits.isExpired ? 'Your plan has expired.' : `Student limit reached (${planLimits.maxStudents}). Upgrade your plan.`);
            return;
          }
          setOpen(v);
        }}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>First Name *</Label><Input required value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} /></div>
                <div><Label>Last Name *</Label><Input required value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Class</Label><Input value={form.class} onChange={e => setForm(p => ({ ...p, class: e.target.value }))} placeholder="e.g. 10th, 12th" /></div>
                <div><Label>School</Label><Input value={form.school} onChange={e => setForm(p => ({ ...p, school: e.target.value }))} /></div>
                <div><Label>Guardian Name</Label><Input value={form.guardian_name} onChange={e => setForm(p => ({ ...p, guardian_name: e.target.value }))} /></div>
                <div><Label>Guardian Phone</Label><Input value={form.guardian_phone} onChange={e => setForm(p => ({ ...p, guardian_phone: e.target.value }))} /></div>
                <div>
                  <Label>Batch</Label>
                  <select value={form.batch_id} onChange={e => setForm(p => ({ ...p, batch_id: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select batch</option>
                    {(batches ?? []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div><Label>Joining Date</Label><Input type="date" value={form.enrollment_date} onChange={e => setForm(p => ({ ...p, enrollment_date: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Total Fee (₹)</Label><Input type="number" value={form.total_fee} onChange={e => setForm(p => ({ ...p, total_fee: e.target.value }))} placeholder="e.g. 25000" /></div>
              </div>
              <p className="text-xs text-muted-foreground">Student ID: <span className="font-mono font-medium text-foreground">{form.first_name ? generateStudentId(form.first_name) : 'INST-XXX-0000'}</span></p>
              <button type="submit" disabled={createStudent.isPending}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {createStudent.isPending ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan usage banner */}
      {planLimits?.hasPlan && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
          planLimits.isExpired ? 'bg-destructive/10 border-destructive/30 text-destructive' :
          !planLimits.canAddStudent ? 'bg-warning/10 border-warning/30 text-warning' :
          'bg-muted border-border text-muted-foreground'
        }`}>
          {(planLimits.isExpired || !planLimits.canAddStudent) && <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
          <span>
            <strong>{planLimits.planName}</strong> plan — {planLimits.currentStudents}/{planLimits.maxStudents} students used
            {planLimits.isExpired && ' · Plan expired'}
          </span>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No students yet</p>
          <p className="text-sm mt-1">Add your first student to get started</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Batch</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Class / School</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, i) => (
                  <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{student.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-muted-foreground">{(student as any).batches?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {(student as any).class || '—'} {(student as any).school ? `/ ${(student as any).school}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${feeColors[student.fee_status] || feeColors.pending}`}>
                        {student.fee_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{student.enrollment_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        student.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>
                        {student.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
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
  const { data: attendance, isLoading } = useQuery({
    queryKey: ['student_attendance_history', student.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_id', student.id)
        .order('date', { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const presentCount = attendance?.filter(a => a.status === 'present').length ?? 0;
  const absentCount = attendance?.filter(a => a.status === 'absent').length ?? 0;
  const lateCount = attendance?.filter(a => a.status === 'late').length ?? 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-display font-bold text-foreground">Student Details</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-lg">
            {student.first_name[0]}{student.last_name[0]}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{student.first_name} {student.last_name}</p>
            <p className="text-sm text-muted-foreground font-mono">{student.student_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <InfoItem label="Email" value={student.email || '—'} />
          <InfoItem label="Phone" value={student.phone || '—'} />
          <InfoItem label="Class" value={student.class || '—'} />
          <InfoItem label="School" value={student.school || '—'} />
          <InfoItem label="Guardian" value={student.guardian_name || '—'} />
          <InfoItem label="Guardian Phone" value={student.guardian_phone || '—'} />
          <InfoItem label="Batch" value={(student as any).batches?.name || '—'} />
          <InfoItem label="Enrolled" value={student.enrollment_date} />
          <InfoItem label="Total Fee" value={`₹${Number(student.total_fee || 0).toLocaleString()}`} />
          <InfoItem label="Fee Paid" value={`₹${Number(student.fee_paid || 0).toLocaleString()}`} />
        </div>

        {/* Attendance */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Attendance (Last 30 records)</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-success/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-success">{presentCount}</p><p className="text-xs text-muted-foreground">Present</p></div>
            <div className="bg-destructive/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-destructive">{absentCount}</p><p className="text-xs text-muted-foreground">Absent</p></div>
            <div className="bg-warning/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-warning">{lateCount}</p><p className="text-xs text-muted-foreground">Late</p></div>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : (attendance?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">No attendance records yet.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {attendance?.map(a => (
                <div key={a.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 text-sm">
                  <span className="text-foreground">{a.date}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    a.status === 'present' ? 'bg-success/10 text-success' :
                    a.status === 'absent' ? 'bg-destructive/10 text-destructive' :
                    'bg-warning/10 text-warning'
                  }`}>{a.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">{label}</span>
      <p className="text-sm font-medium text-foreground truncate">{value}</p>
    </div>
  );
}
