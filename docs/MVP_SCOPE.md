# HisabKitab — Lean V1 Scope

Last updated: 8 September 2026

Status: Accepted Phase 1 boundary; operational core and initial users activated, awaiting paper reconciliation

## 1. V1 objective

Build a simple digital companion for Papa and Uncle that answers:

- From whom did we buy?
- Under which business firm was it bought?
- What commodity, weight, rate, and deductions were used?
- To whom did we sell?
- Which broker and transporter were involved?
- How much cash came in or went out?
- How much is payable or receivable from each party?
- What happened today or during a selected period?

V1 is not intended to replace the complete paper process immediately. It will run beside paper, reproduce the same calculations, and provide fast search, party accounts, outstanding amounts, and overview metrics.

## 2. Simplicity rule

The UI should be simple; the stored data must remain reliable.

- One guided purchase form for the normal purchase workflow.
- One guided sale form for the normal sale workflow.
- Familiar mixed Hindi/English labels.
- Automatic calculations shown beside the inputs.
- Minimal required fields and useful defaults.
- Advanced details collapsed or deferred.
- Structured items, adjustments, payments, and audit history internally rather than one unstructured record.

## 3. V1 modules

### Module A — Login and business firms

Initial users:

- Papa — active Main account
- Uncle — active Main account

Authentication:

- username;
- password;
- secure server session;
- login-based access to permitted firms and records.
- invite/admin-only registration; public self-signup is disabled.

Business-firm master:

- Sai Traders;
- Guru Dev Traders;
- future legally registered firms.

Each posted transaction belongs to one business firm. `Unassigned` may exist only while saving a draft for later review. It is not a final or off-books firm.

Open rule: determine whether small trader firms are internal business firms, external parties, or parties legally purchasing on behalf of an internal firm.

### Module B — Masters

Keep one simple party directory with selectable roles:

- Seller
- Buyer
- Broker
- Transporter

Minimum party fields:

- name;
- role(s);
- contact;
- address/remark;
- optional GSTIN when applicable and available;
- active/inactive status.

Other masters:

- commodities;
- rate units such as kg/quintal;
- buyer-deduction reason labels such as moisture and quality;
- vehicles linked to transporters when known.

Do not create separate duplicate records if one party has several roles.

### Module C — Purchase

One purchase screen should capture:

- date;
- business firm;
- seller;
- vehicle number;
- Kanta number;
- loaded and empty vehicle weight;
- calculated total commodity weight;
- one or more commodity lines;
- commodity weight in kg and calculated quintal;
- rate and rate unit;
- calculated gross amount;
- item-level deduction;
- item final amount;
- one seller-borne purchase deduction total with optional remark;
- final payable;
- amount paid now;
- payment mode;
- pending balance;
- remark;
- optional Kanta parchi attachment.

V1 calculation:

```text
Net vehicle weight = loaded weight − empty weight
Line gross = quantity converted to rate unit × rate
Line final = line gross − line deductions
Commodity total = sum(line final)
Final payable = commodity total − purchase deductions
Pending = final payable − allocated payment
```

For a multi-commodity load, one line may optionally be calculated as the residual weight. All line weights must reconcile to the vehicle net weight.

### Module D — Sale

One sale screen should capture:

- date;
- business firm;
- buyer;
- commodity;
- number of bags when used;
- actual weight in kg/quintal, entered independently from bag count;
- sale rate and basis;
- calculated gross sale amount;
- broker and brokerage rate/amount;
- transporter and transport rate/basis/amount;
- reasoned buyer-deduction lines;
- final receivable;
- one or more receipt portions split between cash and the selling firm's bank accounts;
- pending balance;
- vehicle/Kanta details when available;
- remark;
- optional Kanta parchi attachment.

V1 should support the provided simple case of 300 quintal of rice at ₹3,000 per quintal, producing a gross sale of ₹9,00,000. A ₹3,000 buyer deduction with a required moisture, quality, or other reason produces a final receivable of ₹8,97,000. Brokerage and transport are paid by the business and tracked separately as their respective `rate × sale weight in quintal`; neither reduces the buyer balance. The generic sale-expense field is excluded.

Bag count is informational. Bags may weigh 50 kg, 60 kg, 78 kg, or another amount, so the application must never infer sale weight from bag count.

### Module E — Cash and bank book

Cash entry should use familiar labels:

- `DB / Cash Out`: money given to a seller or another person;
- `CR / Cash In`: money received from a buyer or another person.

Minimum cash-entry fields:

