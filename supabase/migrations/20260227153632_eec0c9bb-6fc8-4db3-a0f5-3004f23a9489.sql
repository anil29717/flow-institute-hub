
-- Tests table
CREATE TABLE public.tests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject text NOT NULL,
  test_date date NOT NULL,
  test_time time,
  institute_id uuid REFERENCES public.institutes(id),
  created_by uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Junction: test <-> batches
CREATE TABLE public.test_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  UNIQUE(test_id, batch_id)
);

-- Junction: test <-> students (selected students)
CREATE TABLE public.test_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  UNIQUE(test_id, student_id)
);

-- Marks: one entry per student per test
CREATE TABLE public.marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id uuid NOT NULL REFERENCES public.tests(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  batch_id uuid NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
  marks_obtained numeric,
  total_marks numeric NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(test_id, student_id)
);

-- Enable RLS
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marks ENABLE ROW LEVEL SECURITY;

-- Tests policies
CREATE POLICY "Owners can manage tests" ON public.tests FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Teachers can view tests they created" ON public.tests FOR SELECT
  USING (has_role(auth.uid(), 'teacher'::app_role) AND created_by = auth.uid());

CREATE POLICY "Teachers can create tests" ON public.tests FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'teacher'::app_role) AND created_by = auth.uid());

CREATE POLICY "Teachers can update own tests" ON public.tests FOR UPDATE
  USING (has_role(auth.uid(), 'teacher'::app_role) AND created_by = auth.uid());

CREATE POLICY "Admins can manage all tests" ON public.tests FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- test_batches policies
CREATE POLICY "Owners can manage test_batches" ON public.test_batches FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Teachers can manage own test_batches" ON public.test_batches FOR ALL
  USING (test_id IN (SELECT id FROM public.tests WHERE created_by = auth.uid()));

CREATE POLICY "Admins can manage all test_batches" ON public.test_batches FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- test_students policies
CREATE POLICY "Owners can manage test_students" ON public.test_students FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Teachers can manage own test_students" ON public.test_students FOR ALL
  USING (test_id IN (SELECT id FROM public.tests WHERE created_by = auth.uid()));

CREATE POLICY "Admins can manage all test_students" ON public.test_students FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Marks policies
CREATE POLICY "Owners can manage marks" ON public.marks FOR ALL
  USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Teachers can manage marks for own tests" ON public.marks FOR ALL
  USING (test_id IN (SELECT id FROM public.tests WHERE created_by = auth.uid()));

CREATE POLICY "Admins can manage all marks" ON public.marks FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_tests_updated_at BEFORE UPDATE ON public.tests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_marks_updated_at BEFORE UPDATE ON public.marks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
