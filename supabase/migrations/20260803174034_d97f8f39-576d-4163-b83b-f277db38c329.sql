ALTER TABLE public.ai_content ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_content TO authenticated;
GRANT ALL ON public.ai_content TO service_role;

COMMENT ON COLUMN public.ai_content.currency IS 'Currency code for pricing estimates: INR for India, USD for rest of world.';