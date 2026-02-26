-- Create salary_payments table
CREATE TABLE public.salary_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_mode text NOT NULL DEFAULT 'bank_transfer',
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  period_label text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage salary_payments" ON public.salary_payments
  FOR ALL USING (has_role(auth.uid(), 'owner'::app_role));

CREATE POLICY "Admins can manage salary_payments" ON public.salary_payments
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Teachers can view own salary_payments" ON public.salary_payments
  FOR SELECT USING (teacher_id = get_teacher_id(auth.uid()));
