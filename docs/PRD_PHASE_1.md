# HisabKitab — Phase 1 Product Requirements Document

Last updated: 8 September 2026

Status: Operational core and initial-user authentication implemented; real operator reconciliation pending

Release name: Phase 1 — Operational Core

## 1. Product summary

HisabKitab Phase 1 is a modern, responsive digital companion for the two primary business users to record daily grain purchases, sales, receipts, payments, and cash movement while they continue their familiar paper process during adoption.

The release should answer, within seconds:

- From whom did we buy, under which business firm, and for how much?
- To whom did we sell, and how much remains to be received?
- How much has been paid to each seller and received from each buyer?
- What cash came in or went out today, and what cash should currently be available?
- What did each buyer, seller, broker, transporter, and commodity contribute during a selected period?
- Which source entries explain every displayed total?

Phase 1 is intentionally narrower than a complete ERP. Its purpose is to establish a trusted operational record and prove that digital totals reconcile with the paper process.

## 2. Business context

- The business operates from Bhadohi district, Uttar Pradesh, and sells across India.
- Reported scale is more than ₹50 crore annual revenue, around ₹50 lakh daily money movement, and around 100 metric tonnes of daily trade.
- Most operating knowledge and calculations currently depend on two primary operators.
- Sai Traders and Guru Dev Traders are separate GST-registered business firms; more legitimate firms may be added later.
- The business buys as principal from farmers and small traders, aggregates or transports commodities, and sells to mills and larger firms. Brokers mediate sales but are not the seller.
- Internet connectivity may be unreliable, so unfinished work must survive temporary disconnection.
- Paper remains in parallel during adoption. HisabKitab earns trust by repeatedly reproducing and explaining the same totals.

## 3. Phase 1 goals

1. Provide a modern, uncluttered dashboard that the primary users can understand without accounting-software training.
2. Maintain reusable records for business firms, parties, commodities, transporters, brokers, and vehicles.
3. Record a complete purchase with weighment, commodity lines, deductions, payment, pending balance, remarks, and Kanta parchi.
4. Record a complete sale with buyer, weight, rate, deductions, brokerage, transport, receipt, pending balance, remarks, and Kanta parchi.
5. Generate seller payables and buyer receivables from source transactions and linked payments—never through duplicate manual ledger entry.
6. Show daily Rokad: opening cash, cash in, cash out, expected closing cash, counted cash, and any explained difference.
7. Provide filterable purchase, sale, party, commodity, and cash tables with drill-down to source records.
8. Preserve firm separation, exact calculations, audit history, and safe correction behavior from the first release.
9. Support paper-plus-digital parallel operation and clearly distinguish local drafts from server-confirmed records.

## 4. Non-goals for Phase 1

- location-wise warehouse stock;
- inventory valuation, COGS, and final profit calculation;
- charts, forecasting, or advanced growth analytics;
- commission-agent accounting;
- automatic GST, e-invoice, e-way-bill, mandi, or banking integrations;
- automatic bank-statement import and reconciliation;
- native mobile applications;
- full multi-user offline posting or automatic conflict merging;
- printer-specific hardware integration;
- OCR, WhatsApp automation, AI suggestions, or market-rate automation;
- inter-firm transfer accounting unless a validated example establishes it;
- generic sale-expense lines or advance-allocation workflows.

Phase 1 may capture optional reference fields needed for future compliance, but it must not calculate or represent tax treatment until the accountant/CA validates the rules.

## 5. Users and proposed permissions

Every user must have an individual username and password. Shared accounts are not allowed because material changes must identify the responsible person.

| Capability | Operator | Main |
| --- | --- | --- |
| View authorized firms and records | Yes | Yes |
| Create and edit drafts | Yes | Yes |
| Post a validated purchase, sale, or payment | Proposed: Yes | Yes |
| Create and maintain ordinary masters | Proposed: Yes | Yes |
| Reverse/correct a posted transaction | No | Yes |
| Set opening cash or reopen a closed day | No | Yes |
| Manage users and firm access | No | Yes |

