begin;

create or replace view public.bank_movements
with (security_invoker = true)
as
select
  'purchase_payment'::text as source_type,
  payment.id as source_record_id,
  purchase.id as transaction_id,
  payment.payment_date as business_date,
  purchase.firm_id,
  payment.bank_account_id,
  'out'::text as direction,
  payment.amount,
  purchase.seller_id as party_id,
  payment.remark,
  payment.created_by,
  payment.created_at
from public.purchase_payments payment
join public.purchases purchase on purchase.id = payment.purchase_id
where payment.payment_mode = 'bank'
  and purchase.status = 'posted'

union all

select
  'sale_receipt'::text as source_type,
  receipt.id as source_record_id,
  sale.id as transaction_id,
  receipt.receipt_date as business_date,
  sale.firm_id,
  receipt.bank_account_id,
  'in'::text as direction,
  receipt.amount,
  sale.buyer_id as party_id,
  receipt.remark,
  receipt.created_by,
  receipt.created_at
from public.sale_receipts receipt
join public.sales sale on sale.id = receipt.sale_id
where receipt.payment_mode = 'bank'
  and sale.status = 'posted';

revoke all on public.bank_movements from public, anon;

create or replace view public.bank_account_balances
with (security_invoker = true)
as
select
  account.id,
  account.firm_id,
  account.name,
  account.account_last_four,
  account.opening_balance,
  account.opening_date,
  (
    account.opening_balance
    + coalesce(sum(
      case movement.direction
        when 'in' then movement.amount
        else -movement.amount
      end
    ) filter (
      where account.opening_date is null
        or movement.business_date >= account.opening_date
    ), 0::numeric)
  )::numeric(18, 2) as current_balance,
  account.is_active
from public.bank_accounts account
left join public.bank_movements movement on movement.bank_account_id = account.id
group by account.id;

revoke all on public.bank_account_balances from public, anon;

create or replace view public.recent_transactions
with (security_invoker = true)
as
select
  'purchase'::text as transaction_type,
  purchase.id as transaction_id,
  purchase.business_date,
  purchase.firm_id,
  purchase.seller_id as party_id,
  purchase.net_weight_kg as weight_kg,
  purchase.final_payable as amount,
  purchase.pending_balance,
  purchase.created_at
from public.purchase_summaries purchase
where purchase.status = 'posted'

union all

select
  'sale'::text as transaction_type,
  sale.id as transaction_id,
  sale.business_date,
  sale.firm_id,
  sale.buyer_id as party_id,
  sale.weight_kg,
  sale.gross_amount as amount,
  sale.pending_balance,
  sale.created_at
from public.sale_summaries sale
where sale.status = 'posted';

revoke all on public.recent_transactions from public, anon;

create or replace function public.get_dashboard_overview(target_date date)
returns table (
  net_purchase_value numeric(18, 2),
  gross_sale_value numeric(18, 2),
  seller_outstanding numeric(18, 2),
  buyer_outstanding numeric(18, 2),
  purchase_weight_kg numeric,
  sale_weight_kg numeric,
  purchase_count bigint,
  sale_count bigint,
  operational_cash_balance numeric(18, 2),
  bank_balance numeric(18, 2),
  total_available_funds numeric(18, 2),
  cash_opening_configured boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  with purchase_position as (
    select
      coalesce(sum(summary.final_payable) filter (
        where summary.business_date = target_date
      ), 0::numeric) as net_purchase_value,
      coalesce(sum(summary.pending_balance) filter (
        where summary.business_date <= target_date
      ), 0::numeric) as seller_outstanding,
      coalesce(sum(summary.net_weight_kg) filter (
        where summary.business_date = target_date
      ), 0::numeric) as purchase_weight_kg,
      count(*) filter (where summary.business_date = target_date) as purchase_count
    from public.purchase_summaries summary
    where summary.status = 'posted'
  ),
  sale_position as (
    select
      coalesce(sum(summary.gross_amount) filter (
        where summary.business_date = target_date
      ), 0::numeric) as gross_sale_value,
      coalesce(sum(summary.pending_balance) filter (
        where summary.business_date <= target_date
      ), 0::numeric) as buyer_outstanding,
      coalesce(sum(summary.weight_kg) filter (
        where summary.business_date = target_date
      ), 0::numeric) as sale_weight_kg,
      count(*) filter (where summary.business_date = target_date) as sale_count
    from public.sale_summaries summary
    where summary.status = 'posted'
  ),
  cash_position as (
    select * from public.get_rokad_day(target_date)
  ),
  bank_position as (
    select coalesce(sum(balance.current_balance), 0::numeric) as amount
    from public.bank_account_balances balance
    where balance.is_active
  )
  select
    purchase_position.net_purchase_value::numeric(18, 2),
    sale_position.gross_sale_value::numeric(18, 2),
    purchase_position.seller_outstanding::numeric(18, 2),
    sale_position.buyer_outstanding::numeric(18, 2),
    purchase_position.purchase_weight_kg,
    sale_position.sale_weight_kg,
    purchase_position.purchase_count,
    sale_position.sale_count,
    cash_position.closing_balance::numeric(18, 2),
    bank_position.amount::numeric(18, 2),
    (cash_position.closing_balance + bank_position.amount)::numeric(18, 2),
    cash_position.opening_configured
  from purchase_position
  cross join sale_position
  cross join cash_position
  cross join bank_position;
$$;

grant select on public.bank_movements,
  public.bank_account_balances,
  public.recent_transactions
to authenticated;

revoke all on function public.get_dashboard_overview(date) from public, anon;
grant execute on function public.get_dashboard_overview(date) to authenticated;

commit;
