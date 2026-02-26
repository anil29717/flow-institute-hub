
-- 1. Create role enum
CREATE TYPE public.app_role AS ENUM ('owner', 'teacher');

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  profile_pic TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. User roles table (separate from profiles per security requirements)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 4. Teachers table
CREATE TABLE public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  employee_id TEXT NOT NULL UNIQUE,
  qualification TEXT,
  specialization TEXT[],
  experience_years INT DEFAULT 0,
  join_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  duration_weeks INT NOT NULL DEFAULT 1,
  total_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Batches table
CREATE TABLE public.batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_students INT NOT NULL DEFAULT 30,
  current_students INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late')),
  marked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_name, batch_id, date)
);

-- 8. Fees table
CREATE TABLE public.fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending', 'overdue')),
  receipt_no TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Leave requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'casual', 'earned', 'emergency')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Feedback table
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE CASCADE NOT NULL,
  rating NUMERIC(3,2) NOT NULL,
  comments TEXT,
  reviewer_name TEXT,
  review_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- 12. Security definer helper: check role without recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 13. Get teacher_id for a user
CREATE OR REPLACE FUNCTION public.get_teacher_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id FROM public.teachers t
  JOIN public.profiles p ON p.id = t.profile_id
  WHERE p.user_id = _user_id
  LIMIT 1
$$;

-- 14. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============ RLS POLICIES ============

-- PROFILES
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can manage profiles" ON public.profiles FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- USER_ROLES
CREATE POLICY "Users can view own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'owner'));

-- TEACHERS
CREATE POLICY "Owners can manage teachers" ON public.teachers FOR ALL USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Teachers can view own record" ON public.teachers FOR SELECT USING (
  profile_id = (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- COURSES
CREATE POLICY "Owners can manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Teachers can view active courses" ON public.courses FOR SELECT USING (
  public.has_role(auth.uid(), 'teacher') AND is_active = true
);

-- BATCHES
CREATE POLICY "Owners can manage batches" ON public.batches FOR ALL USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Teachers can view assigned batches" ON public.batches FOR SELECT USING (
  teacher_id = public.get_teacher_id(auth.uid())
);

-- ATTENDANCE
CREATE POLICY "Owners can manage attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Teachers can view/mark attendance for assigned batches" ON public.attendance FOR SELECT USING (
  batch_id IN (SELECT id FROM public.batches WHERE teacher_id = public.get_teacher_id(auth.uid()))
);
CREATE POLICY "Teachers can insert attendance" ON public.attendance FOR INSERT WITH CHECK (
  public.has_role(auth.uid(), 'teacher') AND
  batch_id IN (SELECT id FROM public.batches WHERE teacher_id = public.get_teacher_id(auth.uid()))
);

-- FEES
CREATE POLICY "Owners can manage fees" ON public.fees FOR ALL USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Teachers can view fees" ON public.fees FOR SELECT USING (public.has_role(auth.uid(), 'teacher'));

-- LEAVE REQUESTS
CREATE POLICY "Owners can manage leaves" ON public.leave_requests FOR ALL USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Teachers can view own leaves" ON public.leave_requests FOR SELECT USING (
  teacher_id = public.get_teacher_id(auth.uid())
);
CREATE POLICY "Teachers can create leaves" ON public.leave_requests FOR INSERT WITH CHECK (
  teacher_id = public.get_teacher_id(auth.uid())
);
CREATE POLICY "Teachers can update own pending leaves" ON public.leave_requests FOR UPDATE USING (
  teacher_id = public.get_teacher_id(auth.uid()) AND status = 'pending'
);

-- FEEDBACK
CREATE POLICY "Owners can manage feedback" ON public.feedback FOR ALL USING (public.has_role(auth.uid(), 'owner'));
CREATE POLICY "Teachers can view own feedback" ON public.feedback FOR SELECT USING (
  teacher_id = public.get_teacher_id(auth.uid())
);

-- Indexes
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_teachers_profile_id ON public.teachers(profile_id);
CREATE INDEX idx_batches_course_id ON public.batches(course_id);
CREATE INDEX idx_batches_teacher_id ON public.batches(teacher_id);
CREATE INDEX idx_attendance_batch_id ON public.attendance(batch_id);
CREATE INDEX idx_attendance_date ON public.attendance(date);
CREATE INDEX idx_fees_status ON public.fees(status);
CREATE INDEX idx_leave_requests_teacher_id ON public.leave_requests(teacher_id);
CREATE INDEX idx_leave_requests_status ON public.leave_requests(status);
CREATE INDEX idx_feedback_teacher_id ON public.feedback(teacher_id);
