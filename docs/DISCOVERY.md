# HisabKitab — Product, Business, and Technical Discovery

Last researched: 7 September 2026
Last updated from owner discovery: 8 September 2026
Status: Working hypotheses; requires validation with the business owner and accountant/CA

## 1. Executive conclusions

1. HisabKitab should be an **operations-led accounting system**, not merely a collection of forms and not a general-purpose accounting package.
2. The core record should separate **deal, lot/load, weighment, settlement, invoice, payment, and ledger posting**.
3. V1 should model the confirmed principal-trading flow. Full commission-agent accounting remains deferred until supported by a real transaction example.
4. Stock and profit cannot be correct until ownership transfer, unit conversion, shortage, quality deductions, expenses, and cost allocation are defined.
5. Users should enter understandable actions such as “pay seller” and “receive from buyer”; the system can post debits and credits internally.
6. A small **modular monolith** backed initially by Supabase-hosted PostgreSQL is the best likely V1 architecture. Microservices and separate mobile apps would add cost without solving the first business problem.
7. Compliance fields should exist from the beginning, but government API integrations should follow a stable internal workflow and professional tax validation.

### Known operating context

- Home location: Bhadohi district, Uttar Pradesh.
- Outbound trade: intra-state and interstate, including Bihar, Madhya Pradesh, Gujarat, and Maharashtra.
- Fulfilment: both warehoused stock and direct seller-to-buyer dispatch.
- Business role: V1 models principal trading—buy from farmers/traders, aggregate or transport, then sell to mills/larger firms. Brokers act as intermediaries in this flow.
- Business names: Sai Traders and Guru Dev Traders are separate GST-registered firms operated by the two primary users; future firms may be added.
- Current records: a significant cash segment is reportedly undocumented. The product will support recorded cash transactions but no off-books mode.
- Reported scale: more than ₹50 crore annual revenue, around ₹50 lakh daily money movement, and around 100 metric tonnes of daily purchase/sale volume.
- Current operating knowledge: core calculations and control are concentrated in two experienced family operators.
- Adoption requirement: retain paper during a confidence-building parallel run; do not force an immediate migration.

## 2. Market understanding

### 2.1 The market is not one workflow

Agricultural trade software commonly serves at least three models:

| Model | Owns stock? | Earns | Key records |
| --- | --- | --- | --- |
| Principal trader | Usually yes | Buy/sell margin | purchase, inventory, sale, receivable/payable |
| Commission agent / arhtiya | Usually no | commission and service charges | farmer lot, auction, buyer settlement, patti, commission |
| Hybrid | Sometimes | margin plus commission | both, with explicit role per deal |

HisabKitab V1 targets the principal-trader model. The commission-agent and hybrid models are useful market context, but they should not add V1 complexity without a concrete transaction example. If that requirement emerges later, a commission transaction must not be treated as owned inventory or gross sales revenue by default.

### 2.2 Market workflow signals

Government and product sources consistently expose the following domain concepts:

- lot/arrival registration;
- quality/assaying and grade;
- gross, tare, and net weighment;
- auction or negotiated deal rate;
- loading/unloading, cleaning, weighing, market, packing/bardana, freight, and commission charges;
- farmer/seller settlement and buyer receivable;
- gate pass/dispatch and vehicle data;
- cash/bank payment and ledger;
- multi-language, fast entry, printing, and exports;
- GST, e-invoice, and e-way-bill readiness.

e-NAM’s official flow is gate entry → assaying → trading → weighment/invoicing → online payment → gate exit. HisabKitab does not need to copy e-NAM, but the sequence confirms that physical and financial milestones are separate records.

### 2.3 Competitor baseline and opportunity

Public product pages for BUSY Mandi, MandiGrow, MandiYard, agriSATHI, Broker ERP, and mill ERPs advertise mandi billing, weighment, commission, bardana, payment ledgers, printing, regional languages, and compliance. These are useful category signals, not independently verified product claims.

HisabKitab should not try to win by having the longest feature list. Its advantage can be:

- an exact match to this family’s calculation and settlement rules;
- lower training burden and clearer language;
- trustworthy explanations of every balance;
- flexible but controlled deductions and charges;
- clean treatment of mixed purchase, transit, sale, and payment cases;
- strong data export, audit history, and ownership;
- gradual adoption alongside paper until results reconcile.

### 2.4 External market data

AGMARKNET publishes arrival and price information across commodities and APMC markets, and e-NAM gives traders access to market, quality, and price information. Market-rate display may become useful later, but it is not required to replace internal registers. It should remain informational and show source/time; it must never silently determine the contractual rate.

### 2.5 What the reported scale means

