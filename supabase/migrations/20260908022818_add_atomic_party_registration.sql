begin;

alter table public.parties
add column request_id uuid not null default gen_random_uuid();

alter table public.parties
add constraint parties_request_id_unique unique (request_id);

create unique index commodities_normalized_name_unique_idx
on public.commodities (lower(btrim(name)));

create or replace function public.create_party(payload jsonb, idempotency_key uuid)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  new_party_id bigint;
begin
  if (select auth.uid()) is null or not (select private.current_user_is_main()) then
    raise exception 'Only an active Main user can register a party.';
  end if;

  select party.id into new_party_id
  from public.parties party
  where party.request_id = idempotency_key
    and party.created_by = (select auth.uid());

  if new_party_id is not null then
    return new_party_id;
  end if;

  if jsonb_typeof(payload -> 'roles') <> 'array'
    or jsonb_array_length(payload -> 'roles') = 0 then
    raise exception 'Select at least one party role.';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(payload -> 'roles') requested_role(role)
    where requested_role.role not in ('seller', 'buyer', 'broker', 'transporter')
  ) then
    raise exception 'One or more party roles are invalid.';
  end if;

  insert into public.parties (
    request_id,
    name,
    mobile,
    address,
    gstin,
    notes,
    created_by
  ) values (
    idempotency_key,
    btrim(payload ->> 'name'),
    nullif(btrim(payload ->> 'mobile'), ''),
    nullif(btrim(payload ->> 'address'), ''),
    nullif(upper(btrim(payload ->> 'gstin')), ''),
    nullif(btrim(payload ->> 'notes'), ''),
    (select auth.uid())
  ) returning id into new_party_id;

  insert into public.party_roles (party_id, role)
  select new_party_id, requested_role.role
  from (
    select distinct role
    from jsonb_array_elements_text(payload -> 'roles') requested_role(role)
  ) requested_role;

  return new_party_id;
end;
$$;

revoke all on function public.create_party(jsonb, uuid) from public, anon;
grant execute on function public.create_party(jsonb, uuid) to authenticated;

commit;
