begin;

create or replace view public.party_positions
with (security_invoker = true)
as
with activity as (
  select
    purchase.firm_id,
    purchase.seller_id as party_id,
    purchase.pending_balance as seller_outstanding,
    0::numeric as buyer_outstanding,
    0::numeric as brokerage_outstanding,
    0::numeric as transport_outstanding,
    purchase.business_date as last_activity_date
  from public.purchase_summaries purchase
  where purchase.status = 'posted'

  union all

  select
    sale.firm_id,
    sale.buyer_id as party_id,
    0::numeric,
    sale.pending_balance,
    0::numeric,
    0::numeric,
    sale.business_date
  from public.sale_summaries sale
  where sale.status = 'posted'

  union all

  select
    sale.firm_id,
    sale.broker_id as party_id,
    0::numeric,
    0::numeric,
    sale.brokerage_amount,
    0::numeric,
    sale.business_date
  from public.sale_summaries sale
  where sale.status = 'posted'
    and sale.broker_id is not null

  union all

  select
    sale.firm_id,
    sale.transporter_id as party_id,
    0::numeric,
    0::numeric,
    0::numeric,
    sale.transport_amount,
    sale.business_date
  from public.sale_summaries sale
  where sale.status = 'posted'
    and sale.transporter_id is not null
)
select
  activity.firm_id,
  activity.party_id,
  sum(activity.seller_outstanding)::numeric(18, 2) as seller_outstanding,
  sum(activity.buyer_outstanding)::numeric(18, 2) as buyer_outstanding,
  sum(activity.brokerage_outstanding)::numeric(18, 2) as brokerage_outstanding,
  sum(activity.transport_outstanding)::numeric(18, 2) as transport_outstanding,
  max(activity.last_activity_date) as last_activity_date
from activity
group by activity.firm_id, activity.party_id;

revoke all on public.party_positions from public, anon;
grant select on public.party_positions to authenticated;

commit;