Both primary users may view and operate Sai Traders and Guru Dev Traders. Both initial accounts hold the `Main` role. Public self-registration is disabled; a future Main-controlled workflow may add Operator accounts. A future Operator role can perform normal entry, while reversal, backdated posting, opening-balance changes, and reopening a closed day remain protected Main actions.

## 6. Product terminology

| Term | Meaning in HisabKitab |
| --- | --- |
| Business Firm | An internal legal/GST-registered trading business, such as Sai Traders or Guru Dev Traders |
| Party | An external person or organization that may have one or more roles: seller, buyer, broker, or transporter |
| Purchase / Buy | Commodity bought by one business firm from a seller |
| Sale | Commodity sold by one business firm to a buyer |
| DB / Cash Out | The business's familiar label for money leaving cash; it is not presented as an accounting debit |
| CR / Cash In | The business's familiar label for money entering cash; it is not presented as an accounting credit |
| Draft | Editable work that does not affect official balances |
| Posted | Server-confirmed record that affects balances and reports |
| Reversed | Posted record neutralized through a traceable correction; it is not deleted |
| Group Overview | An operational consolidation across authorized firms; it does not merge their underlying legal books |

The interface may use mixed Hindi/English labels, but stored concepts and report headings must remain unambiguous.

## 7. Navigation and information architecture

Phase 1 primary navigation:

1. **Dashboard / आज का हिसाब**
2. **Purchase / खरीद**
3. **Sale / बिक्री**
4. **Rokad / रोकड़**
5. **Parties / खाते**
6. **Reports / रिपोर्ट**
7. **Masters / मास्टर**
8. **Settings / सेटिंग्स**

The selected business firm and date context must remain visible. Both primary users may select `Group Overview / All Firms` for consolidated operational visibility; entries and firm-specific ledgers are never posted or legally merged under that view.

## 8. Functional requirements

### FR-01 — Authentication and firm context

- Users sign in with an individual username and password.
- Server-side authorization controls every protected read and write.
- Each user is granted access to explicit business firms.
- Both primary users are initially authorized for Sai Traders and Guru Dev Traders.
- Every posted purchase, sale, and bank movement belongs to exactly one business firm. Shared operational-cash movements retain their source firm when applicable.
- A missing or `Unassigned` firm is permitted only for a draft and blocks posting.
- Switching firms updates all dashboard totals, lists, defaults, and search results consistently.
- Consolidated views retain firm labels and never combine party balances in a way that hides their legal owner.

### FR-02 — Business-firm registration

Minimum fields:

- firm name;
- display name;
- optional GSTIN and address;
- active/inactive status;
- authorized users.

Firm deletion is not allowed after use. A firm can be made inactive without changing its historical records.

### FR-03 — Party registration

Use one party directory. A party may have multiple roles:

- seller;
- buyer;
- broker;
- transporter.

Minimum fields:

- party name;
- one or more roles;
- optional mobile number;
- optional address/place;
- optional GSTIN;
- remarks;
- active/inactive status.

Behavior:

- Search existing parties before creating a new one.
- Warn on likely duplicates using normalized name, mobile, or GSTIN, but allow an authorized user to confirm genuinely distinct parties.
- Allow quick party creation without abandoning an in-progress purchase or sale.
- Show balances by party, role, business firm, and selected period.
- Do not create duplicate party records merely because one party performs several roles.

### FR-04 — Commodity and supporting masters

Commodity fields:

- name;
- optional local/Hindi name;
- default rate basis, such as quintal or kilogram;
- active/inactive status;
- remarks.

Supporting masters:

- buyer-deduction reason labels such as moisture and quality;
- payment modes;
- vehicle number with optional transporter link;
- bank accounts belonging to a business firm.

Bag count and commodity weight are independent. The system must never infer weight from the number of bags because actual bag weights vary.

