import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { toast } from 'sonner';

export function useTests() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: () => api.get('/tests'),
  });
}

export function useCreateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      subject: string;
      testDate: string;
      testTime?: string;
      batchIds: string[];
      studentIds: string[];
      totalMarks: number;
    }) => api.post('/tests', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      toast.success('Test created');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/tests/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tests'] });
      toast.success('Test deleted');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTestStudents(testId: string | null) {
  return useQuery({
    queryKey: ['test_students', testId],
    queryFn: () => testId ? api.get(`/tests/${testId}/students`) : Promise.resolve([]),
    enabled: !!testId,
  });
}

export function useMarks(testId: string | null) {
  return useQuery({
    queryKey: ['marks', testId],
    queryFn: () => testId ? api.get(`/tests/${testId}/marks`) : Promise.resolve([]),
    enabled: !!testId,
  });
}

export function useUpsertMarks(testId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (marks: { studentId: string; marksObtained: number; remarks?: string }[]) =>
      api.post(`/tests/${testId}/marks`, { marks }),
    onSuccess: () => {
      if (testId) qc.invalidateQueries({ queryKey: ['marks', testId] });
      toast.success('Marks saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

