-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users view own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add visibility / moderation fields to user_templates
ALTER TABLE public.user_templates
  ADD COLUMN is_public boolean NOT NULL DEFAULT true,
  ADD COLUMN is_disabled boolean NOT NULL DEFAULT false,
  ADD COLUMN disabled_reason text;

-- Replace existing SELECT policy: anyone can view enabled public templates,
-- creators always see their own, admins see all.
DROP POLICY IF EXISTS "Users view own templates" ON public.user_templates;

CREATE POLICY "View public or own templates"
  ON public.user_templates FOR SELECT
  USING (
    auth.uid() = user_id
    OR (is_public = true AND is_disabled = false)
    OR public.has_role(auth.uid(), 'admin')
  );

-- Allow admins to update/delete any template
DROP POLICY IF EXISTS "Users update own templates" ON public.user_templates;
CREATE POLICY "Users or admins update templates"
  ON public.user_templates FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Users delete own templates" ON public.user_templates;
CREATE POLICY "Users or admins delete templates"
  ON public.user_templates FOR DELETE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Public read access for screenshots so all users can preview shared templates
INSERT INTO storage.buckets (id, name, public)
VALUES ('template-screenshots', 'template-screenshots', true)
ON CONFLICT (id) DO UPDATE SET public = true;
