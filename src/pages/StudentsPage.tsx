import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudents, useCreateStudent } from '@/hooks/useSupabaseData';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, GraduationCap, Loader2, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const feeColors: Record<string, string> = {
  paid: 'bg-success/10 text-success',
  partial: 'bg-warning/10 text-warning',
  pending: 'bg-destructive/10 text-destructive',
};

export default function StudentsPage() {
  const { user } = useAuth();
  const { data: students, isLoading } = useStudents();
  const createStudent = useCreateStudent();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ student_id: '', first_name: '', last_name: '', email: '', phone: '', guardian_name: '', guardian_phone: '' });

  const filtered = (students ?? []).filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.instituteId) return;
    createStudent.mutate(
      { ...form, institute_id: user.instituteId },
      { onSuccess: () => { setOpen(false); setForm({ student_id: '', first_name: '', last_name: '', email: '', phone: '', guardian_name: '', guardian_phone: '' }); } }
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Add Student
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add New Student</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Student ID *</Label><Input required value={form.student_id} onChange={e => setForm(p => ({ ...p, student_id: e.target.value }))} placeholder="STU-007" /></div>
                <div><Label>First Name *</Label><Input required value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} /></div>
                <div><Label>Last Name *</Label><Input required value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} /></div>
                <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
                <div><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
                <div><Label>Guardian Name</Label><Input value={form.guardian_name} onChange={e => setForm(p => ({ ...p, guardian_name: e.target.value }))} /></div>
                <div><Label>Guardian Phone</Label><Input value={form.guardian_phone} onChange={e => setForm(p => ({ ...p, guardian_phone: e.target.value }))} /></div>
              </div>
              <button type="submit" disabled={createStudent.isPending}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {createStudent.isPending ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Course</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Batch</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Enrolled</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student, i) => (
                  <motion.tr key={student.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                          {student.first_name[0]}{student.last_name[0]}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
                          <p className="text-xs text-muted-foreground">{student.student_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <GraduationCap className="w-3.5 h-3.5" /> {(student as any).courses?.name || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{(student as any).batches?.name || '—'}</td>
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
    </div>
  );
}
