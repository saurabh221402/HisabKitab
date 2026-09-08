begin;

create table public.operational_cash_opening (
  singleton boolean primary key default true,
  opening_date date not null,
  amount numeric(18, 2) not null,
  remark text not null,
  created_by uuid not null references public.user_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint operational_cash_opening_singleton check (singleton),
  constraint operational_cash_opening_amount_non_negative check (amount >= 0),
  constraint operational_cash_opening_remark_not_blank check (btrim(remark) <> '')
);

create index operational_cash_opening_created_by_idx
  on public.operational_cash_opening (created_by);

create or replace function private.record_cash_opening_audit()
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
    'operational_cash',
    1,
    'opening_set',
    (select auth.uid()),
    jsonb_build_object(
      'opening_date', new.opening_date,
      'amount', new.amount,
      'remark', new.remark
    )
  );
  return new;
end;
$$;

create trigger operational_cash_opening_record_insert
after insert on public.operational_cash_opening
for each row execute function private.record_cash_opening_audit();

create table public.cash_book_entries (
  id bigint generated always as identity primary key,
  request_id uuid not null unique,
  firm_id bigint not null references public.business_firms(id) on delete restrict,
  business_date date not null,
  direction text not null,
  amount numeric(18, 2) not null,
  party_id bigint references public.parties(id) on delete restrict,
  counterparty_name text,
  remark text not null,
  status text not null default 'posted',
  created_by uuid not null references public.user_profiles(user_id) on delete restrict,
  reversed_at timestamptz,
  reversal_reason text,
  created_at timestamptz not null default now(),
  constraint cash_book_entries_direction_valid check (direction in ('in', 'out')),
  constraint cash_book_entries_amount_positive check (amount > 0),
  constraint cash_book_entries_counterparty_present check (
    party_id is not null
    or (counterparty_name is not null and btrim(counterparty_name) <> '')
  ),
  constraint cash_book_entries_remark_not_blank check (btrim(remark) <> ''),
  constraint cash_book_entries_status_valid check (status in ('posted', 'reversed')),
  constraint cash_book_entries_reversal_consistent check (
    (status = 'posted' and reversed_at is null and reversal_reason is null)
    or (
      status = 'reversed'
      and reversed_at is not null
      and reversal_reason is not null
      and btrim(reversal_reason) <> ''
    )
  )
);

create index cash_book_entries_firm_date_idx
  on public.cash_book_entries (firm_id, business_date desc);
create index cash_book_entries_party_date_idx
  on public.cash_book_entries (party_id, business_date desc)
  where party_id is not null;
create index cash_book_entries_created_by_idx on public.cash_book_entries (created_by);

create or replace function private.record_cash_entry_audit()
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
    'cash_entry',
    new.id,
    'posted',
    (select auth.uid()),
    jsonb_build_object(
      'firm_id', new.firm_id,
      'direction', new.direction,
      'amount', new.amount
    )
  );
  return new;
end;
$$;

create trigger cash_book_entries_record_insert
after insert on public.cash_book_entries
for each row execute function private.record_cash_entry_audit();

alter table public.operational_cash_opening enable row level security;
alter table public.cash_book_entries enable row level security;

revoke all on public.operational_cash_opening, public.cash_book_entries
from public, anon;

create policy operational_cash_opening_select_active
on public.operational_cash_opening for select to authenticated
using ((select private.current_user_is_active()));

create policy operational_cash_opening_insert_main
on public.operational_cash_opening for insert to authenticated
with check (
  (select private.current_user_is_main())
  and created_by = (select auth.uid())
);

create policy cash_book_entries_select_firm
on public.cash_book_entries for select to authenticated
using ((select private.current_user_can_access_firm(firm_id)));

create policy cash_book_entries_insert_posted
on public.cash_book_entries for insert to authenticated
with check (
  status = 'posted'
  and created_by = (select auth.uid())
  and (select private.current_user_can_access_firm(firm_id))
);

create or replace view public.cash_movements
with (security_invoker = true)
as
select
  'purchase_payment'::text as source_type,
  payment.id as source_record_id,
  purchase.id as transaction_id,
  payment.payment_date as business_date,
  purchase.firm_id,
  'out'::text as direction,
  payment.amount,
  purchase.seller_id as party_id,
  null::text as counterparty_name,
  payment.remark,
  payment.created_by,
  payment.created_at
from public.purchase_payments payment
join public.purchases purchase on purchase.id = payment.purchase_id
where payment.payment_mode = 'cash'
  and purchase.status = 'posted'

union all

select
  'sale_receipt'::text as source_type,
  receipt.id as source_record_id,
  sale.id as transaction_id,
  receipt.receipt_date as business_date,
  sale.firm_id,
  'in'::text as direction,
  receipt.amount,
  sale.buyer_id as party_id,
  null::text as counterparty_name,
  receipt.remark,
  receipt.created_by,
  receipt.created_at
