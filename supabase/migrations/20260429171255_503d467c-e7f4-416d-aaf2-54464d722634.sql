-- Restrict template deletion to admins only.
-- Updates remain available to owner and admins.
DROP POLICY IF EXISTS "Users or admins delete templates" ON public.user_templates;

CREATE POLICY "Only admins delete templates"
ON public.user_templates
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));