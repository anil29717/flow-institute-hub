
-- Create students table
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  guardian_name TEXT,
  guardian_phone TEXT,
  institute_id UUID REFERENCES public.institutes(id),
  course_id UUID REFERENCES public.courses(id),
  batch_id UUID REFERENCES public.batches(id),
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  fee_status TEXT NOT NULL DEFAULT 'pending',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage all students"
ON public.students FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage students in own institute"
ON public.students FOR ALL
TO authenticated
USING (institute_id = get_user_institute_id(auth.uid()));

CREATE POLICY "Teachers can view students in own institute"
ON public.students FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'teacher'::app_role) AND institute_id = get_user_institute_id(auth.uid()));

-- Timestamp trigger
CREATE TRIGGER update_students_updated_at
BEFORE UPDATE ON public.students
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
