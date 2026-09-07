# Sale Example 001 — Rice Sale With Broker and Transport

Source: Business owner example supplied 7 September 2026

Validation status: Gross sale and ₹3,000 buyer deduction validated; remaining costs and payment unresolved

## 1. Known inputs

| Field | Value |
| --- | --- |
| Commodity | Rice |
| Bags | 300 |
| Weight | 300 quintal |
| Rate | ₹3,000 per quintal |
| Buyer | XYZ, selected from party master |
| Broker | Selected from party master |
| Brokerage | `brokerage rate × 300 quintal`, payable by the business |
| Transporter | Selected from party master |
| Transport | `transport rate × 300 quintal`; payer not yet supplied |
| Buyer deduction | ₹3,000 |
| Expense | ₹43 total; settlement effect not yet supplied |
| Amount received | Not supplied |

## 2. Validated gross sale

```text
Gross sale = 300 quintal × ₹3,000 per quintal
           = ₹9,00,000
```

## 3. Validated buyer receivable

```text
Gross sale                                      ₹9,00,000
Less: buyer deduction                              ₹3,000
----------------------------------------------------------
Current validated buyer receivable              ₹8,97,000

Amount received                                 [unknown]
----------------------------------------------------------
Pending buyer balance                           [unknown]
```

Brokerage is payable by the business to the broker and is a separate business expense/liability. It does not reduce the buyer receivable. Transport and the ₹43 total expense must not alter the buyer balance until their payer and settlement effect are confirmed.

## 4. Rules established

1. Buyer, broker, and transporter are selected from registered party masters.
2. Sale records bag count and actual physical weight independently. Bag weights vary and no automatic bag-to-weight conversion is allowed.
3. Sale rate can be per quintal.
4. Brokerage is paid by the business and calculated as `brokerage rate × actual sale weight in quintal`.
5. Transport is calculated as `transport rate × actual sale weight in quintal`.
6. Sale supports deductions, expenses, amount received, and pending balance.
7. A Kanta parchi may be attached even when no external sale document exists.
8. Every sale receives an internal HisabKitab number even if the current paper workflow has no sale paper.

## 5. Questions required to finish this example

1. What brokerage rate applies in this example?
2. Is transport paid by the business, charged to the buyer, or borne by the seller?
3. Is the ₹43 total a separate business expense, or is it deducted from the buyer receivable?
4. What transport rate applies in this example?
5. What amount was received, by cash or bank, and what remained pending?
6. Which business firm made the sale?