The reported 100 tonnes per day is not intrinsically a difficult software-throughput problem. The hard problem is correctness and continuity at high financial value:

- a small calculation or allocation error can have a large rupee impact;
- two-person knowledge concentration creates operational and succession risk;
- paper makes aggregate exposure and trends slow to discover;
- daily cash movement requires disciplined account/cash-box reconciliation;
- one wrong entity, party, weight, rate, or payment allocation can contaminate several reports;
- trust will be lost quickly if the digital result differs from the familiar parcha without an explanation.

Therefore, prioritize traceability, calculation transparency, reconciliation, permissions, backups, and fast daily entry above exotic infrastructure or decorative analytics.

## 3. Proposed business lifecycle

```text
Negotiation / Sauda
        |
        v
Deal confirmed -------------------------------+
        |                                      |
        v                                      |
One or more loads/lots                         |
        |                                      |
Gross/tare/net weight + bags + quality         |
        |                                      |
Delivery accepted / shortage / rejection       |
        |                                      |
Commercial settlement (rate + adjustments)    |
        |                                      |
Invoice / bill / patti where applicable        |
        |                                      |
Ledger posting                                 |
        |                                      |
Receipts/payments allocated or held as advance |
        |                                      |
Outstanding and closure <----------------------+
```

A sale follows the same pattern on the outbound side. A purchase and a sale may be linked for operational margin, but one purchase may feed several sales and one sale may consume several purchase lots.

## 4. Domain model proposal

### 4.1 Identity and organization

- `Business`: legal name, trade name, GST registrations, addresses, financial-year settings.
- `User`: login identity.
- `Role` and `Permission`: owner, accountant, data-entry operator, viewer/auditor.
- `AuditEvent`: actor, time, operation, old/new reference, reason, device/session metadata where appropriate.

### 4.2 Parties

Use one party identity with one or more roles rather than unrelated seller/buyer tables:

- `Party`: legal/trade name, party type (individual/firm/company), contact and address.
- `PartyRole`: seller, buyer, broker, transporter, service provider, other.
- `PartyTaxProfile`: GSTIN/PAN and effective tax metadata where lawfully needed.
- `PartyBankAccount`: multiple accounts, masked in normal views, access controlled.
- `ContactPerson` and `Address`: multiple records with purpose.
- `CreditTerms`: optional credit days/limit and warning policy.

A party may be both buyer and seller. Duplicating it would split the true balance.

### 4.3 Product and quality

- `Commodity`: paddy, wheat, rice, maize, etc.
- `CommodityVariant` / `Grade`: variety, quality grade, crop year, optional standard measures.
- `Unit`: kg, quintal, metric tonne, bag.
- `UnitConversion`: effective conversion to the base mass unit where conversion is fixed.
- `QualityParameter`: moisture, broken, foreign matter, damaged grain, or business-defined measure.

Bag is not always a fixed weight and should not be blindly converted unless the commodity/deal defines bag weight.

### 4.4 Commercial records

- `Deal` / `Sauda`: PURCHASE or SALE, party, broker, commodity/grade, agreed quantity, rate, rate unit, delivery terms, validity, role, and status.
- `Load`: truck/vehicle, origin, destination, dispatch/arrival time, documents, and status.
- `Weighment`: gross, tare, net, source, slip number, time, attachment, and verification status.
- `QualityResult`: measured values, source, time, acceptance, and attachments.
- `Settlement`: accepted quantity, rate, deductions, charges, taxes, rounding, and final payable/receivable.
- `InvoiceDocument`: document type, financial-year series, number, date, tax fields, and immutable rendered snapshot/reference.

### 4.5 Financial and stock records

- `MoneyTransaction`: receipt, payment, expense, transfer, refund, or adjustment.
- `PaymentAllocation`: connects all or part of a transaction to one or more settlements/invoices.
- `JournalEntry` and `JournalLine`: balanced accounting representation generated by business actions.
- `StockMovement`: receipt, dispatch, transfer, return, shortage, gain/loss, or adjustment.
- `CostAllocation`: links sold quantity to purchase/stock cost under the chosen costing policy.
- `ChargeType`: freight, brokerage, labour/hamali, loading, unloading, mandi fee, weighing, bardana, insurance, etc.

## 5. Business-rule catalogue

Rules below are proposed defaults. Items marked **Validate** must not be treated as settled.

### BR-001 — Document identity

- Every deal, load, settlement, invoice, payment, and journal entry has an internal immutable ID.
- Human document numbers use controlled, unique financial-year series.
- Imported paper numbers are stored separately from system numbers.
- Duplicate supplier invoice/slip detection should consider party, document number, date, and amount.
- Every document belongs to exactly one legal business/GST registration. Cross-entity copying or payment requires an explicit inter-entity workflow.

