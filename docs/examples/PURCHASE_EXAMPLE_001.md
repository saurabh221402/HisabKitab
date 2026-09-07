# Purchase Example 001 — Multi-Commodity Vehicle With Partial Payment

Source: Business owner example supplied 7 September 2026

Transaction date: 7 September 2026

Validation status: Arithmetic validated; accounting/compliance classification pending

This is the first canonical HisabKitab calculation example. Personal/legal values are illustrative and should not be treated as verified master data.

## 1. Source facts

| Field | Value |
| --- | --- |
| Supplier | Sharma Traders |
| Vehicle | UP 14 AB 1234 |
| Kanta number | KT-45821 |
| Loaded vehicle weight | 18,500 kg |
| Empty vehicle weight | 8,500 kg |
| Net commodity weight | 10,000 kg |

```text
Net commodity weight = loaded weight − empty weight
                     = 18,500 kg − 8,500 kg
                     = 10,000 kg
```

## 2. Commodity allocation

The Munshi finalizes rice weight directly. Wheat is the only residual commodity in the load.

| Commodity | Weight source | Weight |
| --- | --- | ---: |
| Rice | Entered/finalized by Munshi | 6,200 kg |
| Wheat | Calculated residual | 3,800 kg |
| Total | Reconciled to vehicle net weight | 10,000 kg |

```text
Wheat weight = net commodity weight − rice weight
             = 10,000 kg − 6,200 kg
             = 3,800 kg
```

Validated invariant:

```text
6,200 kg + 3,800 kg = 10,000 kg
```

## 3. Rice calculation

| Component | Calculation | Amount |
| --- | --- | ---: |
| Weight | 6,200 kg ÷ 100 | 62 quintal |
| Gross | 62 quintal × ₹4,500/quintal | ₹2,79,000 |
| Quality deduction | Flat item-level deduction | (₹2,000) |
| Final rice amount | ₹2,79,000 − ₹2,000 | ₹2,77,000 |

## 4. Wheat calculation

| Component | Calculation | Amount |
| --- | --- | ---: |
| Weight | 3,800 kg ÷ 100 | 38 quintal |
| Gross | 38 quintal × ₹2,700/quintal | ₹1,02,600 |
| Quality deduction | Flat item-level deduction | (₹1,000) |
| Final wheat amount | ₹1,02,600 − ₹1,000 | ₹1,01,600 |

## 5. Commodity subtotal

```text
Commodity subtotal = final rice amount + final wheat amount
                   = ₹2,77,000 + ₹1,01,600
                   = ₹3,78,600
```

## 6. Purchase-level deductions

| Deduction | Method | Amount |
| --- | --- | ---: |
| Kanta / weight charge | Flat purchase-level amount | ₹500 |
| Plastic sack charge | Flat purchase-level amount | ₹1,500 |
| Hamali | Flat purchase-level amount | ₹3,000 |
| Other deduction | Flat purchase-level amount | ₹500 |
| **Total** |  | **₹5,500** |

```text
Total purchase-level deductions
  = ₹500 + ₹1,500 + ₹3,000 + ₹500
  = ₹5,500
```

## 7. Final supplier settlement

```text
Final payable = commodity subtotal − purchase-level deductions
              = ₹3,78,600 − ₹5,500
              = ₹3,73,100
```

## 8. Partial payment

| Component | Amount |
| --- | ---: |
| Final supplier payable | ₹3,73,100 |
| Paid on transaction date | (₹2,00,000) |
| **Pending supplier balance** | **₹1,73,100** |

Validated invariant:

```text
₹2,00,000 paid + ₹1,73,100 pending = ₹3,73,100 payable
```

## 9. Product behavior established by this example

1. A purchase load can contain multiple commodities.
2. Vehicle net weight is calculated from loaded and empty weights.
3. Commodity lines must reconcile to vehicle net weight.
4. Exactly one commodity line may be calculated as the residual.
5. Rates can be per quintal while source weights are in kilograms.
6. A purchase has item-level deductions and purchase-level deductions.
7. A purchase can be partially paid immediately.
8. Outstanding is derived from settlement less allocated payments.
9. The printed/digital parcha must show formulas and both quantity units.

## 10. Proposed record decomposition

This should not be persisted as one unstructured purchase object.

```text
Purchase deal / header
  +-- Load and vehicle
  +-- Kanta weighment
  +-- Rice commodity allocation
  |     +-- rate
  |     +-- quality deduction
  +-- Wheat residual allocation
  |     +-- rate
  |     +-- quality deduction
  +-- Purchase-level deductions
  +-- Final settlement
  +-- ₹2,00,000 payment allocation
  +-- ₹1,73,100 outstanding
  +-- Stock and journal postings (pending rule validation)
```

## 11. Rules still unresolved

1. Is the loaded weight always called gross weight, and is the empty weight always the same vehicle tare source?
2. Can one Kanta number repeat across different weighbridges or dates? We likely need Kanta party + slip number + date rather than a globally unique number.
3. Can a vehicle carry more than two commodities? If so, how are individual weights measured and which single line, if any, may be residual?
4. Is 1 quintal always exactly 100 kg for every rate calculation? Expected yes, but it should be confirmed as the canonical conversion.
5. Are item quality deductions always flat money, or can they be based on percentage, weight cut, rate cut, or moisture formula?
6. Why were Kanta, plastic sack, Hamali, and other charges deducted from the supplier?
7. Who ultimately receives each purchase-level amount? Is the business separately liable to a weighbridge, labourer, packaging provider, or other party?
8. Do those charges reduce inventory cost, increase inventory cost as third-party expenses, or only reduce the supplier payable?
9. Which legal business—Sai Traders or Guru Dev Traders—owns this purchase?
10. Was ₹2,00,000 paid by cash or a bank account, and from which legal entity’s account?
11. Were GST, mandi fee/cess, TDS/TCS, Form 6/7/9, gate pass, invoice/bill of supply, and e-way bill applicable? None appear in the example.
12. Where did the 10,000 kg enter stock, or was it directly dispatched to a buyer?

## 12. Illustrative ledger behavior—not yet approved

If every deduction solely reduces the supplier price and there are no separate third-party liabilities, the supplier subledger would provisionally behave as:

```text
Final purchase settlement creates supplier payable:  ₹3,73,100
Payment allocated to settlement:                     (₹2,00,000)
Remaining supplier payable:                           ₹1,73,100
```

This does **not** settle inventory cost, expense, tax, or journal entries. Those postings depend on the unresolved charge-beneficiary, tax, ownership, and stock rules above.
