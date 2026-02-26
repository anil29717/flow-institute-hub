
-- Plan history table to track plan changes
CREATE TABLE public.plan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institute_id uuid NOT NULL REFERENCES public.institutes(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.plans(id),
  plan_name text NOT NULL,
  amount_paid numeric NOT NULL DEFAULT 0,
  payment_mode text DEFAULT 'cash',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  changed_by uuid,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all plan_history" ON public.plan_history FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Owners can view own institute plan_history" ON public.plan_history FOR SELECT USING (institute_id = get_user_institute_id(auth.uid()));