### BR-002 — Dates

- Store separately: deal date, dispatch date, weighment date, delivery date, settlement/invoice date, due date, payment date, and recorded-at time.
- Store timestamps in UTC and display in the business timezone; store business dates as dates.
- Backdating is allowed only for the Main role and requires a reason plus an additional date-impact confirmation. Reopening a closed day follows the same protection.

### BR-003 — Status and editing

The Phase 1 lifecycle is deliberately simpler: `DRAFT → POSTED → REVERSED`, with a replacement draft for correction. The longer operational lifecycle remains a future hypothesis.

- Drafts may be edited.
- Confirmation freezes the commercial terms unless an authorized amendment is recorded.
- Posted financial records are never hard-deleted.
- Cancellation creates a reasoned void/reversal and preserves the original.
- Closed-period changes require reopening or a current-period adjustment.

### BR-004 — Quantity and weight

- Use whole kilograms as the canonical Phase 1 physical-mass input while retaining the entered unit and value.
- Store quantity with adequate decimal precision; never use binary floating point.
- `netWeight = grossWeight - tareWeight` when both readings exist.
- Retain seller weight, transporter/dispatch weight, buyer weight, and accepted settlement weight separately.
- Never overwrite one party’s measurement with another’s.
- Differences beyond a configurable tolerance require review.
- **Validate:** which weight controls seller payment, buyer billing, stock, and transporter shortage.
- A multi-commodity load may allocate the known net vehicle weight among several commodity lines.
- The UI may calculate **one** residual line as `vehicle net weight − sum(other commodity weights)`; it must show that the value was derived, prevent a negative result, and require the final line sum to equal the vehicle net weight within the approved tolerance.
- More than one residual/unknown line is not mathematically determinable and must be entered or measured explicitly.

### BR-005 — Rate and basic amount

- A rate always has a basis: per kg, quintal, tonne, bag, or flat lot.
- `baseAmount = settlementQuantityInRateUnit × agreedRate`.
- Preserve the original rate basis even if reports normalize it.
- Phase 1 rates are entered in whole rupees. **Validate:** derived-money rounding when kg/rate calculations produce paise and whether it occurs at line or final total.

### BR-006 — Quality and deductions

An adjustment must declare:

- category and reason;
- method: flat amount, percentage, per-unit amount, weight cut, rate cut, or formula;
- base to which it applies;
- payer and beneficiary;
- whether it affects stock quantity, party settlement, tax value, or internal profitability;
- formula version and manual override reason.

Do not store a single unexplained `deduction` amount. Moisture/quality cuts may change payable weight, rate, or money; these are materially different.

The first validated example contains flat item-level quality deductions of ₹2,000 on rice and ₹1,000 on wheat. The application must still retain the reason and method; “quality deduction” cannot remain an unexplained amount in the final production workflow.

### BR-007 — Charges and expenses

Every charge identifies:

- who owes it;
- who receives it;
- who initially paid it;
- whether it is recoverable;
- whether it belongs to inventory cost, selling expense, operating expense, or neither;
- calculation basis and tax treatment.

This prevents freight or brokerage from being subtracted twice or assigned to the wrong party.

For Phase 1, Kanta/weight charge, plastic sack charge, Hamali, and other purchase-level amounts are combined into one seller-borne purchase deduction. It reduces supplier payable and creates no separate third-party liability. The paper breakdown may remain in the source document or remark. Revisit only if a real separate payment/liability is required.

### BR-008 — Brokerage

- Broker is optional per deal.
- Commission may be percentage, per weight, per bag, flat, tiered, or manually agreed.
- It may be payable by seller, buyer, the business, or split.
- Broker liability and payment are separate from the buyer/seller settlement.
- In the confirmed V1 sale workflow, brokerage is paid by the business and calculated as `rate × actual sale weight in quintal`.
- **Validate:** whether the business ever earns brokerage rather than paying it.

### BR-009 — Transport

- A transporter may have many vehicles and drivers; a vehicle/driver relationship can change over time.
- Each load records freight terms: prepaid, to-pay, included, recoverable, or borne by a named party.
- The confirmed Phase 1 transport calculation is `transport rate × actual sale weight in quintal`. The business bears it as a separate cost/payable; it does not reduce buyer receivable.
- Transporter bill, advance, final payable, and payment are separate.
- Transit shortage/damage is recorded explicitly with responsibility and settlement effect.

### BR-010 — Settlement