### FR-05 — Purchase entry

The normal purchase form captures:

- date;
- business firm;
- seller;
- vehicle number;
- Kanta number;
- loaded vehicle weight in kg;
- empty vehicle weight in kg;
- calculated net commodity weight;
- one or more commodity lines;
- line weight in kg and calculated quintal;
- rate and rate basis;
- line gross amount;
- one or more line deductions;
- line final amount;
- one seller-borne purchase deduction total with an optional remark;
- final payable;
- amount paid now;
- payment mode and cash/bank account;
- pending balance;
- optional paper/document reference;
- remarks;
- optional Kanta parchi attachment.

Purchase calculations:

```text
Net vehicle weight = loaded weight − empty weight
Weight in quintal = weight in kg ÷ 100
Line gross = quantity in selected rate unit × rate
Line final = line gross − line deductions
Commodity total = sum(line final)
Final payable = commodity total − seller-borne purchase deduction
Pending balance = final payable − allocated purchase payments
```

Rules:

- Loaded weight must be greater than empty weight.
- Commodity line weights must reconcile exactly to net vehicle weight before posting.
- One commodity line may be calculated as residual weight; the app shows the formula and asks for confirmation.
- Purchase-level items such as Kanta, plastic sack, Hamali, and other deduction are combined into one seller-borne total in Phase 1. It reduces supplier payable and does not create separate third-party liabilities.
- Weight is entered at whole-kilogram precision and rates at whole-rupee precision. Calculations still use exact decimal arithmetic; derived-amount rounding when paise arise remains to be validated.
- A purchase number is generated uniquely within its business firm.
- Recording `Paid now` creates one linked cash/bank movement; it must not require or permit duplicate Rokad entry for the same payment.
- A posted purchase updates seller payable and the relevant dashboard/report totals atomically.
- Drafts may remain incomplete; posting requires all mandatory data and reconciled calculations.

Canonical acceptance example: `PURCHASE_EXAMPLE_001.md` must produce a final payable of ₹3,73,100 and pending balance of ₹1,73,100 after a ₹2,00,000 payment.

### FR-06 — Sale entry

The normal sale form captures:

- date;
- business firm;
- buyer;
- commodity;
- bag count when used;
- actual weight in kg or quintal, entered independently;
- sale rate and rate basis;
- gross sale amount;
- buyer-facing deduction lines;
- broker and brokerage rate per quintal;
- calculated brokerage amount;
- transporter and transport rate per quintal;
- calculated transport amount;
- final receivable;
- one or more receipt portions, each assigned to cash or a firm bank account;
- pending balance;
- vehicle and Kanta details when available;
- optional paper/document reference;
- remarks;
- optional Kanta parchi attachment.

Validated sale calculations:

```text
Gross sale = actual sale weight in quintal × sale rate per quintal
Final buyer receivable = gross sale − buyer deductions
Brokerage = actual sale weight in quintal × brokerage rate per quintal
Transport = actual sale weight in quintal × transport rate per quintal
Pending balance = final buyer receivable − linked cash and bank receipts
```

Rules:

- Brokerage paid by the business is a separate broker cost/payable and does not reduce buyer receivable.
- Transport is borne by the business. It is a separate business cost/payable and does not reduce buyer receivable.
- Every buyer deduction requires a reason such as moisture, quality, or another clearly entered reason.
- The generic sale `Expense` field is removed. Phase 1 records only explicit brokerage, transport, and buyer deductions on the sale.
- `Received now` may be split between cash and one or more bank accounts belonging to the selling firm. Each portion creates one linked money movement.
- A posted sale updates buyer receivable and the relevant dashboard/report totals atomically.
- Phase 1 uses one commodity on the normal sale screen. Multi-commodity sale behavior requires a real example before inclusion.

Canonical acceptance example: `SALE_EXAMPLE_001.md` must produce gross sale of ₹9,00,000 and final buyer receivable of ₹8,97,000 after the validated ₹3,000 buyer deduction. Business-paid brokerage and transport remain separate costs.

