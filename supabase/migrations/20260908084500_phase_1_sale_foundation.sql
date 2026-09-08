begin;

create table public.sales (
  id bigint generated always as identity primary key,
  request_id uuid not null unique,
  firm_id bigint not null references public.business_firms(id) on delete restrict,
  business_date date not null,
  buyer_id bigint not null references public.parties(id) on delete restrict,
  commodity_id bigint not null references public.commodities(id) on delete restrict,
  bag_count bigint,
  weight_kg bigint not null,
  rate_per_quintal numeric(18, 2) not null,
  gross_amount numeric(18, 2) generated always as (
    (weight_kg::numeric * rate_per_quintal) / 100
  ) stored,
  buyer_deduction numeric(18, 2) not null default 0,
  buyer_deduction_reason text,
  final_receivable numeric(18, 2) generated always as (
    ((weight_kg::numeric * rate_per_quintal) / 100) - buyer_deduction
  ) stored,
  broker_id bigint references public.parties(id) on delete restrict,
  brokerage_rate_per_quintal numeric(18, 2) not null default 0,
  brokerage_amount numeric(18, 2) generated always as (
    (weight_kg::numeric * brokerage_rate_per_quintal) / 100
  ) stored,
  transporter_id bigint references public.parties(id) on delete restrict,
  transport_rate_per_quintal numeric(18, 2) not null default 0,
  transport_amount numeric(18, 2) generated always as (
    (weight_kg::numeric * transport_rate_per_quintal) / 100
  ) stored,
  vehicle_number text,
  kanta_number text,
  remark text,
  status text not null default 'draft',
  formula_version smallint not null default 1,
  created_by uuid not null references public.user_profiles(user_id) on delete restrict,
  posted_at timestamptz,
  reversed_at timestamptz,
  reversal_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_bag_count_positive check (bag_count is null or bag_count > 0),
  constraint sales_weight_positive check (weight_kg > 0),
  constraint sales_rate_positive_whole_rupee check (
    rate_per_quintal > 0 and rate_per_quintal = trunc(rate_per_quintal)
  ),
  constraint sales_buyer_deduction_non_negative check (buyer_deduction >= 0),
  constraint sales_buyer_deduction_valid check (
    buyer_deduction <= (weight_kg::numeric * rate_per_quintal) / 100
  ),
  constraint sales_buyer_deduction_reason_consistent check (
    buyer_deduction = 0
    or (buyer_deduction_reason is not null and btrim(buyer_deduction_reason) <> '')
  ),
  constraint sales_brokerage_rate_whole_rupee check (
    brokerage_rate_per_quintal >= 0
    and brokerage_rate_per_quintal = trunc(brokerage_rate_per_quintal)
  ),
  constraint sales_broker_consistent check (
    (broker_id is null and brokerage_rate_per_quintal = 0)
    or (broker_id is not null and brokerage_rate_per_quintal > 0)
  ),
  constraint sales_transport_rate_whole_rupee check (
    transport_rate_per_quintal >= 0
    and transport_rate_per_quintal = trunc(transport_rate_per_quintal)
  ),
  constraint sales_transporter_consistent check (
    (transporter_id is null and transport_rate_per_quintal = 0)
    or (transporter_id is not null and transport_rate_per_quintal > 0)
  ),
  constraint sales_status_valid check (status in ('draft', 'posted', 'reversed')),
  constraint sales_formula_version_positive check (formula_version > 0),
  constraint sales_posted_at_consistent check (
    (status = 'draft' and posted_at is null and reversed_at is null)
    or (status = 'posted' and posted_at is not null and reversed_at is null)
    or (
      status = 'reversed'
      and posted_at is not null
      and reversed_at is not null
      and btrim(reversal_reason) <> ''
    )
  )
);

create index sales_firm_date_idx on public.sales (firm_id, business_date desc);
create index sales_buyer_date_idx on public.sales (buyer_id, business_date desc);
create index sales_commodity_date_idx on public.sales (commodity_id, business_date desc);
create index sales_broker_date_idx on public.sales (broker_id, business_date desc)
  where broker_id is not null;
create index sales_transporter_date_idx on public.sales (transporter_id, business_date desc)
  where transporter_id is not null;
create index sales_created_by_idx on public.sales (created_by);

create table public.sale_receipts (
  id bigint generated always as identity primary key,
  sale_id bigint not null references public.sales(id) on delete restrict,
  receipt_date date not null,
  payment_mode text not null,
  bank_account_id bigint references public.bank_accounts(id) on delete restrict,
  amount numeric(18, 2) not null,
  remark text,
  created_by uuid not null references public.user_profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint sale_receipts_mode_valid check (payment_mode in ('cash', 'bank')),
  constraint sale_receipts_account_consistent check (
    (payment_mode = 'cash' and bank_account_id is null)
    or (payment_mode = 'bank' and bank_account_id is not null)
  ),
  constraint sale_receipts_amount_positive check (amount > 0)
);

create index sale_receipts_sale_id_idx on public.sale_receipts (sale_id);
create index sale_receipts_bank_account_id_idx on public.sale_receipts (bank_account_id)
  where bank_account_id is not null;
