begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table public.business_firms (
  id bigint generated always as identity primary key,
  name text not null,
  gstin text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint business_firms_name_not_blank check (btrim(name) <> ''),
  constraint business_firms_name_unique unique (name)
);

create table public.user_profiles (
  user_id uuid primary key references auth.users(id) on delete restrict,
  display_name text not null,
  system_role text not null default 'operator',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_display_name_not_blank check (btrim(display_name) <> ''),
  constraint user_profiles_system_role_valid check (system_role in ('main', 'operator'))
);

create table public.user_firm_access (
  user_id uuid not null references public.user_profiles(user_id) on delete cascade,
  firm_id bigint not null references public.business_firms(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, firm_id)
);

create index user_firm_access_firm_id_idx on public.user_firm_access (firm_id);

create table public.parties (
  id bigint generated always as identity primary key,
  name text not null,
  mobile text,
  address text,
  gstin text,
  notes text,
  is_active boolean not null default true,
  created_by uuid not null references public.user_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint parties_name_not_blank check (btrim(name) <> '')
);

create index parties_normalized_name_idx on public.parties (lower(btrim(name)));
create index parties_created_by_idx on public.parties (created_by);

create table public.party_roles (
  party_id bigint not null references public.parties(id) on delete cascade,
  role text not null,
  created_at timestamptz not null default now(),
  primary key (party_id, role),
  constraint party_roles_role_valid check (role in ('seller', 'buyer', 'broker', 'transporter'))
);

create table public.commodities (
  id bigint generated always as identity primary key,
  name text not null,
  local_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint commodities_name_not_blank check (btrim(name) <> ''),
  constraint commodities_name_unique unique (name)
);

create table public.bank_accounts (
  id bigint generated always as identity primary key,
  firm_id bigint not null references public.business_firms(id) on delete restrict,
  name text not null,
  account_last_four text,
  opening_balance numeric(18, 2) not null default 0,
  opening_date date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bank_accounts_name_not_blank check (btrim(name) <> ''),
  constraint bank_accounts_last_four_valid check (
    account_last_four is null or account_last_four ~ '^[0-9]{4}$'
  ),
  constraint bank_accounts_opening_balance_non_negative check (opening_balance >= 0),
  constraint bank_accounts_opening_date_required check (
    opening_balance = 0 or opening_date is not null
  )
);

create index bank_accounts_firm_id_idx on public.bank_accounts (firm_id);

create table public.purchases (
  id bigint generated always as identity primary key,
  request_id uuid not null unique,
  firm_id bigint not null references public.business_firms(id) on delete restrict,
  business_date date not null,
  seller_id bigint not null references public.parties(id) on delete restrict,
  vehicle_number text not null,
  weighbridge_name text,
  kanta_number text,
  loaded_weight_kg bigint not null,
  empty_weight_kg bigint not null,
  net_weight_kg bigint generated always as (loaded_weight_kg - empty_weight_kg) stored,
  seller_deduction numeric(18, 2) not null default 0,
  remark text,
  status text not null default 'draft',
  formula_version smallint not null default 1,
  created_by uuid not null references public.user_profiles(user_id) on delete restrict,
  posted_at timestamptz,
  reversed_at timestamptz,
  reversal_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchases_vehicle_number_not_blank check (btrim(vehicle_number) <> ''),
  constraint purchases_weight_valid check (
    loaded_weight_kg > 0 and empty_weight_kg >= 0 and loaded_weight_kg > empty_weight_kg
  ),
  constraint purchases_seller_deduction_non_negative check (seller_deduction >= 0),
  constraint purchases_status_valid check (status in ('draft', 'posted', 'reversed')),
  constraint purchases_formula_version_positive check (formula_version > 0),
  constraint purchases_posted_at_consistent check (
    (status = 'draft' and posted_at is null and reversed_at is null)
    or (status = 'posted' and posted_at is not null and reversed_at is null)
    or (status = 'reversed' and posted_at is not null and reversed_at is not null and btrim(reversal_reason) <> '')
  )
);

