-- Create system settings table
create table if not exists public.system_settings (
  id uuid primary key default gen_random_uuid(),
  setting_key text unique not null,
  setting_value jsonb not null,
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

-- Enable RLS
alter table public.system_settings enable row level security;

-- Admins can view and manage system settings
create policy "Admins can view system settings"
on public.system_settings
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can insert system settings"
on public.system_settings
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update system settings"
on public.system_settings
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- Insert default setting for account approval
insert into public.system_settings (setting_key, setting_value)
values ('require_account_approval', '{"enabled": true}'::jsonb)
on conflict (setting_key) do nothing;

-- Create function to get system setting
create or replace function public.get_system_setting(key text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select setting_value
  from public.system_settings
  where setting_key = key;
$$;

-- Update the handle_new_user trigger to respect the approval setting
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  approval_required boolean;
begin
  -- Check if account approval is required
  approval_required := coalesce(
    (select (setting_value->>'enabled')::boolean 
     from public.system_settings 
     where setting_key = 'require_account_approval'),
    true  -- default to requiring approval if setting doesn't exist
  );

  insert into public.profiles (
    user_id,
    full_name,
    username,
    account_status,
    approved_at,
    onboarding_data
  )
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    case when approval_required then 'pending_approval' else 'approved' end,
    case when approval_required then null else now() end,
    '{}'::jsonb
  );
  
  return new;
end;
$$;