
-- Add class and school columns to students
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS school TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS total_fee NUMERIC DEFAULT 0;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS fee_paid NUMERIC DEFAULT 0;
