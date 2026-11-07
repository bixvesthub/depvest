CREATE TABLE public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  reference text NOT NULL,
  entry jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, reference)
);
GRANT SELECT, INSERT ON public.ledger_entries TO authenticated;
GRANT ALL ON public.ledger_entries TO service_role;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own ledger read" ON public.ledger_entries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own ledger insert" ON public.ledger_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.account_state (
  user_id uuid PRIMARY KEY,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.account_state TO authenticated;
GRANT ALL ON public.account_state TO service_role;
ALTER TABLE public.account_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own state read" ON public.account_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own state insert" ON public.account_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own state update" ON public.account_state FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER account_state_updated_at BEFORE UPDATE ON public.account_state FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();