from public.sale_receipts receipt
join public.sales sale on sale.id = receipt.sale_id
where receipt.payment_mode = 'cash'
  and sale.status = 'posted'

union all

select
  'manual'::text as source_type,
  entry.id as source_record_id,
  null::bigint as transaction_id,
  entry.business_date,
  entry.firm_id,
  entry.direction,
  entry.amount,
  entry.party_id,
  entry.counterparty_name,
  entry.remark,
  entry.created_by,
  entry.created_at
from public.cash_book_entries entry
where entry.status = 'posted';

revoke all on public.cash_movements from public, anon;

create or replace function public.post_cash_entry(
  payload jsonb,
  idempotency_key uuid
)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  cash_entry_id bigint;
  requested_date date;
  requested_firm_id bigint;
begin
  if (select auth.uid()) is null or not (select private.current_user_is_active()) then
    raise exception 'Authentication is required.';
  end if;

  select existing.id into cash_entry_id
  from public.cash_book_entries existing
  where existing.request_id = idempotency_key
    and existing.created_by = (select auth.uid());

  if cash_entry_id is not null then
    return cash_entry_id;
  end if;

  requested_date := (payload ->> 'businessDate')::date;
  requested_firm_id := (payload ->> 'firmId')::bigint;

  if requested_date > (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'A cash entry cannot be posted with a future date.';
  end if;

  if requested_date < (now() at time zone 'Asia/Kolkata')::date
    and not (select private.current_user_is_main()) then
    raise exception 'Only a Main user can post a backdated cash entry.';
  end if;

  if not (select private.current_user_can_access_firm(requested_firm_id)) then
    raise exception 'You cannot operate the selected firm.';
  end if;

  insert into public.cash_book_entries (
    request_id,
    firm_id,
    business_date,
    direction,
    amount,
    party_id,
    counterparty_name,
    remark,
    created_by
  ) values (
    idempotency_key,
    requested_firm_id,
    requested_date,
    payload ->> 'direction',
    (payload ->> 'amount')::numeric,
    nullif(payload ->> 'partyId', '')::bigint,
    nullif(btrim(payload ->> 'personName'), ''),
    btrim(payload ->> 'remark'),
    (select auth.uid())
  ) returning id into cash_entry_id;

  return cash_entry_id;
end;
$$;

create or replace function public.get_rokad_day(target_date date)
returns table (
  opening_configured boolean,
  opening_date date,
  opening_balance numeric(18, 2),
  cash_in numeric(18, 2),
  cash_out numeric(18, 2),
  closing_balance numeric(18, 2)
)
language sql
stable
security invoker
set search_path = ''
as $$
  with opening as (
    select
      max(cash.opening_date) as opening_date,
      coalesce(max(cash.amount), 0::numeric) as amount
    from public.operational_cash_opening cash
  ),
  prior_movement as (
    select coalesce(sum(
      case movement.direction
        when 'in' then movement.amount
        else -movement.amount
      end
    ), 0::numeric) as amount
    from public.cash_movements movement
    cross join opening
    where movement.business_date < target_date
      and (
        opening.opening_date is null
        or movement.business_date >= opening.opening_date
      )
  ),
  selected_day as (
    select
      coalesce(sum(movement.amount) filter (where movement.direction = 'in'), 0::numeric) as cash_in,
      coalesce(sum(movement.amount) filter (where movement.direction = 'out'), 0::numeric) as cash_out
    from public.cash_movements movement
    cross join opening
    where movement.business_date = target_date
      and (
        opening.opening_date is null
        or movement.business_date >= opening.opening_date
      )
  )
  select
    opening.opening_date is not null,
    opening.opening_date,
    (opening.amount + prior_movement.amount)::numeric(18, 2),
    selected_day.cash_in::numeric(18, 2),
    selected_day.cash_out::numeric(18, 2),
    (
      opening.amount
      + prior_movement.amount
      + selected_day.cash_in
      - selected_day.cash_out
    )::numeric(18, 2)
  from opening
  cross join prior_movement
  cross join selected_day;
$$;

grant select on public.operational_cash_opening,
  public.cash_book_entries,
  public.cash_movements
to authenticated;

grant insert on public.operational_cash_opening,
  public.cash_book_entries
to authenticated;

grant usage, select on all sequences in schema public to authenticated;

revoke all on function public.post_cash_entry(jsonb, uuid) from public, anon;
grant execute on function public.post_cash_entry(jsonb, uuid) to authenticated;

revoke all on function public.get_rokad_day(date) from public, anon;
grant execute on function public.get_rokad_day(date) to authenticated;

commit;
