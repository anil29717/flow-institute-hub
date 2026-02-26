-- Add salary fields to teachers table
ALTER TABLE public.teachers
  ADD COLUMN salary_amount numeric DEFAULT 0,
  ADD COLUMN salary_type text DEFAULT 'per_month',
  ADD COLUMN payment_frequency text DEFAULT 'monthly';

-- salary_type: 'per_hour', 'per_day', 'per_month'
-- payment_frequency: 'daily', 'weekly', 'monthly', 'custom'
