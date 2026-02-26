
-- Teacher attendance table
CREATE TABLE public.teacher_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'present',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(teacher_id, date)
);

ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all teacher_attendance"
  ON public.teacher_attendance FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage teacher_attendance"
  ON public.teacher_attendance FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Teachers can view own attendance"
  ON public.teacher_attendance FOR SELECT
  USING (teacher_id = get_teacher_id(auth.uid()));
