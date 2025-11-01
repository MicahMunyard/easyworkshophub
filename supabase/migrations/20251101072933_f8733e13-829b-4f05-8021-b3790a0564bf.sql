-- Enable RLS on tables that are missing it

-- Enable RLS for service_bays
ALTER TABLE public.service_bays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view service bays"
  ON public.service_bays FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage service bays"
  ON public.service_bays FOR ALL
  USING (auth.role() = 'authenticated');

-- Enable RLS for services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view services"
  ON public.services FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage services"
  ON public.services FOR ALL
  USING (auth.role() = 'authenticated');

-- Enable RLS for technicians
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to view technicians"
  ON public.technicians FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to manage technicians"
  ON public.technicians FOR ALL
  USING (auth.role() = 'authenticated');

-- Enable RLS for email_credentials
ALTER TABLE public.email_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email credentials"
  ON public.email_credentials FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own email credentials"
  ON public.email_credentials FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email credentials"
  ON public.email_credentials FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email credentials"
  ON public.email_credentials FOR DELETE
  USING (auth.uid() = user_id);