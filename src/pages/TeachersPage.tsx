import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTeachers } from '@/hooks/useSupabaseData';
import { Search, Plus, Mail, Phone, Loader2 } from 'lucide-react';

export default function TeachersPage() {
  const [search, setSearch] = useState('');
  const { data: teachers, isLoading } = useTeachers();

  const filtered = (teachers ?? []).filter(t => {
    const p = (t as any).profiles;
    if (!p) return false;
    return `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase());
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground">Manage your teaching staff</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search teachers..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-lg font-medium">No teachers found</p>
          <p className="text-sm mt-1">Add your first teacher to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher, i) => {
            const p = (teacher as any).profiles;
            return (
              <motion.div key={teacher.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {p?.first_name?.[0]}{p?.last_name?.[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{p?.first_name} {p?.last_name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.employee_id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${p?.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {p?.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-1">{teacher.qualification || 'No qualification listed'}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(teacher.specialization ?? []).map(s => (
                    <span key={s} className="px-2 py-0.5 text-xs rounded-md bg-accent/10 text-accent font-medium">{s}</span>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                  <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {p?.email}</span>
                </div>
                {p?.phone && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                    <Phone className="w-3.5 h-3.5" /> {p.phone}
                  </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                  <span>{teacher.experience_years ?? 0} yrs experience</span>
                  <span>Joined {teacher.join_date}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
