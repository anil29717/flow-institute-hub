
-- Fix students policies: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Teachers can view students in own institute" ON public.students;
DROP POLICY IF EXISTS "Owners can manage students in own institute" ON public.students;
DROP POLICY IF EXISTS "Admins can manage all students" ON public.students;

CREATE POLICY "Admins can manage all students" ON public.students FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage students in own institute" ON public.students FOR ALL TO authenticated
  USING (institute_id = get_user_institute_id(auth.uid()));

CREATE POLICY "Teachers can view students in own institute" ON public.students FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role) AND institute_id = get_user_institute_id(auth.uid()));

-- Fix batches policies too
DROP POLICY IF EXISTS "Teachers can view assigned batches" ON public.batches;
DROP POLICY IF EXISTS "Owners can manage batches" ON public.batches;
DROP POLICY IF EXISTS "Admins can manage all batches" ON public.batches;

CREATE POLICY "Admins can manage all batches" ON public.batches FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage batches" ON public.batches FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Teachers can view assigned batches" ON public.batches FOR SELECT TO authenticated
  USING (teacher_id = get_teacher_id(auth.uid()));

-- Fix attendance policies
DROP POLICY IF EXISTS "Teachers can view attendance for assigned batches" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can insert attendance for assigned batches" ON public.attendance;
DROP POLICY IF EXISTS "Teachers can update attendance for assigned batches" ON public.attendance;
DROP POLICY IF EXISTS "Owners can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can manage all attendance" ON public.attendance;

CREATE POLICY "Admins can manage all attendance" ON public.attendance FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage attendance" ON public.attendance FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Teachers can view attendance for assigned batches" ON public.attendance FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role) AND batch_id IN (SELECT id FROM batches WHERE teacher_id = get_teacher_id(auth.uid())));

CREATE POLICY "Teachers can insert attendance for assigned batches" ON public.attendance FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND batch_id IN (SELECT id FROM batches WHERE teacher_id = get_teacher_id(auth.uid())));

CREATE POLICY "Teachers can update attendance for assigned batches" ON public.attendance FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'teacher'::app_role) AND batch_id IN (SELECT id FROM batches WHERE teacher_id = get_teacher_id(auth.uid())));
