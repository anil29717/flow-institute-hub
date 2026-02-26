import { useState } from 'react';
import { motion } from 'framer-motion';
import { mockStudents } from '@/data/mockData';
import { Search, Plus, GraduationCap } from 'lucide-react';

const feeColors: Record<string, string> = {
  paid: 'bg-success/10 text-success',
  partial: 'bg-warning/10 text-warning',
  pending: 'bg-destructive/10 text-destructive',
};

export default function StudentsPage() {
  const [search, setSearch] = useState('');
  const filtered = mockStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">View and manage student records</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input type="text" placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Student</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Course</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Batch</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Fee Status</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Enrolled</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-bold text-xs">
                        {student.firstName[0]}{student.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{student.firstName} {student.lastName}</p>
                        <p className="text-xs text-muted-foreground">{student.studentId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <GraduationCap className="w-3.5 h-3.5" /> {student.courseName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{student.batchName}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${feeColors[student.feeStatus] || feeColors.pending}`}>
                      {student.feeStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{student.enrollmentDate}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      student.isActive ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                    }`}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