create index purchases_firm_date_idx on public.purchases (firm_id, business_date desc);
create index purchases_seller_date_idx on public.purchases (seller_id, business_date desc);
create index purchases_created_by_idx on public.purchases (created_by);
create unique index purchases_kanta_reference_unique_idx
  on public.purchases (firm_id, business_date, lower(btrim(kanta_number)))
  where kanta_number is not null and btrim(kanta_number) <> '' and status <> 'reversed';

create table public.purchase_lines (
  id bigint generated always as identity primary key,
  purchase_id bigint not null references public.purchases(id) on delete restrict,
  commodity_id bigint not null references public.commodities(id) on delete restrict,
  sort_order smallint not null,
  weight_kg bigint not null,
  rate_per_quintal numeric(18, 2) not null,
  gross_amount numeric(18, 2) generated always as (
    (weight_kg::numeric * rate_per_quintal) / 100
  ) stored,
  line_deduction numeric(18, 2) not null default 0,
  final_amount numeric(18, 2) generated always as (
    ((weight_kg::numeric * rate_per_quintal) / 100) - line_deduction
  ) stored,
  deduction_reason text,
  is_residual boolean not null default false,
  created_at timestamptz not null default now(),
  constraint purchase_lines_sort_order_positive check (sort_order > 0),
  constraint purchase_lines_weight_positive check (weight_kg > 0),
  constraint purchase_lines_rate_positive_whole_rupee check (
    rate_per_quintal > 0 and rate_per_quintal = trunc(rate_per_quintal)
  ),
  constraint purchase_lines_deduction_non_negative check (line_deduction >= 0),
  constraint purchase_lines_final_amount_non_negative check (
    line_deduction <= (weight_kg::numeric * rate_per_quintal) / 100
  ),
  constraint purchase_lines_deduction_reason_consistent check (
    line_deduction = 0 or (deduction_reason is not null and btrim(deduction_reason) <> '')
  ),
  constraint purchase_lines_sort_order_unique unique (purchase_id, sort_order)
);

create index purchase_lines_purchase_id_idx on public.purchase_lines (purchase_id);
create index purchase_lines_commodity_id_idx on public.purchase_lines (commodity_id);
create unique index purchase_lines_one_residual_idx
  on public.purchase_lines (purchase_id)
  where is_residual;

create table public.purchase_payments (
  id bigint generated always as identity primary key,
  purchase_id bigint not null references public.purchases(id) on delete restrict,
  payment_date date not null,
  payment_mode text not null,
  bank_account_id bigint references public.bank_accounts(id) on delete restrict,
  amount numeric(18, 2) not null,
  remark text,
  created_by uuid not null references public.user_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint purchase_payments_mode_valid check (payment_mode in ('cash', 'bank')),
  constraint purchase_payments_account_consistent check (
    (payment_mode = 'cash' and bank_account_id is null)
    or (payment_mode = 'bank' and bank_account_id is not null)
  ),
  constraint purchase_payments_amount_positive check (amount > 0)
);

create index purchase_payments_purchase_id_idx on public.purchase_payments (purchase_id);
create index purchase_payments_bank_account_id_idx on public.purchase_payments (bank_account_id);
create index purchase_payments_created_by_idx on public.purchase_payments (created_by);
create index purchase_payments_date_idx on public.purchase_payments (payment_date desc);

create table public.audit_events (
  id bigint generated always as identity primary key,
  aggregate_type text not null,
  aggregate_id bigint not null,
  action text not null,
  actor_user_id uuid references public.user_profiles(user_id) on delete restrict,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_events_aggregate_idx
  on public.audit_events (aggregate_type, aggregate_id, created_at desc);
create index audit_events_actor_idx on public.audit_events (actor_user_id, created_at desc);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger business_firms_set_updated_at
before update on public.business_firms
for each row execute function private.set_updated_at();

create trigger user_profiles_set_updated_at
before update on public.user_profiles
for each row execute function private.set_updated_at();

create trigger parties_set_updated_at
before update on public.parties
for each row execute function private.set_updated_at();

create trigger commodities_set_updated_at
before update on public.commodities
for each row execute function private.set_updated_at();

create trigger bank_accounts_set_updated_at
before update on public.bank_accounts
for each row execute function private.set_updated_at();

create trigger purchases_set_updated_at
before update on public.purchases
for each row execute function private.set_updated_at();

create or replace function private.current_user_is_active()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
  );