- A settlement is the accepted commercial outcome, not merely a calculated UI total.
- Store formula inputs and a versioned calculation snapshot.
- Any manual override requires reason and permission.
- A deal can have provisional and final settlement if the business works that way.
- **Validate:** whether rate can change after buyer quality/weight confirmation and who bears that difference.

### BR-011 — Receipts, payments, and advances

Use user-facing transaction types rather than asking users to choose abstract debit/credit:

- receipt from buyer/other party;
- payment to seller/other party;
- business expense;
- cash-to-bank or bank-to-bank transfer;
- refund;
- opening balance or approved adjustment.

- A Phase 1 sale receipt may be split between cash and one or more bank accounts of the selling firm.
- Phase 1 payment/receipt portions link directly to one purchase or sale and cannot exceed its outstanding balance.
- Advance/on-account allocation is deferred until validated with a real example.
- Payment mode, account, reference, date, and evidence should be recorded.
- Reversal is used for errors; the original is retained.

### BR-012 — Ledger

- The party ledger is generated from posted source transactions.
- No separate manual ledger entry should duplicate purchases, sales, receipts, or payments.
- Approved opening balances and explicit adjustments are allowed with provenance.
- Every displayed balance must drill down to its source and posting.
- Internal accounting entries must balance debits and credits before posting.

### BR-013 — Outstanding

- Seller payable = posted purchase settlements − allocated payments − approved credits, adjusted for advances.
- Buyer receivable = posted sale settlements − allocated receipts − approved credits, adjusted for advances.
- Aging is based on due date, not merely invoice date.
- Disputed, withheld, or written-off amounts remain separately visible.

### BR-014 — Inventory

- Stock changes only through posted stock movements.
- Physical stock and owned stock may differ for consignment/commission transactions.
- Negative stock should be blocked by default or require an authorized, visible override.
- Record warehouse/location if goods can be held in more than one place.
- Record loss, gain, spoilage, rejection, and sample quantity explicitly.
- **Validate:** whether goods are normally bought and immediately redirected without storage.

### BR-015 — Profit

Do not define profit as cash received minus cash paid.

- Trade contribution uses net sale value minus allocated commodity cost and attributable charges.
- Cash flow is a different report.
- Unpaid sale revenue can contribute to accounting profit while remaining a receivable.
- **Validate:** FIFO, weighted-average, specific-lot/deal matching, or a combination.
- If purchases are mixed, “profit per deal” and accounting gross margin may legitimately differ and should be named clearly.

### BR-016 — Tax and compliance

- HSN/UQC, tax category, registration status, place of supply, reverse charge, and document type must be effective-dated/configurable.
- Never infer tax only from the commodity name. Packaging/labelling, party status, transaction nature, and current rules can change treatment.
- Compliance documents should be generated only from posted business records.
- Direct filing/API integration should be a later module with idempotency, status, error, cancellation, and credential controls.
- Final rules must be reviewed by the business CA/accountant and, for mandi matters, the relevant state/APMC professional.
- For movement from Uttar Pradesh to another state, the delivery destination and dispatching legal entity/GSTIN must be retained so the applicable place-of-supply and interstate treatment can be determined.
- Uttar Pradesh e-Mandi currently exposes trader licensing, licence renewal, Form 6, Form 7, Form 9/9 (secondary), gate-pass, and external-slip workflows. Required local documents must be confirmed for the Bhadohi operation before their fields or numbering are finalized.

### BR-019 — Cash and record completeness

- Every purchase, sale, receipt, payment, expense, and adjustment is recorded regardless of whether money moves by cash, bank, cheque, or UPI.
- A cash transaction still requires a source type, date, party or counterparty classification, amount, purpose, and approval/evidence policy.
- The system will not include hidden books, unreported modes, misleading exports, or a flag that excludes transactions from accounting/compliance reports.
- Historical undocumented activity must be handled through an accountant-approved opening-balance/migration plan; the application must not fabricate source documents.
- Cash-payment limits, exceptions, voucher requirements, and tax treatment must be reviewed with the CA under rules effective for the relevant year.

### BR-020 — Legal business/entity separation

- Each transaction, account, document series, tax registration, journal, stock ownership record, and report belongs to a legal business entity.
- Users may be authorized for multiple entities, but totals and balances are separate unless a consolidated report explicitly combines them.
- Money or stock transferred between Sai Traders and Guru Dev Traders must be recorded symmetrically as an inter-entity transaction if they are legally separate.
- Sai Traders and Guru Dev Traders are confirmed as separate GST-registered firms. Exact PAN, bank-account, ownership, and inter-firm behavior still require validation.
- `Unassigned` is permitted only for a draft awaiting review. A posted transaction cannot use “no firm” as an off-books classification.

### BR-021 — Simplified V1 money language

