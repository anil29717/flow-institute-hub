import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Building2, Users, GraduationCap, Plus, Loader2, X, Search, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const { data: institutes, isLoading: loadingInstitutes } = useQuery({
    queryKey: ['admin_institutes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('institutes')
        .select('*, profiles(first_name, last_name, email)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const [instRes, teacherRes] = await Promise.all([
        supabase.from('institutes').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
      ]);
      return {
        totalInstitutes: instRes.count ?? 0,
        totalTeachers: teacherRes.count ?? 0,
      };
    },
  });

  const filtered = (institutes ?? []).filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.code.toLowerCase().includes(search.toLowerCase())
  );

  const statCards = [
    { label: 'Total Institutes', value: stats?.totalInstitutes ?? 0, icon: Building2, color: 'stat-gradient-1' },
    { label: 'Total Teachers', value: stats?.totalTeachers ?? 0, icon: Users, color: 'stat-gradient-2' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all institutes and teachers</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Institute
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className={`${stat.color} rounded-xl p-5 text-primary-foreground`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search institutes..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {/* Institutes List */}
      {loadingInstitutes ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No institutes found</p>
          <p className="text-sm mt-1">Create your first institute to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((inst, i) => (
            <motion.div key={inst.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {inst.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{inst.name}</p>
                    <p className="text-xs text-muted-foreground">{inst.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {inst.is_approved ? (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-success/10 text-success">
                      <CheckCircle className="w-3 h-3" /> Approved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning">
                      <XCircle className="w-3 h-3" /> Pending
                    </span>
                  )}
                </div>
              </div>
              {inst.address && <p className="text-sm text-muted-foreground mb-2">{inst.address}</p>}
              {inst.email && <p className="text-xs text-muted-foreground mb-1">📧 {inst.email}</p>}
              {inst.phone && <p className="text-xs text-muted-foreground">📞 {inst.phone}</p>}
              <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                Created {new Date(inst.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && <AddInstituteModal onClose={() => setShowForm(false)} />}
      </AnimatePresence>
    </div>
  );
}

function AddInstituteModal({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    instituteName: '', code: '', address: '', phone: '', instituteEmail: '',
    ownerEmail: '', ownerPassword: '', ownerFirstName: '', ownerLastName: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await supabase.functions.invoke('create-institute', { body: form });
      if (res.error) throw res.error;
      if (res.data?.error) throw new Error(res.data.error);

      toast.success(`Institute "${form.instituteName}" created! Owner can login with ${form.ownerEmail}`);
      qc.invalidateQueries({ queryKey: ['admin_institutes'] });
      qc.invalidateQueries({ queryKey: ['admin_stats'] });
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create institute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-foreground/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card rounded-xl border border-border p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display font-bold text-foreground">Add New Institute</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground border-b border-border pb-2">Institute Details</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Institute Name" value={form.instituteName} onChange={set('instituteName')} required />
            <FormField label="Code" value={form.code} onChange={set('code')} required placeholder="e.g. INST-001" />
          </div>
          <FormField label="Address" value={form.address} onChange={set('address')} placeholder="Optional" />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Institute Email" type="email" value={form.instituteEmail} onChange={set('instituteEmail')} placeholder="Optional" />
            <FormField label="Institute Phone" value={form.phone} onChange={set('phone')} placeholder="Optional" />
          </div>

          <p className="text-sm font-medium text-muted-foreground border-b border-border pb-2 pt-2">Owner Account</p>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="First Name" value={form.ownerFirstName} onChange={set('ownerFirstName')} required />
            <FormField label="Last Name" value={form.ownerLastName} onChange={set('ownerLastName')} required />
          </div>
          <FormField label="Owner Email" type="email" value={form.ownerEmail} onChange={set('ownerEmail')} required />
          <FormField label="Owner Password" type="password" value={form.ownerPassword} onChange={set('ownerPassword')} required minLength={6} placeholder="Min 6 characters" />

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Institute
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function FormField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-1 block">{label}</label>
      <input {...props}
        className="w-full px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