### FR-07 — Payments, receipts, and outstanding

- Purchase payments reduce the selected firm's payable to the seller.
- Sale receipts reduce the selected firm's receivable from the buyer.
- Phase 1 payment and receipt portions link directly to a purchase or sale.
- Source-linked money movement appears once in Rokad/bank and once in the party history, with links back to the same source event.
- On-account advances and later allocation are deferred. An independent cash movement does not silently settle a purchase or sale.
- Linked payment/receipt totals cannot exceed the transaction's outstanding balance in Phase 1.
- Party statements show opening position, transactions, allocations, reversals, and closing position for the selected business firm and period.

### FR-08 — Daily Rokad and basic bank movement

The daily Rokad view represents the shared operational cash position while retaining the business firm on every source movement. It includes:

- opening cash;
- DB / Cash Out entries;
- CR / Cash In entries;
- calculated closing cash;
- optional counted cash;
- difference between calculated and counted cash;
- explanation/remark for a difference;
- entry source, person/party, creator, and time.

Calculation:

```text
Calculated closing cash = opening cash + total CR / Cash In − total DB / Cash Out
Cash difference = counted cash − calculated closing cash
Next day opening cash = prior accepted closing cash
```

Rules:

- The initial operational opening cash amount requires Main authority and an audit record.
- Purchase payments and sale receipts automatically appear in Rokad when their payment mode is cash.
- Independent cash entries are allowed for other genuine cash movements and require amount, person/party, and remark.
- The UI warns about likely duplicate source/manual entries.
- Negative expected cash is prominently flagged but not automatically rewritten.
- A backdated cash entry or reopening an accepted daily close requires Main authority, a reason, and an additional confirmation barrier.
- Bank accounts remain owned by Sai Traders or Guru Dev Traders. Phase 1 supports their opening balance plus linked/manual bank receipt and payment records; statement import and reconciliation remain deferred.
- The Group Overview shows total available funds while preserving account-level and firm-level drill-down.

```text
Total available funds
  = shared operational cash
  + recorded Sai Traders bank-account balances
  + recorded Guru Dev Traders bank-account balances
```

This is an operational consolidated view, not a combined legal ledger. Every underlying bank movement and transaction remains assigned to its business firm.

### FR-09 — Dashboard and KPIs

Default dashboard context: today plus `Group Overview`, with firm drill-down always available.

Required filters:

- date or date range;
- business firm;
- commodity;
- party;
- purchase/sale;
- cash/bank.

Required KPI definitions:

| KPI | Definition |
| --- | --- |
| Purchase Weight | Sum of posted purchase commodity weight in the selected context |
| Net Purchase Value | Sum of posted purchase final payable after validated purchase deductions |
| Paid to Sellers | Sum of allocated purchase payments in the selected context |
| Seller Outstanding | Posted seller payables minus allocated payments and valid reversals, as of the selected date |
| Sale Weight | Sum of posted actual sale weight in the selected context |
| Gross Sale Value | Sum of posted sale gross amounts before buyer deductions |
| Net Sale Receivable | Sum of posted final buyer receivable after validated buyer-facing adjustments |
| Received from Buyers | Sum of allocated sale receipts in the selected context |
| Buyer Outstanding | Posted buyer receivables minus allocated receipts and valid reversals, as of the selected date |
| Cash In / Cash Out | Sum of posted CR and DB cash movements during the selected period |
| Current Cash | Latest calculated shared operational cash position |
| Total Available Funds | Shared operational cash plus recorded balances of bank accounts belonging to Sai Traders and Guru Dev Traders |

The five primary mobile KPI cards are:

1. **Net Purchase Value** for the selected period.
2. **Gross Sale Value** for the selected period.
3. **Seller Outstanding** as of the selected date.
4. **Buyer Outstanding** as of the selected date.
5. **Total Available Funds** as of the selected date.

