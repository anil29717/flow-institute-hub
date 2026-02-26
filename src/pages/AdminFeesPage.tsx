import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { IndianRupee, Search, Loader2 } from 'lucide-react';

export default function AdminFeesPage() {
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

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin_all_fees', instituteFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('fee_payments')
        .select('*, students(first_name, last_name, student_id, institute_id, institutes(name))')
        .order('payment_date', { ascending: false });
      if (dateFrom) query = query.gte('payment_date', dateFrom);
      if (dateTo) query = query.lte('payment_date', dateTo);
      const { data, error } = await query;
      if (error) throw error;
      // Filter by institute client-side since it's a nested relation
      if (instituteFilter) {
        return (data ?? []).filter((p: any) => p.students?.institute_id === instituteFilter);
      }
      return data;
    },
  });

  const filtered = (payments ?? []).filter(p => {
    const s = (p as any).students;
    const text = `${s?.first_name ?? ''} ${s?.last_name ?? ''} ${s?.student_id ?? ''} ${p.receipt_no ?? ''}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const totalAmount = filtered.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">All Fee Payments</h1>
        <p className="text-muted-foreground">View fee payments across all institutes</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search student, receipt..." value={search} onChange={e => setSearch(e.target.value)}
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

      {/* Summary */}
      <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <IndianRupee className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Collected</p>
          <p className="text-xl font-bold text-foreground">₹{totalAmount.toLocaleString()}</p>
        </div>
        <div className="ml-auto text-sm text-muted-foreground">{filtered.length} payments</div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <IndianRupee className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No fee payments found</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Institute</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mode</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Receipt</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const s = (p as any).students;
                  return (
                    <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{s?.first_name} {s?.last_name}</p>
                        <p className="text-xs text-muted-foreground">{s?.student_id}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s?.institutes?.name ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-foreground">₹{Number(p.amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">{p.payment_mode}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.receipt_no ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(p.payment_date).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border text-xs text-muted-foreground">
            Showing {filtered.length} payment{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
