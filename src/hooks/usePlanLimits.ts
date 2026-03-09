import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
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
  planId: string | null;
  planExpiresAt: string | null;
}

export function usePlanLimits() {
  const { user } = useAuth();
  const instituteId = user?.instituteId;

  return useQuery({
    queryKey: ['plan_limits', instituteId],
    queryFn: async (): Promise<PlanLimits> => {
      if (!instituteId) {
        return {
          planName: null, maxStudents: null, maxTeachers: null, maxDays: null,
          currentStudents: 0, currentTeachers: 0, isExpired: false,
          canAddStudent: true, canAddTeacher: true, hasPlan: false,
          planId: null, planExpiresAt: null
        };
      }

      // Fetch populated institute object directly
      const inst = await api.get('/institutes/my-institute');

      if (!inst || !inst.planId) {
        // No plan assigned — block all actions
        return {
          planName: null, maxStudents: 0, maxTeachers: 0, maxDays: null,
          currentStudents: 0, currentTeachers: 0, isExpired: true,
          canAddStudent: false, canAddTeacher: false, hasPlan: false,
          planId: null, planExpiresAt: null
        };
      }

      const plan = inst.planId;
      const isExpired = inst.planExpiresAt ? new Date(inst.planExpiresAt) < new Date() : false;

      // For counts, we can either have them in the institute object or fetch separately
      // Let's assume for now we need to fetch them or they are already in some summary.
      // To keep it consistent with previous logic, let's assume we might need to fetch them.
      // But ideally the backend provides these. Let's assume we fetch all and count for now.
      const [students, teachers] = await Promise.all([
        api.get('/students'),
        api.get('/teachers')
      ]);

      const currentStudents = students.length;
      const currentTeachers = teachers.length;

      return {
        planName: plan.name,
        maxStudents: plan.maxStudents,
        maxTeachers: plan.maxTeachers,
        maxDays: plan.maxDays,
        currentStudents,
        currentTeachers,
        isExpired,
        canAddStudent: !isExpired && currentStudents < plan.maxStudents,
        canAddTeacher: !isExpired && currentTeachers < plan.maxTeachers,
        hasPlan: true,
        planId: plan._id,
        planExpiresAt: inst.planExpiresAt
      };
    },
    enabled: !!instituteId,
  });
}

