begin;

drop policy party_roles_write_main on public.party_roles;

create policy party_roles_insert_main
on public.party_roles for insert to authenticated
with check ((select private.current_user_is_main()));

create policy party_roles_update_main
on public.party_roles for update to authenticated
using ((select private.current_user_is_main()))
with check ((select private.current_user_is_main()));

create policy party_roles_delete_main
on public.party_roles for delete to authenticated
using ((select private.current_user_is_main()));

drop policy commodities_write_main on public.commodities;

create policy commodities_insert_main
on public.commodities for insert to authenticated
with check ((select private.current_user_is_main()));

create policy commodities_update_main
on public.commodities for update to authenticated
using ((select private.current_user_is_main()))
with check ((select private.current_user_is_main()));

drop policy bank_accounts_write_main on public.bank_accounts;

create policy bank_accounts_insert_main
on public.bank_accounts for insert to authenticated
with check (
  (select private.current_user_is_main())
  and (select private.current_user_can_access_firm(firm_id))
);

create policy bank_accounts_update_main
on public.bank_accounts for update to authenticated
using (
  (select private.current_user_is_main())
  and (select private.current_user_can_access_firm(firm_id))
)
with check (
  (select private.current_user_is_main())
  and (select private.current_user_can_access_firm(firm_id))
);

commit;
