import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Loader2, X, CalendarIcon, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';

const feeColors: Record<string, string> = {
  paid: 'bg-success/10 text-success',
  partial: 'bg-warning/10 text-warning',
  pending: 'bg-destructive/10 text-destructive',
};

const defaultForm = { firstName: '', lastName: '', email: '', phone: '', guardianName: '', guardianPhone: '', batchId: '', class: '', school: '', totalFees: '', enrollmentDate: '' };

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [institute, setInstitute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, bRes, iRes] = await Promise.all([
        api.get('/students'),
        api.get('/batches'),
        api.get('/institutes/my-institute')
      ]);
      setStudents(sRes);
      setBatches(bRes);
      setInstitute(iRes);
    } catch (e: any) {
      toast.error('Failed to load data: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    `${s.firstName} ${s.lastName} ${s.studentId}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await api.post('/students', {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        guardianName: form.guardianName || undefined,
        guardianPhone: form.guardianPhone || undefined,
        batchId: form.batchId || undefined,
        class: form.class || undefined,
        school: form.school || undefined,
        totalFees: form.totalFees ? parseFloat(form.totalFees) : undefined,
        enrollmentDate: form.enrollmentDate ? new Date(form.enrollmentDate) : new Date()
      });
      toast.success('Student added successfully!');
      setOpen(false);
      setForm(defaultForm);
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'Failed to add student');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Plan logic simulated based on institute object
  const planLimits = institute?.planId ? {
    hasPlan: true,
    planName: institute.planId.name,
    maxStudents: institute.planId.maxStudents,
    currentStudents: students.length,
    canAddStudent: students.length < institute.planId.maxStudents,
    isExpired: new Date(institute.planExpiresAt) < new Date()
  } : null;

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
                <div><Label>First Name *</Label><Input required value={form.firstName} onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} /></div>
                <div><Label>Last Name *</Label><Input required value={form.lastName} onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Class</Label><Input value={form.class} onChange={e => setForm(p => ({ ...p, class: e.target.value }))} placeholder="e.g. 10th, 12th" /></div>
                <div><Label>School</Label><Input value={form.school} onChange={e => setForm(p => ({ ...p, school: e.target.value }))} /></div>
                <div><Label>Guardian Name</Label><Input value={form.guardianName} onChange={e => setForm(p => ({ ...p, guardianName: e.target.value }))} /></div>
                <div><Label>Guardian Phone</Label><Input value={form.guardianPhone} onChange={e => setForm(p => ({ ...p, guardianPhone: e.target.value }))} /></div>
                <div>
                  <Label>Batch</Label>
                  <select value={form.batchId} onChange={e => setForm(p => ({ ...p, batchId: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select batch</option>
                    {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                  </select>
                </div>
                <div><Label>Joining Date</Label><Input type="date" value={form.enrollmentDate} onChange={e => setForm(p => ({ ...p, enrollmentDate: e.target.value }))} /></div>
                <div className="col-span-2"><Label>Total Fee (₹)</Label><Input type="number" value={form.totalFees} onChange={e => setForm(p => ({ ...p, totalFees: e.target.value }))} placeholder="e.g. 25000" /></div>
              </div>
              <button type="submit" disabled={adding}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 mt-4">
                {adding ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plan usage banner */}
      {planLimits?.hasPlan && (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${planLimits.isExpired ? 'bg-destructive/10 border-destructive/30 text-destructive' :
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
                  <motion.tr key={student._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedStudent(student)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                          {student.firstName[0]}{student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{student.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-muted-foreground">{student.batchId?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {student.class || '—'} {student.school ? `/ ${student.school}` : ''}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${feeColors[student.feeStatus] || feeColors.pending}`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {student.enrollmentDate ? format(new Date(student.enrollmentDate), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${student.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>
                        {student.isActive ? 'Active' : 'Inactive'}
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
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loadingObj, setLoading] = useState(true);

  useEffect(() => {
    api.get('/attendance')
      // Typically you'd filter by student ID via backend, we'll fetch all and filter client side for brevity given current API payload
      .then(data => {
        const myAtt = data.filter((a: any) => a.studentId?._id === student._id);
        setAttendance(myAtt);
      })
      .finally(() => setLoading(false));
  }, [student]);

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const absentCount = attendance.filter(a => a.status === 'absent').length;
  const lateCount = attendance.filter(a => a.status === 'late').length;

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
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div>
            <p className="text-lg font-semibold text-foreground">{student.firstName} {student.lastName}</p>
            <p className="text-sm text-muted-foreground font-mono">{student.studentId}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <InfoItem label="Email" value={student.email || '—'} />
          <InfoItem label="Phone" value={student.phone || '—'} />
          <InfoItem label="Class" value={student.class || '—'} />
          <InfoItem label="School" value={student.school || '—'} />
          <InfoItem label="Guardian" value={student.guardianName || '—'} />
          <InfoItem label="Guardian Phone" value={student.guardianPhone || '—'} />
          <InfoItem label="Batch" value={student.batchId?.name || '—'} />
          <InfoItem label="Enrolled" value={student.enrollmentDate ? format(new Date(student.enrollmentDate), 'MMM d, yyyy') : '—'} />
          <InfoItem label="Total Fee" value={`₹${Number(student.totalFees || 0).toLocaleString()}`} />
          <InfoItem label="Fee Paid" value={`₹${Number(student.feesPaid || 0).toLocaleString()}`} />
        </div>

        {/* Attendance */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2"><CalendarIcon className="w-4 h-4" /> Attendance (Historical)</h3>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="bg-success/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-success">{presentCount}</p><p className="text-xs text-muted-foreground">Present</p></div>
            <div className="bg-destructive/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-destructive">{absentCount}</p><p className="text-xs text-muted-foreground">Absent</p></div>
            <div className="bg-warning/10 rounded-lg p-2.5 text-center"><p className="text-lg font-bold text-warning">{lateCount}</p><p className="text-xs text-muted-foreground">Late</p></div>
          </div>
          {loadingObj ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
          ) : attendance.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-3">No attendance records yet.</p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {attendance.map(a => (
                <div key={a._id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted/30 text-sm">
                  <span className="text-foreground">{format(new Date(a.date), 'MMM d, yyyy')}</span>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${a.status === 'present' ? 'bg-success/10 text-success' :
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