- date/time;
- business firm;
- DB/Cash Out or CR/Cash In;
- amount;
- person/party;
- related purchase or sale when known;
- remark;
- created by.

The shared operational cash position is derived while each source movement retains its business firm:

```text
Closing cash = opening cash + cash in − cash out
```

Do not enter the same purchase payment both inside a purchase and again as an unrelated cash-book entry. Saving the purchase payment should create/link the cash movement automatically.

For banks in early V1:

- maintain a bank-account master per firm;
- record simple bank receipts/payments;
- optionally attach the bank statement;
- add statement import and automatic reconciliation later.

The default operational overview shows:

```text
Total available funds
  = shared operational cash
  + recorded Sai Traders bank balances
  + recorded Guru Dev Traders bank balances
```

This consolidated view does not merge the firms' underlying legal records.

### Module F — Party hisab and outstanding

Generated automatically from purchases, sales, and money entries:

- seller payable;
- buyer receivable;
- party transaction history;
- paid/received amount;
- pending amount;
- date-filtered statement.

V1 payment behavior:

- payment/receipt portions link directly to one purchase/sale;
- receipts may be split between cash and one or more bank accounts of the selling firm;
- on-account advances and later allocation are deferred;
- linked settlement cannot exceed the source transaction's outstanding balance.

### Module G — Dashboard and tables

Initial filters:

- date or date range;
- business firm;
- commodity;
- buyer/seller/party;
- transaction type;
- cash or bank.

The five primary mobile KPIs are:

- net purchase value;
- gross sale value;
- seller outstanding;
- buyer outstanding;
- total available funds.

Weight, paid/received, cash in/out, and pending counts remain available as secondary facts.

Initial tables:

- recent purchases;
- recent sales;
- recent cash/bank movements;
- seller-wise payable;
- buyer-wise receivable;
- party-wise purchase/sale summary.

Charts, trends, growth analytics, and complex profit analysis remain future scope until the underlying data reconciles.

### Module H — Audit, remarks, and attachments

Even with simple screens, V1 must retain:

- who created or edited a record;
- when it changed;
- cancellation/reversal reason;
- original and revised values for important changes;
- free-form remarks;
- optional Kanta parchi image/document.

## 4. Poor-internet behavior

The application should be responsive and installable as a PWA when practical.

Lean V1 poor-connection behavior:

- previously loaded app shell remains available;
- changed purchase and sale forms autosave locally as clearly labelled device drafts;
- a saved draft restores after reload and can be explicitly discarded;
- posting is duplicate-safe when connectivity returns;
- only server-confirmed records affect official balances and dashboards;
- conflicting posted financial edits are not merged silently.

This provides useful resilience without building a full multi-user offline database in V1.

## 5. Deferred from V1

- warehouse/location-wise stock;
- lot valuation and advanced inventory costing;
- detailed weight-dispute and shortage workflows;
- complex quality formulas;
- complex payer/beneficiary accounting for every charge;
- multiple-load sauda workflow unless a real example requires it;
- full commission-agent accounting;
- automatic bank-statement import/reconciliation;
- printer-specific integrations;
- charts and advanced growth analytics;
- direct GST/e-invoice/e-way-bill integration;
- WhatsApp automation;
- OCR, AI, forecasting, and market-rate automation;
- full offline conflict resolution;
- on-account advances and later allocation.

Deferred functionality must not block simple notes/remarks or later schema evolution.

## 6. V1 release slices

1. Login, business firms, and masters.
2. Purchase form → payment → seller outstanding → purchase table.
3. Sale form → receipt → buyer outstanding → sale table.
4. Cash/bank book and current cash.
5. Filtered dashboard and party tables.
6. Attachments, audit, exports, and reversal behavior.
7. Paper-plus-digital pilot with Papa and Uncle.

Each slice must use real examples and reconcile before the next becomes authoritative.

## 7. Remaining decisions before implementation

1. The brokerage rate, transport rate, exact cash/bank receipt split, and selling firm for Sale Example 001.
2. The payment account/mode and purchasing firm for Purchase Example 001.
3. Whether small trader firms are internal business firms or external parties; GSTIN is optional and does not determine the classification.
4. Who sets the initial shared cash and firm-bank opening balances, whether physical cash is counted daily, and how often bank balances are manually reconciled.
5. The derived-money rounding rule when whole-kilogram weight and whole-rupee rate produce paise.
6. Whether Kanta numbers can repeat by weighbridge/date and whether a purchase can contain more than two commodities.
