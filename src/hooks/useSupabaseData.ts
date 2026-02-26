import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Teachers (with profile join) ───
export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*, profiles(*)');
      if (error) throw error;
      return data;
    },
  });
}

// ─── Courses ───
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (course: { name: string; description?: string; duration_weeks: number; total_fee: number }) => {
      const { data, error } = await supabase.from('courses').insert(course).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['courses'] }); toast.success('Course created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Batches ───
export function useBatches() {
  return useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data, error } = await supabase.from('batches').select('*, courses(name), teachers(*, profiles(*))');
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (batch: { name: string; course_id: string; start_date: string; end_date: string; max_students?: number; teacher_id?: string }) => {
      const { data, error } = await supabase.from('batches').insert(batch).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['batches'] }); toast.success('Batch created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Fees ───
export function useFees() {
  return useQuery({
    queryKey: ['fees'],
    queryFn: async () => {
      const { data, error } = await supabase.from('fees').select('*').order('due_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Leave Requests ───
export function useLeaveRequests() {
  return useQuery({
    queryKey: ['leave_requests'],
    queryFn: async () => {
      const { data, error } = await supabase.from('leave_requests').select('*, teachers(*, profiles(*))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useUpdateLeaveStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      const { error } = await supabase.from('leave_requests').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['leave_requests'] }); toast.success('Leave updated'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Students ───
export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const { data, error } = await supabase.from('students').select('*, courses(name), batches(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (student: { student_id: string; first_name: string; last_name: string; email?: string; phone?: string; guardian_name?: string; guardian_phone?: string; institute_id: string; batch_id?: string; class?: string; school?: string; total_fee?: number; enrollment_date?: string }) => {
      const { data, error } = await supabase.from('students').insert(student).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['students'] }); toast.success('Student added'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Institute info ───
export function useInstitute(instituteId: string | null) {
  return useQuery({
    queryKey: ['institute', instituteId],
    queryFn: async () => {
      if (!instituteId) return null;
      const { data, error } = await supabase.from('institutes').select('*').eq('id', instituteId).single();
      if (error) throw error;
      return data;
    },
    enabled: !!instituteId,
  });
}

// ─── Attendance ───
export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    },
  });
}

// ─── Feedback ───
export function useFeedback() {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: async () => {
      const { data, error } = await supabase.from('feedback').select('*, teachers(*, profiles(*))').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

// ─── Dashboard stats ───
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const [teachers, courses, batches, fees, leaves] = await Promise.all([
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('batches').select('id', { count: 'exact', head: true }).eq('status', 'ongoing'),
        supabase.from('fees').select('amount, status'),
        supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      const feeData = fees.data ?? [];
      const totalRevenue = feeData.filter(f => f.status === 'paid').reduce((s, f) => s + Number(f.amount), 0);
      const pendingFees = feeData.filter(f => f.status !== 'paid').reduce((s, f) => s + Number(f.amount), 0);

      return {
        totalTeachers: teachers.count ?? 0,
        totalCourses: courses.count ?? 0,
        activeBatches: batches.count ?? 0,
        totalRevenue,
        pendingFees,
        pendingLeaves: leaves.count ?? 0,
      };
    },
  });
}
