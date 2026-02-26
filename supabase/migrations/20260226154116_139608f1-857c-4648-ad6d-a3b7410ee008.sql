
-- Create institutes table
CREATE TABLE public.institutes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  address text,
  phone text,
  email text,
  logo_url text,
  is_active boolean DEFAULT true,
  is_approved boolean DEFAULT false,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.institutes ENABLE ROW LEVEL SECURITY;

-- Add institute_id to profiles and teachers
ALTER TABLE public.profiles ADD COLUMN institute_id uuid REFERENCES public.institutes(id) ON DELETE SET NULL;
ALTER TABLE public.teachers ADD COLUMN institute_id uuid REFERENCES public.institutes(id) ON DELETE SET NULL;

-- RLS for institutes
CREATE POLICY "Admins can manage all institutes"
  ON public.institutes FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Owners can view own institute"
  ON public.institutes FOR SELECT
  USING (owner_user_id = auth.uid());

CREATE POLICY "Owners can update own institute"
  ON public.institutes FOR UPDATE
  USING (owner_user_id = auth.uid());

-- Helper function
CREATE OR REPLACE FUNCTION public.get_user_institute_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institute_id FROM public.profiles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Trigger for updated_at
CREATE TRIGGER update_institutes_updated_at
  BEFORE UPDATE ON public.institutes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Admin RLS: admins can view all profiles, teachers, etc.
CREATE POLICY "Admins can manage all profiles"
  ON public.profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all teachers"
  ON public.teachers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all courses"
  ON public.courses FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all batches"
  ON public.batches FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all fees"
  ON public.fees FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all leaves"
  ON public.leave_requests FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all attendance"
  ON public.attendance FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'admin'));
