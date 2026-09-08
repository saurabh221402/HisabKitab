# Sale Example 001 — Rice Sale With Broker and Transport

Source: Business owner example supplied 7 September 2026

Last updated: 8 September 2026

Validation status: Sale formula validated; exact rates, receipt split, and selling firm remain unresolved

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
| Transport | `transport rate × 300 quintal`, payable by the business |
| Buyer deduction | ₹3,000; actual entries require a reason such as moisture or quality |
| Amount received | Split between cash and the selling firm's bank account; exact amounts not supplied |

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
Final buyer receivable                          ₹8,97,000

Less: cash receipt                              [unknown]
Less: firm bank-account receipt                 [unknown]
----------------------------------------------------------
Pending buyer balance                           [unknown]
```

Brokerage and transport are payable by the business as separate costs/liabilities. Neither reduces the buyer receivable. The earlier generic ₹43 expense is removed from the Phase 1 sale workflow rather than given an invented accounting effect.

## 4. Rules established

1. Buyer, broker, and transporter are selected from registered party masters.
2. Sale records bag count and actual physical weight independently. Bag weights vary and no automatic bag-to-weight conversion is allowed.
3. Sale rate can be per quintal.
4. Brokerage is paid by the business and calculated as `brokerage rate × actual sale weight in quintal`.
5. Transport is calculated as `transport rate × actual sale weight in quintal`, is borne by the business, and does not reduce buyer receivable.
6. Each buyer deduction requires a reason such as moisture, quality, or another entered explanation.
7. A sale has no generic expense field in Phase 1; brokerage and transport remain explicit.
8. Amount received may be split between cash and one or more bank accounts belonging to the selling firm.
9. A Kanta parchi may be attached even when no external sale document exists.
10. Every sale receives an internal HisabKitab number even if the current paper workflow has no sale paper.

## 5. Questions required to finish this example

1. What brokerage rate applies in this example?
2. What transport rate applies in this example?
3. What exact amount was received in cash?
4. What exact amount was received into which firm bank account?
5. Which business firm made the sale?
