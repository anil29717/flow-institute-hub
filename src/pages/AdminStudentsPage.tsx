import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GraduationCap, Search, Loader2, Filter } from 'lucide-react';

export default function AdminStudentsPage() {
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

  const { data: students, isLoading } = useQuery({
    queryKey: ['admin_all_students', instituteFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('students')
        .select('*, institutes(name), courses(name), batches(name)')
        .order('created_at', { ascending: false });
      if (instituteFilter) query = query.eq('institute_id', instituteFilter);
      if (dateFrom) query = query.gte('enrollment_date', dateFrom);
      if (dateTo) query = query.lte('enrollment_date', dateTo);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const filtered = (students ?? []).filter(s =>
    `${s.first_name} ${s.last_name} ${s.student_id} ${s.email ?? ''}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">All Students</h1>
        <p className="text-muted-foreground">View students across all institutes</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search name, ID, email..." value={search} onChange={e => setSearch(e.target.value)}
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
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No students found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Institute</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Course</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Batch</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Enrolled</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{s.first_name} {s.last_name}</p>
                        {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.student_id}</td>
                    <td className="px-4 py-3 text-muted-foreground">{(s as any).institutes?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{(s as any).courses?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{(s as any).batches?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.fee_status === 'paid' ? 'bg-success/10 text-success' :
                        s.fee_status === 'partial' ? 'bg-warning/10 text-warning' :
                        'bg-destructive/10 text-destructive'
                      }`}>{s.fee_status}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(s.enrollment_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        s.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                      }`}>{s.is_active ? 'Active' : 'Inactive'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
