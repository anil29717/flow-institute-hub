
-- Add student_id FK to attendance table for proper linking
ALTER TABLE public.attendance ADD COLUMN student_id uuid REFERENCES public.students(id) ON DELETE CASCADE;

-- Drop old restrictive policies and recreate with institute-based access
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;
DROP POLICY IF EXISTS "Owners can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can insert attendance" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can view/mark attendance for assigned batches" ON public.attendance;

CREATE POLICY "Admins can manage all attendance"
  ON public.attendance FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage attendance"
  ON public.attendance FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Teachers can view attendance for assigned batches"
  ON public.attendance FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND
    batch_id IN (SELECT id FROM batches WHERE teacher_id = get_teacher_id(auth.uid()))
  );

CREATE POLICY "Teachers can insert attendance for assigned batches"
  ON public.attendance FOR INSERT
  WITH CHECK (
    has_role(auth.uid(), 'teacher'::app_role) AND
    batch_id IN (SELECT id FROM batches WHERE teacher_id = get_teacher_id(auth.uid()))
  );

CREATE POLICY "Teachers can update attendance for assigned batches"
  ON public.attendance FOR UPDATE
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND
    batch_id IN (SELECT id FROM batches WHERE teacher_id = get_teacher_id(auth.uid()))
  );
