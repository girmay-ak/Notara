-- Notara — harden SECURITY DEFINER trigger functions (M2)
-- handle_new_user runs only from the on_auth_user_created trigger; it must NOT
-- be callable directly via PostgREST RPC. Trigger execution does not require the
-- EXECUTE privilege, so revoking it from API roles is safe.

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.set_updated_at()  from public, anon, authenticated;
