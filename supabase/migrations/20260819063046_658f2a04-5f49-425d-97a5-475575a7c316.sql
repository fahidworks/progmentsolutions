CREATE TABLE public.portal_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  decided_by uuid,
  decided_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.portal_accounts TO authenticated;
GRANT ALL ON public.portal_accounts TO service_role;

ALTER TABLE public.portal_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own approval record or staff"
  ON public.portal_accounts FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()) OR public.is_staff(auth.uid()));

CREATE TRIGGER portal_accounts_updated_at
  BEFORE UPDATE ON public.portal_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();