Weight, Paid to Sellers, Received from Buyers, Cash In, and Cash Out remain secondary dashboard facts and are available through the detailed view.

Dashboard behavior:

- Clearly distinguish period activity from `as of` balances.
- Every KPI opens the filtered source table that explains its value.
- Drafts, failed syncs, and reversed entries are excluded from official totals and shown separately.
- `All Firms` totals are permitted only for authorized overview and retain firm-level drill-down.
- Do not display profit or stock-on-hand until their accounting rules are validated.

### FR-10 — Analytics and report tables

Phase 1 analytics are filterable summaries and tables, not decorative charts.

Required views:

1. **Purchase register:** date, firm, seller, commodity, weight, gross, deductions, payable, paid, pending, status.
2. **Sale register:** date, firm, buyer, commodity, weight, gross, deductions, receivable, received, pending, broker, transporter, status.
3. **Seller summary:** seller, purchase weight/value, paid, outstanding, last transaction date.
4. **Buyer summary:** buyer, sale weight/value, received, outstanding, last transaction date.
5. **Commodity summary:** commodity, purchase weight/value, sale weight/value, without presenting unvalidated profit or stock.
6. **Broker summary:** broker, sale weight handled, brokerage amount, paid/pending when available.
7. **Transporter summary:** transporter, transported weight, transport amount, paid/pending when available.
8. **Daily Rokad:** shared opening cash, cash in, cash out, calculated closing, counted closing, difference, source firm, and status.
9. **Outstanding:** party, firm, type, source transaction, age, original amount, settled amount, pending amount.

Table requirements:

- server-side filtering, sorting, and pagination when data volume requires it;
- sticky headers and readable Indian-number formatting;
- sensible mobile card/table adaptation;
- explicit loading, empty, error, and retry states;
- export of the current filtered view to CSV;
- row selection is not required for destructive bulk actions in Phase 1.

### FR-11 — Draft, posting, correction, and audit lifecycle

```text
Draft → Posted → Reversed
                    ↘ replacement Draft → Posted
```

- Drafts are editable and do not affect balances.
- Posting validates data on the server and commits the transaction, linked money movement, balances/postings, and audit event atomically.
- Repeated clicks or retries must not create duplicate posted transactions.
- Posted financial records are not directly overwritten or hard-deleted.
- A user-friendly Main-only `Correct Entry` action requires a reason and extra confirmation, then creates a traceable reversal/replacement flow.
- Backdated posting is Main-only and requires a reason plus explicit date-impact confirmation.
- Audit history records creator, timestamps, poster, reversal actor/reason, source links, and material before/after values.
- Lists clearly identify draft, syncing, posted, failed, and reversed states.

### FR-12 — Attachments and remarks

- Purchases and sales accept an optional Kanta parchi image or PDF.
- Files are private and accessible only to authorized users.
- File type, size, and content are validated server-side.
- Attachment metadata links to one business firm and source transaction.
- Replacing/removing an attachment preserves an audit event.
- Remarks are searchable but never substitute for required structured financial fields.

## 9. User-experience requirements

### UX-01 — Visual design

- Modern dashboard with calm visual hierarchy, strong contrast, generous spacing, and restrained color.
- Typography, color, spacing scale, radii, shadows, focus treatment, and theme values are defined centrally as semantic design tokens; feature components consume those tokens instead of introducing one-off theme values.
- Theme changes must be made through the global design layer and remain consistent across dashboard, forms, tables, dialogs, notifications, and print/export surfaces.
- Familiar grain-trading language instead of generic ERP/accounting jargon.
- Indian number formatting, for example `₹3,73,100`, with explicit `kg` and `Qt` units.
- Consistent cards, tables, forms, dialogs, status badges, notifications, and empty states.
- Color may reinforce status but must not be the only signal.

### UX-02 — Fast entry