- The business's paper convention is `DB` for money given to a supplier/person and `CR` for money received from a buyer/person.
- The UI should show both the familiar label and plain meaning: `DB / Cash Out` and `CR / Cash In`.
- Current cash is derived from opening cash plus cash in minus cash out.
- Payments entered during purchase/sale must create or link the money-book movement automatically to prevent double entry.

### BR-022 — Simplified V1 scope boundary

- Warehouse/location tracking is deferred even though five warehouse locations exist; remarks may capture operational context initially.
- Advanced buyer/seller weight differences, shortage liability, and quality formulas are future scope.
- Charge entry is initially a simple label, amount, and basic borne-by classification. Detailed multi-party settlement can be added after validated examples.
- Printer-specific support and charts are future scope.
- Kanta parchi attachments are supported for purchase and sale.
- Poor connectivity requires local draft preservation and visible synchronization status, but only server-confirmed records affect balances.

### BR-017 — Privacy and security

- Collect only contact, identity, banking, and tax data required for a legitimate business purpose.
- Restrict bank and tax identifiers by role and mask them in ordinary screens/exports.
- Encrypt traffic and managed storage; keep secrets outside source code.
- Log sensitive access and all material changes.
- Define retention, correction, access, incident, and deletion procedures subject to legal recordkeeping duties.

### BR-018 — Audit and retention

- Audit create, confirm, post, amend, reverse, export, permission, and closing actions.
- Store source attachment hashes/metadata to identify replacements.
- Financial backup and restoration must be tested, not assumed.
- GST law currently requires relevant accounts and records to be retained for 72 months from the annual-return due date, longer for specified proceedings. Exact retention policy requires professional validation.

## 6. What would make the product good

- keyboard-first entry plus mobile-friendly controls;
- typeahead party/commodity selection and safe defaults;
- draft/autosave without posting incomplete records;
- side-by-side formula breakdown and final settlement;
- regional-language labels while preserving canonical codes;
- local print formats and PDF/Excel export;
- clear “paid”, “received”, “outstanding”, “advance”, and “disputed” language;
- search by party, vehicle, phone, invoice, load, commodity, and amount;
- visible source of every report number;
- controlled approvals for exceptional edits;
- gradual migration with paper-vs-system reconciliation reports;
- connection-loss resilience, idempotent submission, and duplicate prevention;
- daily backups plus an owner-controlled export.

## 7. What would make the product bad

- copying paper register columns without modelling relationships;
- a single giant purchase/sale record for deal, load, settlement, and payment;
- storing party names as free text on every transaction;
- manually entering ledger rows already represented elsewhere;
- using JavaScript `number`/database floating point for money or weight;
- silently recalculating old settlements after a formula/configuration change;
- hard-deleting or invisibly overwriting posted transactions;
- calling cash surplus “profit”;
- assuming every bag has the same weight;
- assuming buyer and seller weights always match;
- blocking every exception instead of providing an authorized exception workflow;
- adding microservices, Redis, Kubernetes, or event streaming before needed;
- building dashboards before the underlying balances reconcile;
- implementing GST/e-way-bill APIs before internal invoices and statuses are stable;
- making full offline conflict resolution a V1 requirement without evidence;
- allowing spreadsheet import directly into posted accounting records without validation and preview.

## 8. Candidate full-core scope retained from discovery

This earlier broad recommendation is retained for history and longer-term planning. `PRD_PHASE_1.md` now controls the actual Phase 1 release scope and explicitly defers stock valuation, profit, generic expenses, and advance allocation.

### Foundation

- legal business/entity model, financial year, registration and numbering series; initial entity count depends on the Sai Traders/Guru Dev Traders clarification;
- users, roles, permissions, audit log;
- party, commodity/grade, unit, charge type, transporter/vehicle masters;
- attachment handling and backup/export.

### Purchase vertical slice

- purchase deal;
- one or more loads and weighments;
- configurable deductions/charges;
- settlement and seller payable;
- payment/advance allocation;
- purchase register, party ledger, and outstanding.

### Sale vertical slice

- sale deal;
- dispatch/load and accepted quantity;
- charges, brokerage, and buyer settlement;
- receipt/advance allocation;
- sales register, receivable, and basic margin.

### Money and stock

- cash/bank accounts and transfers;
- receipt, payment, expense, refund, and adjustment workflows;
- stock movement and reconciliation;
- daily book generated from posted money events.

### Essential reports

- purchase and sales registers;
- party ledger with source drill-down;
- receivable/payable aging;
- cash/bank daily book;
- stock by commodity/grade/location;
- expense and preliminary gross-margin reports;
- audit/exception report.

### Operational dashboard