$$;

create or replace function private.current_user_is_main()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active
      and profile.system_role = 'main'
  );
$$;

create or replace function private.current_user_can_access_firm(target_firm_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles profile
    join public.user_firm_access access on access.user_id = profile.user_id
    where profile.user_id = (select auth.uid())
      and profile.is_active
      and access.firm_id = target_firm_id
  );
$$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  assigned_role text;
begin
  select case when exists (select 1 from public.user_profiles) then 'operator' else 'main' end
  into assigned_role;

  insert into public.user_profiles (user_id, display_name, system_role)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1)),
    assigned_role
  );

  insert into public.user_firm_access (user_id, firm_id)
  select new.id, firm.id
  from public.business_firms firm
  where firm.is_active;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

create or replace function private.purchase_is_draft(target_purchase_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.purchases purchase
    where purchase.id = target_purchase_id
      and purchase.status = 'draft'
      and (select private.current_user_can_access_firm(purchase.firm_id))
  );
$$;

create or replace function private.guard_purchase_child_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_purchase_id bigint;
begin
  target_purchase_id := coalesce(new.purchase_id, old.purchase_id);

  if not (select private.purchase_is_draft(target_purchase_id)) then
    raise exception 'Only an accessible draft purchase can be changed.';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger purchase_lines_guard_mutation
before insert or update or delete on public.purchase_lines
for each row execute function private.guard_purchase_child_mutation();

create trigger purchase_payments_guard_mutation
before insert or update or delete on public.purchase_payments
for each row execute function private.guard_purchase_child_mutation();

create or replace function private.validate_purchase_posting()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  line_weight bigint;
  line_total numeric(18, 2);
  payment_total numeric(18, 2);
  seller_has_role boolean;
  payment_account_mismatch boolean;
begin
  if old.status = 'posted' or old.status = 'reversed' then
    raise exception 'Posted purchases are immutable; use a reviewed reversal.';
  end if;

  if new.status <> 'posted' then
    return new;
  end if;

  select
    coalesce(sum(line.weight_kg), 0),
    coalesce(sum(line.final_amount), 0)
  into line_weight, line_total
  from public.purchase_lines line
  where line.purchase_id = new.id;

  select coalesce(sum(payment.amount), 0)
  into payment_total
  from public.purchase_payments payment
  where payment.purchase_id = new.id;

  select exists (
    select 1
    from public.party_roles role
    where role.party_id = new.seller_id and role.role = 'seller'
  ) into seller_has_role;

  select exists (
    select 1
    from public.purchase_payments payment
    join public.bank_accounts account on account.id = payment.bank_account_id
    where payment.purchase_id = new.id
      and account.firm_id <> new.firm_id
  ) into payment_account_mismatch;

  if line_weight <> new.net_weight_kg then
    raise exception 'Commodity weight must equal the Kanta net weight.';
  end if;

  if line_total <= 0 or new.seller_deduction > line_total then
    raise exception 'Seller deduction cannot exceed the commodity total.';
  end if;

  if payment_total > line_total - new.seller_deduction then
    raise exception 'Purchase payment cannot exceed the final payable amount.';
  end if;

  if not seller_has_role then
    raise exception 'Selected party is not registered as a seller.';
  end if;

  if payment_account_mismatch then
    raise exception 'Bank payment must use an account of the purchasing firm.';
  end if;

  new.posted_at := now();
  return new;
end;
$$;

create trigger purchases_validate_posting
before update of status on public.purchases
for each row execute function private.validate_purchase_posting();

