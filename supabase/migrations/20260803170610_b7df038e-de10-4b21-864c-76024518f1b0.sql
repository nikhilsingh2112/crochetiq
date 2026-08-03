CREATE TABLE public.guest_ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint text NOT NULL UNIQUE,
  runs integer NOT NULL DEFAULT 0,
  first_used_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.guest_ai_usage TO service_role;

ALTER TABLE public.guest_ai_usage ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.consume_guest_ai_run(_fingerprint text, _limit integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_runs integer;
BEGIN
  INSERT INTO public.guest_ai_usage (fingerprint, runs)
  VALUES (_fingerprint, 0)
  ON CONFLICT (fingerprint) DO NOTHING;

  SELECT runs INTO current_runs FROM public.guest_ai_usage WHERE fingerprint = _fingerprint FOR UPDATE;

  IF current_runs >= _limit THEN
    RETURN -1;
  END IF;

  UPDATE public.guest_ai_usage
  SET runs = runs + 1, last_used_at = now()
  WHERE fingerprint = _fingerprint
  RETURNING runs INTO current_runs;

  RETURN current_runs;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_guest_ai_run(text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_guest_ai_run(text, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.guest_ai_runs_used(_fingerprint text)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT runs FROM public.guest_ai_usage WHERE fingerprint = _fingerprint), 0);
$$;

REVOKE ALL ON FUNCTION public.guest_ai_runs_used(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.guest_ai_runs_used(text) TO service_role;