The first dashboard should be a compact operational control surface derived from posted/reconciled records:

- today’s purchased and sold weight and value;
- today’s receipts, payments, and net money movement by cash/bank account;
- cash expected versus physically confirmed;
- current receivables and payables, including overdue amounts;
- current stock by commodity/location;
- unsettled deals, incomplete loads, unallocated payments, weight differences, and other exceptions;
- short-period trends only after their source reports reconcile.

Dashboard totals must link to their underlying records. Do not implement a metric whose definition and source cannot be explained.

### Adoption and migration stages

#### Stage A — digital shadow mode

- Paper remains the operational reference.
- Enter the same day’s transactions into HisabKitab.
- Compare purchase/sale totals, money movement, party balances, and stock every day.
- Log every mismatch by category and cause.
- Adapt terminology, print layout, entry order, and formulas based on actual operator use.

#### Stage B — trusted digital support

- HisabKitab calculates and retrieves; paper remains a familiar backup/check.
- Digital parchas and reports are used for selected workflows.
- Daily close requires both operators or an agreed reviewer to acknowledge unresolved differences.
- Measure entry time, correction rate, and reconciliation differences.

#### Stage C — digital primary record

- Move only reconciled modules to digital-first operation.
- Retain printable/exportable records and a documented fallback procedure.
- Do not switch every module on the same day.
- Historical paper is migrated through controlled opening balances and selected detail, not fabricated transactions.

Suggested promotion gate: a user-agreed period of consecutive daily closes with all material differences explained, tested backup restoration, and successful operation by both current operators. The duration remains to be decided.

## 9. Technology recommendation

This is a proposed baseline, not permission to scaffold yet.

### 9.1 Architecture

**Recommendation: a modular monolith.**

```text
Responsive Next.js application
        |
Server-side application/domain modules
        |
Supabase-hosted PostgreSQL
        +---- Supabase Storage for documents, behind an adapter
        +---- optional background-job worker
```

Keep clear modules—identity, masters, trading, logistics, settlement, accounting, reporting—but deploy them together initially. This preserves transaction boundaries and keeps operations simple. Expose stable HTTP endpoints where mobile/integrations may later need them; do not create network-separated services prematurely.

### 9.2 Proposed stack

| Concern | Proposed choice | Rationale |
| --- | --- | --- |
| Language | TypeScript with strict settings | One language across UI/server; strong domain types |
| Web framework | Next.js App Router | Productive React stack, server and client capabilities, flexible Node/Docker hosting |
| UI | Tailwind CSS + accessible headless components | Fast custom business UI without locking into a heavy visual framework |
| Forms/validation | React Hook Form + Zod | Complex repeating lines and shared validation |
| Database | Supabase-hosted PostgreSQL initially | Full remote PostgreSQL with transactions, constraints, exact `numeric`, joins, reporting, and a portable dump/restore path |
| ORM | Prisma, with SQL for complex reports | Productive typed CRUD/migrations; do not hide financial reporting from SQL |
| Authentication | Server-managed secure sessions | Avoid long-lived JWTs in browser storage; simpler revocation and role enforcement |
| Files | Supabase Storage initially, behind an application interface | Kanta slips and attachments remain outside business tables; the interface preserves a future S3-compatible migration path |
| Jobs | PostgreSQL-backed queue when needed | Avoid operating Redis solely for early background work |
| Testing | Vitest + integration tests against PostgreSQL + Playwright | Formula, posting, permissions, and critical workflows need different test levels |
| Deployment | Docker-capable Node service + Supabase managed PostgreSQL | Application hosting remains independent from the database; Vercel remains possible but is not required |
| Observability | Structured logs, error tracking, audit events, backup alerts | Financial correctness requires operational evidence |

Pin actual versions only when scaffolding starts. Next.js documentation as of March 2026 supports full Node and Docker deployment. PostgreSQL exact `numeric` and constraints suit financial and weight invariants. Prisma maps PostgreSQL decimal/numeric to an exact Decimal type.

The initial Supabase project is named **HisabKitab**, project reference `wpwrohqmjxwhdzoatlrq`, and is hosted in Mumbai (`ap-south-1`). At confirmation it was healthy on nano compute with no application migrations or repository integration. No database password, service-role key, or other secret may be placed in source control or project documentation.

Supabase is the initial PostgreSQL host, not a temporary non-PostgreSQL database. Portability requirements are:

- keep schema migrations in the repository;
- use standard PostgreSQL types and only justified extensions;
- connect server-side business services through the selected database layer;
- do not allow browser clients to write financial tables directly;
- keep provider-specific storage and authentication behind application interfaces;
- maintain independent logical backups and test restoration;
- prove a PostgreSQL dump/restore into a clean target before production reliance.

