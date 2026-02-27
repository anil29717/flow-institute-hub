
-- Update get_user_institute_id to also check teachers table for teachers
CREATE OR REPLACE FUNCTION public.get_user_institute_id(_user_id uuid)
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT institute_id FROM public.profiles WHERE user_id = _user_id LIMIT 1),
    (SELECT t.institute_id FROM public.teachers t JOIN public.profiles p ON p.id = t.profile_id WHERE p.user_id = _user_id LIMIT 1)
  )
$$;

-- Allow teachers to view their own institute
CREATE POLICY "Teachers can view own institute"
ON public.institutes
FOR SELECT
USING (id = get_user_institute_id(auth.uid()));
