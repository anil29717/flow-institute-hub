import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from 'sonner';

// ─── Teachers ───
export function useTeachers() {
  return useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/teachers'),
  });
}

export function useUpdateTeacher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/teachers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] });
      toast.success('Teacher updated successfully');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Courses ───
export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: () => api.get('/courses'),
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (course: { name: string; description?: string; duration_weeks: number; total_fee: number }) =>
      api.post('/courses', course),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Batches ───
export function useBatches() {
  return useQuery({
    queryKey: ['batches'],
    queryFn: () => api.get('/batches'),
  });
}

export function useCreateBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (batch: {
      name: string;
      start_date: string;
      end_date: string;
      max_students?: number;
      teacher_id?: string;
      status?: string
    }) => api.post('/batches', batch),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/batches/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Fees ───
export function useFees() {
  return useQuery({
    queryKey: ['fees'],
    queryFn: () => api.get('/fees'),
  });
}

// ─── Leave Requests ───
export function useLeaveRequests() {
  return useQuery({
    queryKey: ['leave_requests'],
    queryFn: () => api.get('/leaves'),
  });
}

export function useUpdateLeaveStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'approved' | 'rejected' }) =>
      api.patch(`/leaves/${id}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['leave_requests'] });
      toast.success('Leave updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Students ───
export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => api.get('/students'),
  });
}

export function useCreateStudent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (student: any) => api.post('/students', student),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student added');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Institute info ───
export function useInstitute(instituteId: string | null) {
  return useQuery({
    queryKey: ['institute', instituteId],
    queryFn: () => api.get('/institutes/my-institute').then((res: any) => res._id), // Returns instituteId
    enabled: !!instituteId,
  });
}

export function useInstituteDetails(instituteId: string | null) {
  return useQuery({
    queryKey: ['institute_details', instituteId],
    queryFn: () => api.get('/institutes/my-institute'),
    enabled: !!instituteId,
  });
}

export function useUpdateInstitute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; phone?: string; address?: string; email?: string }) =>
      api.put('/institutes/my-institute', data),
    onSuccess: (res: any) => {
      qc.invalidateQueries({ queryKey: ['institute_details'] });
      toast.success('Institute details updated');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Attendance ───
export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: () => api.get('/attendance'),
  });
}

// ─── Feedback ───
export function useFeedback() {
  return useQuery({
    queryKey: ['feedback'],
    queryFn: () => api.get('/feedback'),
  });
}

// ─── Dashboard stats ───
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      // In the new backend, we should probably have a dedicated stats endpoint for owners
      // but for now we can aggregate client side if we have to, or implement a backend route.
      // Let's assume we implement GET /institutes/stats for owners later.
      // For now, let's just fetch all and count to keep it simple, or mock it.
      const [teachers, students, batches, fees, leaves] = await Promise.all([
        api.get('/teachers'),
        api.get('/students'),
        api.get('/batches'),
        api.get('/fees'),
        api.get('/leaves')
      ]);

      const totalRevenue = fees.filter((f: any) => f.feeStatus === 'paid' || f.status === 'paid').reduce((s: number, f: any) => s + Number(f.amount || 0), 0);
      const pendingFees = fees.filter((f: any) => f.feeStatus !== 'paid' && f.status !== 'paid').reduce((s: number, f: any) => s + Number(f.amount || 0), 0);

      return {
        totalTeachers: teachers.length,
        totalStudents: students.length,
        activeBatches: batches.filter((b: any) => b.status === 'ongoing').length,
        totalRevenue,
        pendingFees,
        pendingLeaves: leaves.filter((l: any) => l.status === 'pending').length,
      };
    },
  });
}