- One guided screen for the normal purchase workflow and one for sale.
- Searchable selectors with quick-add for a missing party, commodity, vehicle, broker, or transporter.
- Automatic calculations update immediately and show the formula inputs.
- A sticky summary shows weight, gross amount, deductions, paid/received, and pending balance.
- Logical keyboard order, numeric keyboard on mobile, large touch targets, and minimal required typing.
- Useful defaults may be suggested, but rates and financial classifications are never silently assumed.

### UX-03 — Safety and recovery

- Autosave unfinished forms locally as clearly labelled drafts.
- Show `Saved locally`, `Syncing`, `Synced`, or `Failed` near the form.
- Never lose entered data because of refresh, timeout, or temporary disconnection.
- Posting requires server confirmation; local-only drafts never affect official KPIs or balances.
- Show field-level validation plus a concise posting summary.
- Warn on likely duplicate party, Kanta number, vehicle/date/seller combination, or repeated payment.
- Destructive/correction actions state their impact and require confirmation.

### UX-04 — Responsive and accessible use

- Support desktop, tablet, and common Android phone sizes from 320 px upward.
- Core workflows are operable with keyboard and screen reader.
- Visible focus states, semantic labels, accessible error messages, and WCAG AA contrast are required.
- Mixed Hindi/English text must render correctly, and user-entered names support Unicode.

## 10. Data integrity and security requirements

- Store money, weights, quantities, and rates as exact decimals—not binary floating point.
- Phase 1 input precision is one kilogram for weight and one rupee for rate. Define derived-amount rounding before schema implementation; historical results retain their formula version.
- Enforce firm ownership and authorization on the server and in PostgreSQL policies/constraints.
- The browser does not write directly to financial tables.
- Important multi-record posting operations succeed or fail as one database transaction.
- All important writes use idempotency and duplicate detection.
- Secrets stay outside source control and client bundles.
- Sensitive data is masked where full display is unnecessary.
- Posted records and audit history are retained; deletion is limited to unused drafts where policy permits.
- Supabase/PostgreSQL migrations are versioned in the repository.
- Backups, restore testing, and export ownership must be established before production dependence.

## 11. Engineering quality requirements

- Preserve the documented `app`, `frontend`, `backend`, `domain`, and `shared` responsibility boundaries.
- Keep business calculations out of presentation components and validate them again on the server/domain boundary.
- Prefer small cohesive modules, direct imports, strict types, accessible semantic markup, and predictable error handling.
- Reuse established components and design tokens rather than duplicating UI or styling logic.
- Every financial behavior requires focused automated tests against accepted examples plus integration coverage at posting boundaries.
- Lint, strict type-checking, tests, and production build must pass before a change is ready to merge.
- Dependencies and abstractions must solve a demonstrated requirement and remain replaceable where provider lock-in would threaten portability.

## 12. Reliability and performance targets

Initial targets, to be validated on the actual office devices and network:

- No loss of an in-progress entry during temporary network failure or page refresh.
- Common dashboard and recent-entry views become usable within two seconds on a normal office connection.
- Party/commodity selector results feel immediate for expected Phase 1 data volume.
- Posting shows progress, prevents accidental duplication, and returns an explainable success or failure.
- A failed request can be safely retried without creating a second transaction.
- The system health state exposes operational status without exposing credentials.

## 13. Acceptance scenarios

### AC-01 — Canonical purchase

Entering the validated 7 September 2026 purchase produces:

- net vehicle weight: 10,000 kg;
- rice: 6,200 kg / 62 Qt;
- residual wheat: 3,800 kg / 38 Qt;
- commodity total after line deductions: ₹3,78,600;
- purchase deductions: ₹5,500;
- final payable: ₹3,73,100;
- paid now: ₹2,00,000;
- seller pending: ₹1,73,100;
- exactly one linked payment/Rokad movement.

### AC-02 — Canonical sale baseline

