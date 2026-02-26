
-- Create plans table
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  max_days integer NOT NULL DEFAULT 30,
  max_students integer NOT NULL DEFAULT 10,
  max_teachers integer NOT NULL DEFAULT 2,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all plans" ON public.plans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Owners can view active plans" ON public.plans FOR SELECT USING (has_role(auth.uid(), 'owner'::app_role) AND is_active = true);

-- Add plan fields to institutes
ALTER TABLE public.institutes
  ADD COLUMN plan_id uuid REFERENCES public.plans(id),
  ADD COLUMN plan_started_at timestamptz,
  ADD COLUMN plan_expires_at timestamptz;

-- Create trigger for updated_at on plans
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