create or replace function private.record_purchase_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.audit_events (
    aggregate_type,
    aggregate_id,
    action,
    actor_user_id,
    payload
  ) values (
    'purchase',
    new.id,
    case when tg_op = 'INSERT' then 'draft_created' else 'posted' end,
    (select auth.uid()),
    jsonb_build_object('status', new.status, 'firm_id', new.firm_id)
  );
  return new;
end;
$$;

create trigger purchases_record_insert
after insert on public.purchases
for each row execute function private.record_purchase_audit();

create trigger purchases_record_posting
after update of status on public.purchases
for each row
when (old.status is distinct from new.status)
execute function private.record_purchase_audit();

alter table public.business_firms enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_firm_access enable row level security;
alter table public.parties enable row level security;
alter table public.party_roles enable row level security;
alter table public.commodities enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.purchases enable row level security;
alter table public.purchase_lines enable row level security;
alter table public.purchase_payments enable row level security;
alter table public.audit_events enable row level security;

create policy business_firms_select_accessible
on public.business_firms for select to authenticated
using ((select private.current_user_can_access_firm(id)));

create policy user_profiles_select_allowed
on public.user_profiles for select to authenticated
using (user_id = (select auth.uid()) or (select private.current_user_is_main()));

create policy user_firm_access_select_allowed
on public.user_firm_access for select to authenticated
using (user_id = (select auth.uid()) or (select private.current_user_is_main()));

create policy parties_select_active_users
on public.parties for select to authenticated
using ((select private.current_user_is_active()));

create policy parties_insert_main
on public.parties for insert to authenticated
with check ((select private.current_user_is_main()) and created_by = (select auth.uid()));

create policy parties_update_main
on public.parties for update to authenticated
using ((select private.current_user_is_main()))
with check ((select private.current_user_is_main()));

create policy party_roles_select_active_users
on public.party_roles for select to authenticated
using ((select private.current_user_is_active()));

create policy party_roles_write_main
on public.party_roles for all to authenticated
using ((select private.current_user_is_main()))
with check ((select private.current_user_is_main()));

create policy commodities_select_active_users
on public.commodities for select to authenticated
using ((select private.current_user_is_active()));

create policy commodities_write_main
on public.commodities for all to authenticated
using ((select private.current_user_is_main()))
with check ((select private.current_user_is_main()));

create policy bank_accounts_select_firm
on public.bank_accounts for select to authenticated
using ((select private.current_user_can_access_firm(firm_id)));

create policy bank_accounts_write_main
on public.bank_accounts for all to authenticated
using ((select private.current_user_is_main()) and (select private.current_user_can_access_firm(firm_id)))
with check ((select private.current_user_is_main()) and (select private.current_user_can_access_firm(firm_id)));

create policy purchases_select_firm
on public.purchases for select to authenticated
using ((select private.current_user_can_access_firm(firm_id)));

create policy purchases_insert_draft
on public.purchases for insert to authenticated
with check (
  status = 'draft'
  and created_by = (select auth.uid())
  and (select private.current_user_can_access_firm(firm_id))
);

create policy purchases_update_draft
on public.purchases for update to authenticated
using (status = 'draft' and (select private.current_user_can_access_firm(firm_id)))
with check (
  status in ('draft', 'posted')
  and (select private.current_user_can_access_firm(firm_id))
);

create policy purchase_lines_select_firm
on public.purchase_lines for select to authenticated
using (
  exists (
    select 1 from public.purchases purchase
    where purchase.id = purchase_id
      and (select private.current_user_can_access_firm(purchase.firm_id))
  )
);

create policy purchase_lines_insert_draft
on public.purchase_lines for insert to authenticated
with check ((select private.purchase_is_draft(purchase_id)));

create policy purchase_lines_update_draft
on public.purchase_lines for update to authenticated
using ((select private.purchase_is_draft(purchase_id)))
with check ((select private.purchase_is_draft(purchase_id)));

create policy purchase_lines_delete_draft
on public.purchase_lines for delete to authenticated
using ((select private.purchase_is_draft(purchase_id)));