Entering 300 Qt rice at ₹3,000 per Qt produces ₹9,00,000 gross sale. A ₹3,000 moisture/quality/other reasoned buyer deduction produces ₹8,97,000 final buyer receivable. Brokerage and business-borne transport are calculated separately from actual quintal and do not reduce the buyer balance. Cash and bank receipt portions together reduce the pending balance.

### AC-03 — Firm separation

The same party may trade with both Sai Traders and Guru Dev Traders, but each firm's purchase, sale, bank movement, payment, and outstanding remain separately explainable. Shared operational-cash movements retain source-firm attribution. A user without access to a firm cannot read or change its records.

### AC-04 — Linked Rokad

A ₹2,00,000 cash payment recorded from a purchase appears automatically as one DB/Cash Out entry. Attempting to create the same manual movement produces a duplicate warning.

### AC-05 — Correction

Correcting a posted amount preserves the original record, reason, actor, reversal, replacement, and changed balances. No history disappears.

### AC-06 — Poor internet

An operator can continue an unfinished entry during a connection interruption. The screen identifies it as local-only, and official KPIs remain unchanged until server posting succeeds once.

### AC-07 — KPI explainability

Selecting any seller/buyer outstanding KPI opens a table whose source transactions and allocations add exactly to the displayed amount.

## 14. Delivery sequence

Implementation checkpoint on 8 September 2026: steps 2–4 and the first implementation of step 6 are complete in code and remote migrations. Daily Rokad, party positions, live dashboard read models, invite-only authentication for the two primary users, and reload-safe local draft recovery are implemented. Step 7 remains partial because daily close and exports depend on unresolved rules. Steps 1, 5, and 8 still require real use and paper reconciliation with the primary users.

1. Validate this PRD, permissions, formulas, and terminology with the owner and primary users.
2. Define derived-money rounding, status transitions, posting matrix, and data model.
3. Build authentication, firm context, and party/commodity masters.
4. Build the canonical purchase-to-payment vertical slice, including Rokad and seller outstanding.
5. Pilot that slice against paper and correct discrepancies.
6. Build the sale-to-receipt slice with reasoned deductions, business-borne brokerage/transport, and split cash/bank receipts.
7. Add daily Rokad closing, buyer/seller/commodity tables, dashboard KPIs, and exports.
8. Run a controlled paper-plus-digital pilot with reconciliation and sign-off criteria.

## 15. Phase 1 success criteria

- The primary users can enter normal purchases, sales, and cash movements without assistance after brief training.
- The canonical purchase and sale examples reconcile exactly.
- Every seller payable and buyer receivable is traceable to source transactions and payments.
- No transaction is entered twice merely to produce Rokad, a ledger, or a dashboard.
- Paper and digital totals reconcile within an agreed tolerance throughout the pilot.
- Users can find a party, vehicle, purchase, sale, payment, or pending balance within seconds.
- Temporary connectivity loss does not lose draft work or create duplicate posted records.
- Firm data remains isolated and every material change has an audit trail.
- The owner can understand current purchase, sale, seller payable, buyer receivable, and cash position from a phone or desktop.

## 16. Remaining business validation

The owner has resolved the main Phase 1 shape. These remaining example/configuration values are still needed before their affected slices are posted:

1. What brokerage rate and transport rate apply in Sale Example 001?
2. What exact amount was received in cash, what exact amount was received into which firm bank account, and which firm made the sale?
3. What payment mode/account and purchasing firm apply to Purchase Example 001?
4. Is physical cash counted and accepted every day, and who enters the initial shared opening cash?
5. What opening balance should be entered for each Sai Traders and Guru Dev Traders bank account, and how often will it be manually reconciled in Phase 1?
The implementation retains exact paise for derived amounts. Kanta numbers are unique within one firm and business date, may repeat on a different date or firm, and purchases support up to ten commodity lines with at most one residual line. These safe defaults remain subject to operator validation but are now explicit rather than unresolved.

Until the five values above are answered, their affected reports or transaction examples must remain visibly incomplete and must not be guessed as real business data.
