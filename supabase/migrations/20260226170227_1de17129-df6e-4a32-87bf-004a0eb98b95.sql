
-- Create function to auto-deactivate expired institutes
CREATE OR REPLACE FUNCTION public.deactivate_expired_institutes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.institutes
  SET is_active = false
  WHERE plan_expires_at IS NOT NULL
    AND plan_expires_at < now()
    AND is_active = true;
END;
$$;
