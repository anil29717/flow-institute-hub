import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/api/client';
import { useQuery } from '@tanstack/react-query';
import { Loader2, User, Mail, Phone, Briefcase, GraduationCap, Calendar, CheckCircle2 } from 'lucide-react';

function useTeacherProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['teacher_profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return api.get('/teachers/me');
    },
    enabled: !!user?.id,
  });
}

export default function TeacherProfilePage() {
  const { data, isLoading } = useTeacherProfile();

  if (isLoading || !data) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const { profile, teacher } = data;
  if (!profile) return <p className="text-muted-foreground text-center py-8">Profile not found.</p>;

  // Ensure joinDate is readable
  const joinDateStr = teacher?.joinDate ? new Date(teacher.joinDate).toLocaleDateString() : '—';

  const fields = [
    { icon: User, label: 'Full Name', value: `${profile.firstName} ${profile.lastName}` },
    { icon: Mail, label: 'Email', value: profile.email },
    { icon: Phone, label: 'Phone', value: profile.phone || 'Not set' },
    { icon: Briefcase, label: 'Employee ID', value: teacher?.employeeId || '—' },
    { icon: GraduationCap, label: 'Qualification', value: teacher?.qualification || 'Not set' },
    { icon: Calendar, label: 'Join Date', value: joinDateStr },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-foreground">My Profile</h1>

      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-display font-bold text-foreground">{profile.firstName} {profile.lastName}</h2>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Teacher</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {teacher && (
          <div className="mt-6 p-4 rounded-lg border border-border bg-muted/20">
            <h3 className="text-sm font-display font-semibold text-foreground mb-3">Professional Details</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Experience</p>
                <p className="text-sm font-medium text-foreground">{teacher.experienceYears || 0} years</p>
              </div>
            </div>
            {teacher.specialization && teacher.specialization.length > 0 && (
              <div className="mt-3">
                <p className="text-xs text-muted-foreground mb-1">Specializations</p>
                <div className="flex flex-wrap gap-1.5">
                  {teacher.specialization.map((s: string) => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
