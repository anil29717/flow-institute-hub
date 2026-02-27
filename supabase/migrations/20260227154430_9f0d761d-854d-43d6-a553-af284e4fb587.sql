
-- Add subject column to marks table for per-subject marks
ALTER TABLE public.marks ADD COLUMN subject text;

-- Drop the old unique constraint (test_id, student_id)
ALTER TABLE public.marks DROP CONSTRAINT IF EXISTS marks_test_id_student_id_key;

-- Add new unique constraint (test_id, student_id, subject)
ALTER TABLE public.marks ADD CONSTRAINT marks_test_id_student_id_subject_key UNIQUE (test_id, student_id, subject);