### 9.3 Financial implementation rules

- Store money as PostgreSQL `numeric`, with currency code; use a Decimal library end to end.
- Store weights/quantities and rates as appropriately scaled `numeric` values.
- Centralize formula policies and version them.
- Enforce positive values, uniqueness, references, status compatibility, and balanced journals at the database/domain boundary.
- Use database transactions to post settlement, stock movement, allocations, and journals atomically.
- Use idempotency keys for create/post/import/integration operations.
- Build reports from normalized records and durable postings; do not make dashboard caches the source of truth.

### 9.4 Why not the alternatives initially

- **MongoDB:** weaker fit for relational allocation, reconciliation, constraints, and reporting.
- **Separate React + NestJS services:** valid later, but two deployments/contracts add overhead before a second client or team exists.
- **Microservices:** distributed financial posting would make correctness and recovery harder.
- **Native mobile app:** responsive/PWA capabilities should be tested with real field use first.
- **Redux everywhere:** most state is server/domain state; add client state libraries only for demonstrated needs.
- **Full offline-first sync:** valuable if connectivity is poor, but conflict resolution around posted financial records is a product of its own. Start with resilient drafts/idempotent submissions unless discovery proves full offline is mandatory.

## 10. Compliance and external-system design notes

These are design constraints, not legal or tax advice.

- CBIC invoice rules require prescribed supplier/recipient, serial number, date, HSN, quantity/UQC, value, tax, and place-of-supply information where applicable.
- The e-way-bill system generally applies to movement of consignments over ₹50,000, subject to rules and exemptions. As of the researched material, e-way bills cannot be generated against base documents older than 180 days, and portal MFA applies.
- Current IRP material shows e-invoicing applies from the notified turnover threshold of ₹5 crore and a 30-day reporting limit for taxpayers with AATO ₹10 crore or more. Applicability and exemptions must be verified at implementation time.
- Grain tax treatment can depend on HSN and whether goods are pre-packaged and labelled. Tax configuration must be effective-dated and CA-approved.
- State APMC licensing, market fees, forms, and exemptions can vary. The operating state(s), mandi, and trade-license model are required inputs.
- The system will hold personal data such as contacts and possibly bank details. India’s DPDP Act and notified 2025 Rules create a current privacy framework with phased commencement; implementation obligations should be reviewed before production.

## 11. Non-functional requirements to decide

| Area | Question / proposed baseline |
| --- | --- |
| Availability | Define operating hours and maximum tolerable outage |
| Recovery | Automated backups plus point-in-time recovery where available; define near-zero acceptable loss for posted transactions and test restore |
| Performance | Common entry/search should feel immediate; measure deals, loads, payments, and lines/day rather than relying on tonnage |
| Devices | Confirm desktop, Android phone, tablet, printer, and scanner usage |
| Connectivity | Measure actual office/mandi connectivity before committing to offline sync |
| Languages | Confirm English, Hindi, and/or regional language; data entry should support Unicode |
| Security | MFA for owners/admins, least privilege, session expiry, encryption, audit |
| Data portability | CSV/Excel/PDF exports plus complete structured backup |
| Accessibility | Readable density, keyboard support, contrast, and large touch targets where needed |
| Supportability | Owner-visible health/backup status; documented recovery and admin operations |
| Reconciliation | Daily cash/bank, party, stock, and paper-vs-digital close with visible unresolved differences |
| Continuity | At least two trained operators, controlled emergency access, owner-held exports, and a tested fallback procedure |

## 12. Discovery questions that block design

### Business identity and compliance

1. Which exact mandi/APMC and market area serves the Bhadohi operation?
2. What are the legal structure, PAN, GSTIN, bank accounts, and permitted users for Sai Traders and Guru Dev Traders?
3. Which small trader firms in the current workflow are internal business firms, and which are external parties?
4. Does any real transaction make the business a commission agent without owning the goods, or is every current deal principal trading?
5. Which documents are currently issued/received: kacchi parchi, pakki parchi, UP Form 6/7/9, invoice, bill of supply, gate pass, external slip, weighment slip, or e-way bill?

### Daily operations

6. Does a “sauda” precede each load? Can one deal have many trucks and partial deliveries?
7. When is a load stored versus directly sent from seller to buyer, and where does ownership change?
8. Which weighment is authoritative for purchase, sale, stock, and transporter shortage?
9. Which quality tests and deduction formulas are actually used?
10. Beyond confirmed business-borne sale transport/brokerage and the combined seller-borne purchase deduction, which exceptional charges or shortages need structured treatment?
11. Can accepted rate or quantity change after delivery? How is the dispute recorded?

