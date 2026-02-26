import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Users, Search, Loader2 } from 'lucide-react';

export default function AdminTeachersPage() {
  const [search, setSearch] = useState('');
  const [instituteFilter, setInstituteFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data: institutes } = useQuery({
    queryKey: ['admin_institutes_list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('institutes').select('id, name').order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['admin_all_teachers', instituteFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('teachers')
        .select('*, profiles(first_name, last_name, email, phone), institutes(name)')
        .order('created_at', { ascending: false });
      if (instituteFilter) query = query.eq('institute_id', instituteFilter);
      if (dateFrom) query = query.gte('join_date', dateFrom);
      if (dateTo) query = query.lte('join_date', dateTo);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filtered = (teachers ?? []).filter(t => {
    const p = (t as any).profiles;
    const text = `${p?.first_name ?? ''} ${p?.last_name ?? ''} ${p?.email ?? ''} ${t.employee_id}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">All Teachers</h1>
        <p className="text-muted-foreground">View teachers across all institutes</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search name, email, ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
        </div>
        <select value={instituteFilter} onChange={e => setInstituteFilter(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring">
          <option value="">All Institutes</option>
          {(institutes ?? []).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
          className="px-3 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No teachers found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Teacher</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Institute</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Specialization</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Salary</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Join Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const p = (t as any).profiles;
                  return (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{p?.first_name} {p?.last_name}</p>
                          {p?.email && <p className="text-xs text-muted-foreground">{p.email}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{t.employee_id}</td>
                      <td className="px-4 py-3 text-muted-foreground">{(t as any).institutes?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{(t.specialization ?? []).join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-foreground font-medium">₹{t.salary_amount ?? 0}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(t.join_date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} teacher{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
