import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBatches, useCreateBatch, useTeachers } from '@/hooks/useSupabaseData';
import { Plus, Users, Calendar, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const statusColors: Record<string, string> = {
  upcoming: 'bg-warning/10 text-warning',
  ongoing: 'bg-success/10 text-success',
  completed: 'bg-muted text-muted-foreground',
};

export default function BatchesPage() {
  const { data: batches, isLoading } = useBatches();
  
  const { data: teachers } = useTeachers();
  const createBatch = useCreateBatch();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', start_date: '', end_date: '', max_students: '30', teacher_id: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBatch.mutate(
      { name: form.name, start_date: form.start_date, end_date: form.end_date, max_students: parseInt(form.max_students) || 30, ...(form.teacher_id ? { teacher_id: form.teacher_id } : {}) },
      { onSuccess: () => { setOpen(false); setForm({ name: '', start_date: '', end_date: '', max_students: '30', teacher_id: '' }); } }
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Batches</h1>
          <p className="text-muted-foreground">Manage course batches</p>
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
                <div><Label>Batch Name *</Label><Input required value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Batch A - Morning" /></div>
                <div>
                  <Label>Teacher</Label>
                  <select value={form.teacher_id} onChange={e => setForm(p => ({ ...p, teacher_id: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <option value="">Select teacher (optional)</option>
                    {(teachers ?? []).map(t => <option key={t.id} value={t.id}>{(t as any).profiles?.first_name} {(t as any).profiles?.last_name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Start Date *</Label><Input required type="date" value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} /></div>
                  <div><Label>End Date *</Label><Input required type="date" value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} /></div>
                </div>
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
          {(batches ?? []).map((batch, i) => (
            <motion.div key={batch.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-display font-semibold text-foreground">{batch.name}</h3>
                  <p className="text-xs text-muted-foreground">Teacher: {(batch as any).teachers?.profiles?.first_name ? `${(batch as any).teachers.profiles.first_name} ${(batch as any).teachers.profiles.last_name}` : 'Unassigned'}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[batch.status] || statusColors.upcoming}`}>
                  {batch.status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1"><Calendar className="w-3.5 h-3.5" /></div>
                  <p className="text-sm font-semibold text-foreground">{batch.start_date}</p>
                  <p className="text-xs text-muted-foreground">Start</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /></div>
                  <p className="text-sm font-semibold text-foreground">{batch.current_students}/{batch.max_students}</p>
                  <p className="text-xs text-muted-foreground">Students</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
