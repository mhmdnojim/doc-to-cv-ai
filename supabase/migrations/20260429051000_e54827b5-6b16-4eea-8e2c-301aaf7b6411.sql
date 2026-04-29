CREATE TABLE public.saved_cvs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'My CV',
  template TEXT NOT NULL DEFAULT 'modern',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  custom_html TEXT,
  blank_pages JSONB NOT NULL DEFAULT '{}'::jsonb,
  manual_pages INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_cvs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own CVs" ON public.saved_cvs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own CVs" ON public.saved_cvs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own CVs" ON public.saved_cvs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own CVs" ON public.saved_cvs FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_saved_cvs_updated_at
BEFORE UPDATE ON public.saved_cvs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_saved_cvs_user_id ON public.saved_cvs(user_id);