create policy purchase_payments_select_firm
on public.purchase_payments for select to authenticated
using (
  exists (
    select 1 from public.purchases purchase
    where purchase.id = purchase_id
      and (select private.current_user_can_access_firm(purchase.firm_id))
  )
);

create policy purchase_payments_insert_draft
on public.purchase_payments for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.purchase_is_draft(purchase_id))
);

create policy purchase_payments_update_draft
on public.purchase_payments for update to authenticated
using ((select private.purchase_is_draft(purchase_id)))
with check ((select private.purchase_is_draft(purchase_id)));

create policy purchase_payments_delete_draft
on public.purchase_payments for delete to authenticated
using ((select private.purchase_is_draft(purchase_id)));

create policy audit_events_select_main
on public.audit_events for select to authenticated
using ((select private.current_user_is_main()));

create or replace view public.purchase_summaries
with (security_invoker = true)
as
select
  purchase.id,
  purchase.request_id,
  purchase.firm_id,
  purchase.business_date,
  purchase.seller_id,
  purchase.vehicle_number,
  purchase.weighbridge_name,
  purchase.kanta_number,
  purchase.loaded_weight_kg,
  purchase.empty_weight_kg,
  purchase.net_weight_kg,
  coalesce(line_totals.commodity_total, 0::numeric)::numeric(18, 2) as commodity_total,
  purchase.seller_deduction,
  (coalesce(line_totals.commodity_total, 0::numeric) - purchase.seller_deduction)::numeric(18, 2) as final_payable,
  coalesce(payment_totals.amount_paid, 0::numeric)::numeric(18, 2) as amount_paid,
  (
    coalesce(line_totals.commodity_total, 0::numeric)
    - purchase.seller_deduction
    - coalesce(payment_totals.amount_paid, 0::numeric)
  )::numeric(18, 2) as pending_balance,
  purchase.status,
  purchase.formula_version,
  purchase.remark,
  purchase.created_by,
  purchase.posted_at,
  purchase.created_at,
  purchase.updated_at
from public.purchases purchase
left join lateral (
  select sum(line.final_amount) as commodity_total
  from public.purchase_lines line
  where line.purchase_id = purchase.id
) line_totals on true
left join lateral (
  select sum(payment.amount) as amount_paid
  from public.purchase_payments payment
  where payment.purchase_id = purchase.id
) payment_totals on true;

create or replace function public.post_purchase(payload jsonb, idempotency_key uuid)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  purchase_id bigint;
  requested_firm_id bigint;
  requested_seller_id bigint;
  requested_loaded_weight bigint;
  requested_empty_weight bigint;
  requested_date date;
  payment jsonb;
