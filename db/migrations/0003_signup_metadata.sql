-- Notara — populate profile from signup metadata (M2/auth)
-- handle_new_user now reads full_name / profession / preferred_language from
-- the new user's metadata (set at signup by web OR a future mobile/API client),
-- falling back to defaults. Keeps the subscription bootstrap unchanged.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, profession, preferred_language)
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data->>'full_name', ''),
    coalesce(
      nullif(new.raw_user_meta_data->>'profession', '')::public.profession,
      'physiotherapist'
    ),
    coalesce(nullif(new.raw_user_meta_data->>'preferred_language', ''), 'nl')
  );
  insert into public.subscriptions (user_id, status, trial_end)
  values (new.id, 'trialing', now() + interval '14 days');
  return new;
end;
$$;
