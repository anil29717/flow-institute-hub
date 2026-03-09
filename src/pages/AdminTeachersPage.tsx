import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { Users, Search, Loader2 } from 'lucide-react';

export default function AdminTeachersPage() {
  const [search, setSearch] = useState('');
  const [instituteFilter, setInstituteFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [institutes, setInstitutes] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Assuming admin can fetch all institutes and all teachers
        const [instRes, teachRes] = await Promise.all([
          api.get('/institutes'),
          api.get('/teachers')
        ]);
        setInstitutes(instRes);
        setTeachers(teachRes);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = teachers.filter(t => {
    if (instituteFilter && t.instituteId?._id !== instituteFilter && t.instituteName !== institutes.find(i => i._id === instituteFilter)?.name) return false;

    // Convert to Date for comparison
    if (dateFrom || dateTo) {
      // Using createdAt as join_date since we don't store join_date specifically on Teacher model or we can use createdAt
      // Let's assume it's stored in createdAt or similar if not specified
      const tDate = t.createdAt ? new Date(t.createdAt) : new Date();
      if (dateFrom && new Date(tDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(tDate) > new Date(dateTo)) return false;
    }

    const text = `${t.firstName ?? ''} ${t.lastName ?? ''} ${t.email ?? ''} ${t.employeeId ?? ''}`;
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
          {institutes.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
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
                  return (
                    <tr key={t.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-foreground">{t?.firstName} {t?.lastName}</p>
                          {t?.email && <p className="text-xs text-muted-foreground">{t.email}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{t.employeeId}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.instituteName ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{(t.specialization ?? []).join(', ') || '—'}</td>
                      <td className="px-4 py-3 text-foreground font-medium">₹{t.salary_amount ?? 0}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
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