### Money and accounting

12. How are partial payments, cash discounts, withheld amounts, and round-off handled? Advance allocation is deferred from Phase 1.
13. Which additional DB/Cash Out and CR/Cash In reasons are used beyond seller payments and buyer receipts?
14. Which Sai Traders and Guru Dev Traders bank accounts exist, what are their opening balances, and are transfers between them recorded?
15. How are opening balances established and checked?
16. What profit method is used today, and how are sale quantities matched to purchase cost?
17. Does any real purchase require a separate third-party liability instead of the confirmed combined seller-borne purchase deduction?

### Product operation

18. Beyond the two primary Main users across both firms, will any Operator users be added during Phase 1?
19. What is the peak daily volume of deals, loads, payments, and printouts?
20. What devices, printers, and network quality are available?
21. Which reports are checked every day, week, month, and financial year?
22. How much historical paper/Excel data should be imported?
23. How many deals, vehicle loads, purchase/sale lines, payments, and corrections occur on a peak day?
24. What must match during parallel operation, who signs off the daily comparison, and how long must the system reconcile before becoming primary?
25. If either primary user is unavailable, which tasks cannot currently continue and who should be trained as backup?
26. What is the trusted paper source for each selected primary KPI: Net Purchase Value, Gross Sale Value, Seller Outstanding, Buyer Outstanding, and Total Available Funds?

## 13. Decision gates before coding

1. Validate one normal and several exceptional transactions.
2. Validate the principal-trader assumption and keep commission-agent behavior deferred unless a real example requires it.
3. Confirm weight, deduction, charge, settlement, payment, stock, and profit rules.
4. Validate compliance requirements with the business CA/accountant and state/APMC context.
5. Approve V1 boundaries and user roles.
6. Produce and review the data model and journal-posting matrix.
7. Only then scaffold and build the first purchase-to-payment vertical slice.

## 14. Sources consulted

Government/official sources:

- [e-NAM overview](https://enam.gov.in/)
- [e-NAM information for traders](https://enam.gov.in/stakeholders-Involved/traders)
- [e-NAM revised operational guidelines](https://enam.gov.in/web/assest/download/Revised-Operational-Guidelines-of-e-NAM.pdf)
- [Uttar Pradesh e-Mandi portal](https://emandi.up.gov.in/Home)
- [India Code — Uttar Pradesh Krishi Utpadan Mandi Adhiniyam, 1964](https://www.indiacode.nic.in/handle/123456789/15730?col=123456789%2F2510)
- [AGMARKNET 2.0 background and market-data coverage](https://agmarknet.gov.in/doc/Final%20_RFP_Agmarknet_2.0_v0.8.pdf)
- [CBIC tax invoice rules](https://cbic-gst.gov.in/gst-invoice-rules.html)
- [CBIC Integrated GST Act — interstate supply and place of supply](https://cbic-gst.gov.in/hindi/IGST-bill-e.html)
- [CBIC accounts and records rules](https://cbic-gst.gov.in/accnt-record-rules.html)
- [CBIC GST rates](https://cbic-gst.gov.in/gst-goods-services-rates.html)
- [Official e-way-bill system](https://docs.ewaybillgst.gov.in/)
- [E-way-bill/e-invoice system update advisory](https://docs.ewaybillgst.gov.in/Documents/Advisory_on_Updates_to_EWB-updated.pdf)
- [IRP e-invoicing mandate](https://einvoice6.gst.gov.in/content/einvoice-mandate/)
- [IRP 30-day reporting advisory](https://einvoice6.gst.gov.in/content/revised-time-limit-for-e-invoice-reporting-for-businesses-with-aato-of-%E2%82%B910-crores-above/)
- [India Code — Digital Personal Data Protection Act, 2023](https://www.indiacode.nic.in/indiacode/handle/123456789/22037?view_type=browse)
- [MeitY — Digital Personal Data Protection Rules, 2025](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025%3B)

Technology sources:

- [Next.js App Router](https://nextjs.org/docs/app)
- [Next.js deployment options](https://nextjs.org/docs/app/getting-started/deploying)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [Prisma schema reference for decimal/numeric](https://docs.prisma.io/docs/orm/reference/prisma-schema-reference)

Market/category examples reviewed for feature signals:

- [BUSY Mandi](https://www.umgroup.co.in/busy-mandi.php)
- [MandiGrow](https://www.mandigrow.com/anaj-mandi-software)
- [MandiYard](https://mandiyard.com/)
- [agriSATHI](https://www.agrisathi.in/)
- [Broker ERP](https://www.brokererp.app/)
- [MunsiG](https://www.munsig.co.in/)
