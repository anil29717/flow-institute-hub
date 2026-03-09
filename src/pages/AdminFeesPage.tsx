import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { IndianRupee, Search, Loader2 } from 'lucide-react';

export default function AdminFeesPage() {
  const [search, setSearch] = useState('');
  const [instituteFilter, setInstituteFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [institutes, setInstitutes] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [instRes, feesRes] = await Promise.all([
          api.get('/institutes'),
          api.get('/fees')
        ]);
        setInstitutes(instRes);
        setPayments(feesRes);
      } catch (err) {
        console.error('Failed to fetch admin fees', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = payments.filter(p => {
    const s = p.studentId;
    if (instituteFilter && s?.instituteId?._id !== instituteFilter) return false;

    if (dateFrom || dateTo) {
      const pDate = p.paymentDate ? new Date(p.paymentDate) : new Date(p.createdAt);
      if (dateFrom && new Date(pDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(pDate) > new Date(dateTo)) return false;
    }

    const text = `${s?.firstName ?? ''} ${s?.lastName ?? ''} ${s?.studentId ?? ''} ${p.referenceNo ?? ''}`;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const totalAmount = filtered.reduce((sum, p) => sum + Number(p.amount || 0), 0);

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
          {institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
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
                  const s = p.studentId;
                  return (
                    <tr key={p._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground">{s?.firstName} {s?.lastName}</p>
                        <p className="text-xs text-muted-foreground">{s?.studentId}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{s?.instituteId?.name ?? '—'}</td>
                      <td className="px-4 py-3 font-medium text-foreground">₹{Number(p.amount).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground capitalize">{p.paymentMode}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.referenceNo ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(p.paymentDate || p.createdAt).toLocaleDateString()}</td>
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
