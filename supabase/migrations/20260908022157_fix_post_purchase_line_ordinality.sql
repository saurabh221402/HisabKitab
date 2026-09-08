begin;

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
    item.ordinality::smallint,
    line.weight_kg,
    line.rate_per_quintal,
    coalesce(line.line_deduction, 0),
    nullif(btrim(line.deduction_reason), ''),
    coalesce(line.is_residual, false)
  from jsonb_array_elements(payload -> 'lines') with ordinality as item(value, ordinality)
  cross join lateral jsonb_to_record(item.value) as line(
    commodity_id bigint,
    weight_kg bigint,
    rate_per_quintal numeric,
    line_deduction numeric,
    deduction_reason text,
    is_residual boolean
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

revoke all on function public.post_purchase(jsonb, uuid) from public, anon;
grant execute on function public.post_purchase(jsonb, uuid) to authenticated;

commit;