create index sale_receipts_created_by_idx on public.sale_receipts (created_by);
create index sale_receipts_date_idx on public.sale_receipts (receipt_date desc);

create trigger sales_set_updated_at
before update on public.sales
for each row execute function private.set_updated_at();

create or replace function private.sale_is_draft(target_sale_id bigint)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sales sale
    where sale.id = target_sale_id
      and sale.status = 'draft'
      and (select private.current_user_can_access_firm(sale.firm_id))
  );
$$;

create or replace function private.guard_sale_receipt_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  target_sale_id bigint;
begin
  target_sale_id := coalesce(new.sale_id, old.sale_id);

  if not (select private.sale_is_draft(target_sale_id)) then
    raise exception 'Only an accessible draft sale can be changed.';
  end if;

  return coalesce(new, old);
end;
$$;

create trigger sale_receipts_guard_mutation
before insert or update or delete on public.sale_receipts
for each row execute function private.guard_sale_receipt_mutation();

create or replace function private.validate_sale_posting()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  receipt_total numeric(18, 2);
  buyer_has_role boolean;
  broker_has_role boolean;
  transporter_has_role boolean;
  receipt_account_mismatch boolean;
begin
  if old.status = 'posted' or old.status = 'reversed' then
    raise exception 'Posted sales are immutable; use a reviewed reversal.';
  end if;

  if new.status <> 'posted' then
    return new;
  end if;

  select coalesce(sum(receipt.amount), 0)
  into receipt_total
  from public.sale_receipts receipt
  where receipt.sale_id = new.id;

  select exists (
    select 1
    from public.party_roles role
    where role.party_id = new.buyer_id and role.role = 'buyer'
  ) into buyer_has_role;

  select new.broker_id is null or exists (
    select 1
    from public.party_roles role
    where role.party_id = new.broker_id and role.role = 'broker'
  ) into broker_has_role;

  select new.transporter_id is null or exists (
    select 1
    from public.party_roles role
    where role.party_id = new.transporter_id and role.role = 'transporter'
  ) into transporter_has_role;

  select exists (
    select 1
    from public.sale_receipts receipt
    join public.bank_accounts account on account.id = receipt.bank_account_id
    where receipt.sale_id = new.id
      and account.firm_id <> new.firm_id
  ) into receipt_account_mismatch;

  if receipt_total > new.final_receivable then
    raise exception 'Sale receipts cannot exceed the final buyer receivable.';
  end if;

  if not buyer_has_role then
    raise exception 'Selected party is not registered as a buyer.';
  end if;

  if not broker_has_role then
    raise exception 'Selected broker does not have the broker role.';
  end if;

  if not transporter_has_role then
    raise exception 'Selected transporter does not have the transporter role.';
  end if;

  if receipt_account_mismatch then
    raise exception 'Bank receipt must use an account of the selling firm.';
  end if;

  new.posted_at := now();
  return new;
end;
$$;

create trigger sales_validate_posting
before update of status on public.sales
for each row execute function private.validate_sale_posting();

create or replace function private.record_sale_audit()
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
    'sale',
    new.id,
    case when tg_op = 'INSERT' then 'draft_created' else 'posted' end,
    (select auth.uid()),
    jsonb_build_object('status', new.status, 'firm_id', new.firm_id)
  );
  return new;
end;
$$;

create trigger sales_record_insert
after insert on public.sales
for each row execute function private.record_sale_audit();

create trigger sales_record_posting
after update of status on public.sales
for each row
when (old.status is distinct from new.status)
execute function private.record_sale_audit();

alter table public.sales enable row level security;
alter table public.sale_receipts enable row level security;

revoke all on public.sales, public.sale_receipts from public, anon;

create policy sales_select_firm
on public.sales for select to authenticated
using ((select private.current_user_can_access_firm(firm_id)));

create policy sales_insert_draft
on public.sales for insert to authenticated
with check (
  status = 'draft'
  and created_by = (select auth.uid())
  and (select private.current_user_can_access_firm(firm_id))
);

create policy sales_update_draft
on public.sales for update to authenticated
using (status = 'draft' and (select private.current_user_can_access_firm(firm_id)))
with check (
  status in ('draft', 'posted')
  and (select private.current_user_can_access_firm(firm_id))
);

create policy sale_receipts_select_firm
on public.sale_receipts for select to authenticated
using (
  exists (
    select 1
    from public.sales sale
    where sale.id = sale_id
      and (select private.current_user_can_access_firm(sale.firm_id))
  )
);

create policy sale_receipts_insert_draft
on public.sale_receipts for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (select private.sale_is_draft(sale_id))
);

create policy sale_receipts_update_draft
on public.sale_receipts for update to authenticated
using ((select private.sale_is_draft(sale_id)))
with check ((select private.sale_is_draft(sale_id)));

create policy sale_receipts_delete_draft
on public.sale_receipts for delete to authenticated
using ((select private.sale_is_draft(sale_id)));

