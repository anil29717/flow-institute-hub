import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBatches, useCreateBatch, useDeleteBatch, useTeachers } from '@/hooks/useSupabaseData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Clock, Loader2, Trash2, Users, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function BatchesPage() {
  const { data: batches, isLoading } = useBatches();
  const { data: teachers } = useTeachers();
  const createBatch = useCreateBatch();
  const deleteBatch = useDeleteBatch();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', timing: '', teacher_id: '', max_students: '30' });
  const [selectedBatch, setSelectedBatch] = useState<{ id: string; name: string } | null>(null);

  const { data: batchStudents, isLoading: studentsLoading } = useQuery({
    queryKey: ['batch_students', selectedBatch?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, first_name, last_name, phone, email, fee_status, is_active')
        .eq('batch_id', selectedBatch!.id)
        .order('first_name');
      if (error) throw error;
      return data;
    },
    enabled: !!selectedBatch?.id,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // We still need start_date/end_date for DB — use today as placeholder
    const today = new Date().toISOString().split('T')[0];
    createBatch.mutate(
      {
        name: form.name,
        start_date: today,
        end_date: today,
        max_students: parseInt(form.max_students) || 30,
        status: 'ongoing',
        ...(form.teacher_id ? { teacher_id: form.teacher_id } : {}),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ name: '', timing: '', teacher_id: '', max_students: '30' });
        },
      }
    );
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete batch "${name}"?`)) return;
    deleteBatch.mutate(id);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Batches</h1>
          <p className="text-muted-foreground">Manage your batches</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Create Batch
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Create New Batch</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-3">
                <div><Label>Batch Name *</Label><Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Batch A" /></div>
                <div>
                  <Label>Teacher</Label>
                  <select value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select teacher (optional)</option>
                    {(teachers ?? []).map(t => <option key={t.id} value={t.id}>{(t as any).profiles?.first_name} {(t as any).profiles?.last_name}</option>)}
                  </select>
                </div>
                <div><Label>Timing</Label><Input value={form.timing} onChange={e => setForm(p => ({ ...p, timing: e.target.value }))} placeholder="e.g. 9:00 AM - 11:00 AM" /></div>
                <div><Label>Max Students</Label><Input type="number" value={form.max_students} onChange={e => setForm(p => ({ ...p, max_students: e.target.value }))} /></div>
              </div>
              <button type="submit" disabled={createBatch.isPending}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
                {createBatch.isPending ? 'Creating...' : 'Create Batch'}
              </button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {(batches ?? []).length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No batches yet</p>
          <p className="text-sm mt-1">Create your first batch to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(batches ?? []).map((batch, i) => {
            const isActive = batch.status === 'ongoing';
            return (
              <motion.div key={batch.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedBatch({ id: batch.id, name: batch.name })}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{batch.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Teacher: {(batch as any).teachers?.profiles?.first_name ? `${(batch as any).teachers.profiles.first_name} ${(batch as any).teachers.profiles.last_name}` : 'Unassigned'}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{batch.start_date} — {batch.end_date}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> {batch.current_students}/{batch.max_students} students
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(batch.id, batch.name); }}
                    className="p-1.5 rounded-md text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Batch Students Dialog */}
      <Dialog open={!!selectedBatch} onOpenChange={(v) => { if (!v) setSelectedBatch(null); }}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students in {selectedBatch?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto -mx-6 px-6">
            {studentsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !batchStudents?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="font-medium">No students in this batch</p>
                <p className="text-sm mt-1">Add students from the Students page</p>
              </div>
            ) : (
              <div className="space-y-2 pb-2">
                <p className="text-sm text-muted-foreground mb-3">{batchStudents.length} student{batchStudents.length !== 1 ? 's' : ''}</p>
                {batchStudents.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                    <div>
                      <p className="font-medium text-sm text-foreground">{s.first_name} {s.last_name}</p>
                      <p className="text-xs text-muted-foreground">{s.phone || s.email || '—'}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.fee_status === 'paid' ? 'bg-success/10 text-success' :
                      s.fee_status === 'partial' ? 'bg-warning/10 text-warning' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {s.fee_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
