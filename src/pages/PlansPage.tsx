import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Plus, Loader2, X, Edit2, Trash2, Users, GraduationCap, CalendarDays } from 'lucide-react';
import { toast } from 'sonner';

interface Plan {
  id: string;
  name: string;
  max_days: number;
  max_students: number;
  max_teachers: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export default function PlansPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const { data: plans, isLoading } = useQuery({
    queryKey: ['admin_plans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('price', { ascending: true });
      if (error) throw error;
      return data as Plan[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('plans').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Plan deleted');
      qc.invalidateQueries({ queryKey: ['admin_plans'] });
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete'),
  });

  const openEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingPlan(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Plans</h1>
          <p className="text-muted-foreground">Manage subscription plans for institutes</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !plans?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No plans yet</p>
          <p className="text-sm mt-1">Create your first plan to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(plan)} className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(plan.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarDays className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Validity</p>
                    <p className="font-semibold text-foreground">{plan.max_days} days</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Students</p>
                    <p className="font-semibold text-foreground">{plan.max_students}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-warning" />
                  </div>
                  <div>
                    <p className="text-muted-foreground">Max Teachers</p>
                    <p className="font-semibold text-foreground">{plan.max_teachers}</p>
                  </div>
                </div>
              </div>

              {!plan.is_active && (
                <div className="mt-3 px-2 py-1 rounded bg-muted text-muted-foreground text-xs text-center">Inactive</div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <PlanFormModal plan={editingPlan} onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}

function PlanFormModal({ plan, onClose }: { plan: Plan | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: plan?.name ?? '',
    max_days: plan?.max_days ?? 30,
    max_students: plan?.max_students ?? 10,
    max_teachers: plan?.max_teachers ?? 2,
    price: plan?.price ?? 0,
    is_active: plan?.is_active ?? true,
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (plan) {
        const { error } = await supabase.from('plans').update(form).eq('id', plan.id);
        if (error) throw error;
        toast.success('Plan updated');
      } else {
        const { error } = await supabase.from('plans').insert(form);
        if (error) throw error;
        toast.success('Plan created');
      }
      qc.invalidateQueries({ queryKey: ['admin_plans'] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">{plan ? 'Edit Plan' : 'Create Plan'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Plan Name" value={form.name} onChange={set('name')} required placeholder="e.g. Gold" />
          <Field label="Price (₹)" type="number" value={form.price} onChange={set('price')} required min={0} />
          <Field label="Validity (days)" type="number" value={form.max_days} onChange={set('max_days')} required min={1} />
          <Field label="Max Students" type="number" value={form.max_students} onChange={set('max_students')} required min={1} />
          <Field label="Max Teachers" type="number" value={form.max_teachers} onChange={set('max_teachers')} required min={1} />

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={form.is_active} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-input" />
            Active
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {plan ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <input {...props}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