create or replace view public.sale_summaries
with (security_invoker = true)
as
select
  sale.id,
  sale.request_id,
  sale.firm_id,
  sale.business_date,
  sale.buyer_id,
  sale.commodity_id,
  sale.bag_count,
  sale.weight_kg,
  sale.rate_per_quintal,
  sale.gross_amount,
  sale.buyer_deduction,
  sale.buyer_deduction_reason,
  sale.final_receivable,
  sale.broker_id,
  sale.brokerage_rate_per_quintal,
  sale.brokerage_amount,
  sale.transporter_id,
  sale.transport_rate_per_quintal,
  sale.transport_amount,
  coalesce(receipt_totals.amount_received, 0::numeric)::numeric(18, 2) as amount_received,
  (
    sale.final_receivable - coalesce(receipt_totals.amount_received, 0::numeric)
  )::numeric(18, 2) as pending_balance,
  sale.vehicle_number,
  sale.kanta_number,
  sale.remark,
  sale.status,
  sale.formula_version,
  sale.created_by,
  sale.posted_at,
  sale.created_at,
  sale.updated_at
from public.sales sale
left join lateral (
  select sum(receipt.amount) as amount_received
  from public.sale_receipts receipt
  where receipt.sale_id = sale.id
) receipt_totals on true;

revoke all on public.sale_summaries from public, anon;

create or replace function public.post_sale(payload jsonb, idempotency_key uuid)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  sale_id bigint;
  requested_firm_id bigint;
  requested_date date;
  receipt jsonb;
begin
  if (select auth.uid()) is null or not (select private.current_user_is_active()) then
    raise exception 'Authentication is required.';
  end if;

  select existing.id into sale_id
  from public.sales existing
  where existing.request_id = idempotency_key
    and existing.created_by = (select auth.uid());

  if sale_id is not null then
    return sale_id;
  end if;

  requested_firm_id := (payload ->> 'firmId')::bigint;
  requested_date := (payload ->> 'businessDate')::date;

  if requested_date > (now() at time zone 'Asia/Kolkata')::date then
    raise exception 'A sale cannot be posted with a future date.';
  end if;

  if requested_date < (now() at time zone 'Asia/Kolkata')::date
    and not (select private.current_user_is_main()) then
    raise exception 'Only a Main user can post a backdated sale.';
  end if;

  if not (select private.current_user_can_access_firm(requested_firm_id)) then
    raise exception 'You cannot operate the selected firm.';
  end if;

  insert into public.sales (
    request_id,
    firm_id,
    business_date,
    buyer_id,
    commodity_id,
    bag_count,
    weight_kg,
    rate_per_quintal,
    buyer_deduction,
    buyer_deduction_reason,
    broker_id,
    brokerage_rate_per_quintal,
    transporter_id,
    transport_rate_per_quintal,
    vehicle_number,
    kanta_number,
    remark,
    created_by
  ) values (
    idempotency_key,
    requested_firm_id,
    requested_date,
    (payload ->> 'buyerId')::bigint,
    (payload ->> 'commodityId')::bigint,
    nullif(payload ->> 'bagCount', '')::bigint,
    (payload ->> 'weightKg')::bigint,
    (payload ->> 'ratePerQuintal')::numeric,
    coalesce((payload ->> 'buyerDeduction')::numeric, 0),
    nullif(btrim(payload ->> 'buyerDeductionReason'), ''),
    nullif(payload ->> 'brokerId', '')::bigint,
    coalesce((payload ->> 'brokerageRatePerQuintal')::numeric, 0),
    nullif(payload ->> 'transporterId', '')::bigint,
    coalesce((payload ->> 'transportRatePerQuintal')::numeric, 0),
    nullif(btrim(payload ->> 'vehicleNumber'), ''),
    nullif(btrim(payload ->> 'kantaNumber'), ''),
    nullif(btrim(payload ->> 'remark'), ''),
    (select auth.uid())
  ) returning id into sale_id;

  if jsonb_typeof(payload -> 'receipts') = 'array' then
    for receipt in select value from jsonb_array_elements(payload -> 'receipts')
    loop
      insert into public.sale_receipts (
        sale_id,
        receipt_date,
        payment_mode,
        bank_account_id,
        amount,
        remark,
        created_by
      ) values (
        sale_id,
        coalesce((receipt ->> 'receiptDate')::date, requested_date),
        receipt ->> 'paymentMode',
        nullif(receipt ->> 'bankAccountId', '')::bigint,
        (receipt ->> 'amount')::numeric,
        nullif(btrim(receipt ->> 'remark'), ''),
        (select auth.uid())
      );
    end loop;
  end if;

  update public.sales
  set status = 'posted'
  where id = sale_id;

  return sale_id;
end;
$$;

grant execute on function private.sale_is_draft(bigint) to authenticated;

grant select on public.sales,
  public.sale_receipts,
  public.sale_summaries
to authenticated;

grant insert, update on public.sales,
  public.sale_receipts
to authenticated;

grant delete on public.sale_receipts to authenticated;
grant usage, select on all sequences in schema public to authenticated;

revoke all on function public.post_sale(jsonb, uuid) from public, anon;
grant execute on function public.post_sale(jsonb, uuid) to authenticated;

commit;