begin
  if (select auth.uid()) is null or not (select private.current_user_is_active()) then
    raise exception 'Authentication is required.';
  end if;

  select existing.id into purchase_id
  from public.purchases existing
  where existing.request_id = idempotency_key
    and existing.created_by = (select auth.uid());

  if purchase_id is not null then
    return purchase_id;
  end if;

  requested_firm_id := (payload ->> 'firmId')::bigint;
  requested_seller_id := (payload ->> 'sellerId')::bigint;
  requested_loaded_weight := (payload ->> 'loadedWeightKg')::bigint;
  requested_empty_weight := (payload ->> 'emptyWeightKg')::bigint;
  requested_date := (payload ->> 'businessDate')::date;

  if requested_date > (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'A purchase cannot be posted with a future date.';
  end if;

  if requested_date < (now() at time zone 'Asia/Kolkata')::date
    and not (select private.current_user_is_main()) then
    raise exception 'Only a Main user can post a backdated purchase.';
  end if;

  if not (select private.current_user_can_access_firm(requested_firm_id)) then
    raise exception 'You cannot operate the selected firm.';
  end if;

  if jsonb_typeof(payload -> 'lines') <> 'array' or jsonb_array_length(payload -> 'lines') = 0 then
    raise exception 'At least one commodity line is required.';
  end if;

  insert into public.purchases (
    request_id,
    firm_id,
    business_date,
    seller_id,
    vehicle_number,
    weighbridge_name,
    kanta_number,
    loaded_weight_kg,
    empty_weight_kg,
    seller_deduction,
    remark,
    created_by
  ) values (
    idempotency_key,
    requested_firm_id,
    requested_date,
    requested_seller_id,
    btrim(payload ->> 'vehicleNumber'),
    nullif(btrim(payload ->> 'weighbridgeName'), ''),
    nullif(btrim(payload ->> 'kantaNumber'), ''),
    requested_loaded_weight,
    requested_empty_weight,
    coalesce((payload ->> 'sellerDeduction')::numeric, 0),
    nullif(btrim(payload ->> 'remark'), ''),
    (select auth.uid())
  ) returning id into purchase_id;

  insert into public.purchase_lines (
    purchase_id,
    commodity_id,
    sort_order,
    weight_kg,
    rate_per_quintal,
    line_deduction,
    deduction_reason,
    is_residual
  )
  select
    purchase_id,
    line.commodity_id,
    line.ordinality::smallint,
    line.weight_kg,
    line.rate_per_quintal,
    coalesce(line.line_deduction, 0),
    nullif(btrim(line.deduction_reason), ''),
    coalesce(line.is_residual, false)
  from jsonb_to_recordset(payload -> 'lines') with ordinality as line(
    commodity_id bigint,
    weight_kg bigint,
    rate_per_quintal numeric,
    line_deduction numeric,
    deduction_reason text,
    is_residual boolean,
    ordinality bigint
  );

  if jsonb_typeof(payload -> 'payments') = 'array' then
    for payment in select value from jsonb_array_elements(payload -> 'payments')
    loop
      insert into public.purchase_payments (
        purchase_id,
        payment_date,
        payment_mode,
        bank_account_id,
        amount,
        remark,
        created_by
      ) values (
        purchase_id,
        coalesce((payment ->> 'paymentDate')::date, requested_date),
        payment ->> 'paymentMode',
        nullif(payment ->> 'bankAccountId', '')::bigint,
        (payment ->> 'amount')::numeric,
        nullif(btrim(payment ->> 'remark'), ''),
        (select auth.uid())
      );
    end loop;
  end if;

  update public.purchases
  set status = 'posted'
  where id = purchase_id;

  return purchase_id;
end;
$$;

revoke all on all tables in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on function public.post_purchase(jsonb, uuid) from public, anon;

grant usage on schema private to authenticated;
grant execute on function private.current_user_is_active() to authenticated;
grant execute on function private.current_user_is_main() to authenticated;
grant execute on function private.current_user_can_access_firm(bigint) to authenticated;
grant execute on function private.purchase_is_draft(bigint) to authenticated;

grant select on public.business_firms,
  public.user_profiles,
  public.user_firm_access,
  public.parties,
  public.party_roles,
  public.commodities,
  public.bank_accounts,
  public.purchases,
  public.purchase_lines,
  public.purchase_payments,
  public.purchase_summaries,
  public.audit_events
to authenticated;

grant insert, update on public.parties,
  public.party_roles,
  public.commodities,
  public.bank_accounts,
  public.purchases,
  public.purchase_lines,
  public.purchase_payments
to authenticated;

grant delete on public.party_roles,
  public.purchase_lines,
  public.purchase_payments
to authenticated;

grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.post_purchase(jsonb, uuid) to authenticated;

insert into public.business_firms (name)
values ('Sai Traders'), ('Guru Dev Traders');

insert into public.commodities (name, local_name)
values ('Rice', 'चावल'), ('Wheat', 'गेहूँ');

insert into public.user_profiles (user_id, display_name, system_role)
select
  auth_user.id,
  coalesce(nullif(btrim(auth_user.raw_user_meta_data ->> 'display_name'), ''), split_part(auth_user.email, '@', 1)),
  'main'
from auth.users auth_user
on conflict (user_id) do nothing;

insert into public.user_firm_access (user_id, firm_id)
select profile.user_id, firm.id
from public.user_profiles profile
cross join public.business_firms firm
on conflict (user_id, firm_id) do nothing;

commit;
