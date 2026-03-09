import { useState, useEffect } from 'react';
import { api } from '@/api/client';
import { GraduationCap, Search, Loader2 } from 'lucide-react';

export default function AdminStudentsPage() {
  const [search, setSearch] = useState('');
  const [instituteFilter, setInstituteFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [institutes, setInstitutes] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [instRes, studRes] = await Promise.all([
          api.get('/institutes'),
          api.get('/students')
        ]);
        setInstitutes(instRes);
        setStudents(studRes);
      } catch (e) {
        console.error('Failed to fetch admin students', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = students.filter(s => {
    if (instituteFilter && s.instituteId?._id !== instituteFilter) return false;

    if (dateFrom || dateTo) {
      const sDate = s.createdAt ? new Date(s.createdAt) : new Date();
      if (dateFrom && new Date(sDate) < new Date(dateFrom)) return false;
      if (dateTo && new Date(sDate) > new Date(dateTo)) return false;
    }

    return `${s.firstName} ${s.lastName} ${s.studentId} ${s.email ?? ''}`
      .toLowerCase().includes(search.toLowerCase());
  });

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
                  <tr key={s._id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{s.firstName} {s.lastName}</p>
                        {s.email && <p className="text-xs text-muted-foreground">{s.email}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.studentId}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.instituteId?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.courseId?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{s.batchId?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.feeStatus === 'paid' ? 'bg-success/10 text-success' :
                          s.feeStatus === 'partial' ? 'bg-warning/10 text-warning' :
                            'bg-destructive/10 text-destructive'
                        }`}>{s.feeStatus ?? 'pending'}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                        }`}>{s.isActive ? 'Active' : 'Inactive'}</span>
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
