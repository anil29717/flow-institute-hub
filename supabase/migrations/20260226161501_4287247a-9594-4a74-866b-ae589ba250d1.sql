
-- Create fee_payments table to track individual payments per student
CREATE TABLE public.fee_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  payment_mode text NOT NULL DEFAULT 'cash',
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  receipt_no text,
  notes text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all fee_payments"
  ON public.fee_payments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Owners can manage fee_payments in own institute"
  ON public.fee_payments FOR ALL
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE institute_id = get_user_institute_id(auth.uid())
    )
  );

CREATE POLICY "Teachers can view fee_payments in own institute"
  ON public.fee_payments FOR SELECT
  USING (
    has_role(auth.uid(), 'teacher'::app_role) AND
    student_id IN (
      SELECT id FROM public.students WHERE institute_id = get_user_institute_id(auth.uid())
    )
  );
