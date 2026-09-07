# HisabKitab — Lean V1 Scope

Last updated: 7 September 2026

Status: Proposed from owner discovery; ready for final formula clarification

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

- Papa
- Uncle

Authentication:

- username;
- password;
- secure server session;
- login-based access to permitted firms and records.

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
- common deduction/expense labels;
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
- purchase-level deduction lines;
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
- simple deduction lines;
- simple expense lines;
- final receivable;
- amount received;
- payment mode;
- pending balance;
- vehicle/Kanta details when available;
- remark;
- optional Kanta parchi attachment.

V1 should support the provided simple case of 300 quintal of rice at ₹3,000 per quintal, producing a gross sale of ₹9,00,000. A ₹3,000 buyer deduction produces a currently validated receivable of ₹8,97,000 before any other buyer-facing adjustment. Brokerage is paid by the business and tracked separately as `brokerage rate × sale weight in quintal`; it does not reduce the buyer balance. Transport is also calculated as `transport rate × sale weight in quintal`, although who bears it still needs confirmation.

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

Current available cash is derived:

```text
Closing cash = opening cash + cash in − cash out
```

Do not enter the same purchase payment both inside a purchase and again as an unrelated cash-book entry. Saving the purchase payment should create/link the cash movement automatically.

For banks in early V1:

- maintain a bank-account master per firm;
- record simple bank receipts/payments;
- optionally attach the bank statement;
- add statement import and automatic reconciliation later.

### Module F — Party hisab and outstanding

Generated automatically from purchases, sales, and money entries:

- seller payable;
- buyer receivable;
- party transaction history;
- paid/received amount;
- pending amount;
- date-filtered statement.

V1 payment behavior:

- payment may link directly to one purchase/sale;
- otherwise it remains an on-account party amount;
- advances remain visible;
- no complex allocation UI unless real usage requires it.

### Module G — Dashboard and tables

Initial filters:

- date or date range;
- business firm;
- commodity;
- buyer/seller/party;
- transaction type;
- cash or bank.

Initial KPI candidates:

- total purchase value and weight;
- total sale value and weight;
- cash available;
- cash in and cash out;
- total seller payable;
- total buyer receivable;
- pending/unsettled purchase and sale counts.

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

Lean V1 offline behavior:

- previously loaded app shell remains available;
- unfinished forms can be saved locally as clearly labelled drafts;
- a user can see whether a draft is local, syncing, synced, or failed;
- duplicate-safe synchronization occurs when connectivity returns;
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
- full offline conflict resolution.

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

1. Whether transport in Sale Example 001 is paid by the business, buyer, or seller.
2. Whether the ₹43 total expense changes buyer receivable or is a separate business expense.
3. The brokerage rate, transport rate, amount received, payment mode, and selling firm for the example.
4. Whether small trader firms are internal business firms or external parties; GSTIN is optional and does not determine the classification.
5. How a finalized cash transaction without a current firm is lawfully assigned and reported.
6. Whether bank entries are manually entered in V1 or only recorded through linked purchase/sale payments plus a statement attachment.
