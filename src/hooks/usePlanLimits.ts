import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface PlanLimits {
  planName: string | null;
  maxStudents: number | null;
  maxTeachers: number | null;
  maxDays: number | null;
  currentStudents: number;
  currentTeachers: number;
  isExpired: boolean;
  canAddStudent: boolean;
  canAddTeacher: boolean;
  hasPlan: boolean;
}

export function usePlanLimits() {
  const { user } = useAuth();
  const instituteId = user?.instituteId;

  return useQuery({
    queryKey: ['plan_limits', instituteId],
    queryFn: async (): Promise<PlanLimits> => {
      if (!instituteId) {
        return { planName: null, maxStudents: null, maxTeachers: null, maxDays: null, currentStudents: 0, currentTeachers: 0, isExpired: false, canAddStudent: true, canAddTeacher: true, hasPlan: false };
      }

      // Fetch institute with plan
      const { data: inst } = await supabase
        .from('institutes')
        .select('*, plans(*)')
        .eq('id', instituteId)
        .single();

      if (!inst || !inst.plan_id || !(inst as any).plans) {
        // No plan assigned — block all actions
        return { planName: null, maxStudents: 0, maxTeachers: 0, maxDays: null, currentStudents: 0, currentTeachers: 0, isExpired: true, canAddStudent: false, canAddTeacher: false, hasPlan: false };
      }

      const plan = (inst as any).plans;
      const isExpired = inst.plan_expires_at ? new Date(inst.plan_expires_at) < new Date() : false;

      // Count current students & teachers
      const [studentsRes, teachersRes] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }).eq('institute_id', instituteId).eq('is_active', true),
        supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('institute_id', instituteId),
      ]);

      const currentStudents = studentsRes.count ?? 0;
      const currentTeachers = teachersRes.count ?? 0;

      return {
        planName: plan.name,
        maxStudents: plan.max_students,
        maxTeachers: plan.max_teachers,
        maxDays: plan.max_days,
        currentStudents,
        currentTeachers,
        isExpired,
        canAddStudent: !isExpired && currentStudents < plan.max_students,
        canAddTeacher: !isExpired && currentTeachers < plan.max_teachers,
        hasPlan: true,
      };
    },
    enabled: !!instituteId,
  });
}
