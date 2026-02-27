import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useTests() {
  return useQuery({
    queryKey: ['tests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tests')
        .select('*, test_batches(batch_id, batches(name)), test_students(student_id, batch_id, students(first_name, last_name))')
        .order('test_date', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      test,
      batchIds,
      studentIds,
    }: {
      test: { name: string; subject: string; test_date: string; test_time?: string; institute_id?: string; created_by: string };
      batchIds: string[];
      studentIds: { student_id: string; batch_id: string }[];
    }) => {
      const { data: testData, error: testErr } = await supabase.from('tests').insert(test).select().single();
      if (testErr) throw testErr;

      const testId = testData.id;

      if (batchIds.length) {
        const { error: bErr } = await supabase.from('test_batches').insert(batchIds.map(bid => ({ test_id: testId, batch_id: bid })));
        if (bErr) throw bErr;
      }

      if (studentIds.length) {
        const { error: sErr } = await supabase.from('test_students').insert(studentIds.map(s => ({ test_id: testId, student_id: s.student_id, batch_id: s.batch_id })));
        if (sErr) throw sErr;
      }

      return testData;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tests'] }); toast.success('Test created'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteTest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tests').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tests'] }); toast.success('Test deleted'); },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useTestStudents(testId: string | null) {
  return useQuery({
    queryKey: ['test_students', testId],
    queryFn: async () => {
      if (!testId) return [];
      const { data, error } = await supabase
        .from('test_students')
        .select('*, students(first_name, last_name, student_id), batches(name)')
        .eq('test_id', testId);
      if (error) throw error;
      return data;
    },
    enabled: !!testId,
  });
}

export function useMarks(testId: string | null) {
  return useQuery({
    queryKey: ['marks', testId],
    queryFn: async () => {
      if (!testId) return [];
      const { data, error } = await supabase
        .from('marks')
        .select('*, students(first_name, last_name, student_id), batches(name)')
        .eq('test_id', testId);
      if (error) throw error;
      return data;
    },
    enabled: !!testId,
  });
}

export function useUpsertMarks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (marks: { test_id: string; student_id: string; batch_id: string; marks_obtained: number; total_marks: number }[]) => {
      const { error } = await supabase.from('marks').upsert(marks, { onConflict: 'test_id,student_id' });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      if (vars.length) qc.invalidateQueries({ queryKey: ['marks', vars[0].test_id] });
      toast.success('Marks saved');
    },
    onError: (e: Error) => toast.error(e.message),
  });
}
