# HisabKitab — Living Project Context

Last updated: 8 September 2026

Current phase: Phase 1 — implementation and operator validation

Implementation status: Phase 1 operational core implemented and authenticated for both initial Main users; real-party setup and paper reconciliation pending

## 1. Why this project exists

The family business currently records transactions and performs calculations on paper. It buys grain such as paddy, rice, wheat, maize, mustard, and related commodities from large farmers or local traders and sells it to larger firms and mills across India at a margin.

Paper registers are familiar and flexible, but they create recurring problems:

- the same fact is written in multiple places;
- calculations and balances depend on individual memory;
- payments are difficult to reconcile with a particular bill;
- outstanding receivables and payables are not visible immediately;
- profit can be confused with cash received;
- old transactions are slow to find;
- corrections may erase the history of what changed;
- business knowledge remains in people rather than in a repeatable system.

HisabKitab should become the trusted operational record for the business without making daily entry slower than paper.

### Current operating scale and concentration risk

- Annual revenue/turnover is reported as more than ₹50 crore.
- Daily money movement is reported at roughly ₹50 lakh.
- Daily purchase and sale volume is reported at roughly 100 metric tonnes.
- The calculation, memory, reconciliation, and operational control for this scale are currently handled mainly by two people: the owner’s father and uncle.
- The current records remain predominantly paper-based.

The primary risk is not database throughput. The current data volume is technically modest, but the financial value, operational dependency, and concentration of knowledge are high. HisabKitab exists to make the business explainable, searchable, measurable, and resilient without taking control away from the people who understand it today.

## 2. Business model understood so far

```text
Seller / Farmer / Local Trader
            |
         Purchase
            |
      Lot, weight, quality
            |
   Transport / warehouse / transit
            |
           Sale
            |
     Buyer / Firm / Mill

Supporting parties: broker, transporter, driver, staff, accountant
Financial layer: settlement, receipt/payment, ledger, outstanding, profit
```

The business is based in **Bhadohi district, Uttar Pradesh** and sells to buyers across India, including Bihar, Madhya Pradesh, Gujarat, and Maharashtra. It both stores goods and moves some goods directly from seller to buyer.

The confirmed V1 business flow is principal trading: the business buys commodities from farmers and small traders, aggregates or transports them, and resells them to mills and larger firms. A broker may mediate the sale but does not change the business into a commission agent. Full commission-agent accounting is deferred unless a real transaction later establishes that requirement.

**Sai Traders** and **Guru Dev Traders** are separate GST-registered firms associated with Papa and Uncle. Additional legitimate firms may be added in future. V1 therefore requires a business-firm master and a firm field on every finalized purchase, sale, cash/bank movement, and report. Firm separation, tax treatment, and any inter-firm activity must be reviewed with the business accountant/CA; HisabKitab will not use a dummy or off-books firm.

The current approximate transaction mix was described as:

- 50% documented business through Sai Traders or Guru Dev Traders;
- 30% cash transactions currently conducted without paper records;
- 20% involving small trader firms.

HisabKitab’s target process will record **every** transaction, including cash transactions. Cash is a payment mode, not an off-books mode. The system will not implement a hidden, unofficial, or unrecorded ledger. The existing 30% is treated as a migration, adoption, and compliance risk to be resolved with the business accountant/CA.

## 3. Product vision

Build a fast, dependable, auditable system that mirrors the real grain-trading workflow and produces ledgers and reports from source transactions automatically.

The product should feel like a better register, not a generic ERP imposed on the family. Familiar terminology, fast keyboard/mobile entry, local print formats, and simple corrections matter as much as technical sophistication.

The desired outcome is an accurate fingertip view of current cash flow, purchases, sales, stock, party accounts, exposure, margins, historical performance, and growth. Analytics are useful only when every number can be traced to trusted source transactions.

Adoption must be evolutionary rather than abrupt. The father and uncle should continue their familiar paper workflow during an initial parallel-run period while HisabKitab acts as digital support. The system earns authority by repeatedly matching paper calculations and making retrieval, reconciliation, and analysis easier. It should become the primary record only after agreed reconciliation and confidence gates are met.

## 4. Initial users

| User | Primary need |
| --- | --- |
| Owner | Current cash, stock, margin, exposure, receivables, and payables |
| Father and uncle / current operators | Preserve familiar working methods while gaining fast calculation, search, reconciliation, and continuity |
| Accountant / munshi | Rapid entry, correct calculations, reconciliation, ledgers, exports, and closing |
| Operations staff | Lot, vehicle, weighment, dispatch, and document entry |
| Auditor / CA | Traceable source documents, tax fields, immutable history, and exports |

Phase 1 proposes Main and Operator permissions. Papa and Uncle may both operate both firms and may initially hold Main access; future user assignments remain to be confirmed.

## 5. Product principles

1. **Reality before UI.** Model the actual business transaction before designing forms.
2. **Enter once, derive many times.** Ledgers and reports come from purchases, sales, settlements, and payments; they are not separate manual registers.
3. **Never hide the calculation.** Every total must show its inputs, formula, rounding, and adjustments.
4. **Preserve history.** Posted financial records are reversed or amended, not silently overwritten or hard-deleted.
5. **Separate commercial, physical, and financial events.** A deal, truck movement, invoice, settlement, and payment are related but not identical.
6. **Use exact arithmetic.** Money, weight, rate, and quantity never use floating-point storage.
7. **Exceptions are normal.** Shortage, quality rejection, rate revision, partial delivery, advance payment, and returns are first-class workflows.
8. **Compliance is configurable.** Tax and mandi rules vary by commodity, packaging, turnover, state, and effective date; do not hard-code guesses.
9. **Data belongs to the business.** Provide reliable backup, restore, and human-readable export.
10. **Start narrow.** Stabilize daily operations before AI, forecasting, OCR, or communication automation.

## 6. Proposed product boundary

### V1 outcome

- maintain business firms, multi-role parties, commodities, deduction reasons, transporters, vehicles, and firm bank accounts;
- record purchase and sale deals and their physical loads;
- record weighment, deductions, charges, and final settlement;
- record source-linked receipts and payments, including split cash/bank sale receipts;
- generate party ledgers, outstanding reports, registers, Rokad, and a consolidated available-funds view;
- maintain audit history and export data;
- support responsive use and filtered data export;
- provide an operational dashboard for purchase value, gross sale value, seller outstanding, buyer outstanding, total available funds, and unresolved exceptions after those source modules reconcile.

### Explicitly deferred until the core is stable

- AI assistant and predictive analytics;
- OCR of handwritten slips;
- automated WhatsApp messages;
- live market-rate trading decisions;
- GPS tracking;
- direct GST, e-invoice, e-way bill, or banking API integration;
- public marketplace or e-NAM trading integration;
- native mobile apps;
- complex multi-company SaaS billing;
- on-account advance allocation, location-wise stock, inventory valuation, and final profit reporting.

The data model should leave room for these, but V1 should not carry their operational complexity.

## 7. What success means

Candidate success measures to validate:

- a normal transaction can be entered at least as quickly as it is written today;
- a party balance can be explained down to source documents and payment allocations;
- the same transaction is never re-entered to create a ledger or report;
- purchase/sale totals reproduce the paper calculation exactly for agreed examples;
- stock differences and unallocated payments are visible rather than hidden;
- every material edit identifies who changed what, when, and why;
- a backup can be restored and essential data can be exported without vendor help;
- family users can operate the system after brief training;
- the paper and digital totals reconcile during an agreed parallel-run period;
- the business can close each day with explained cash/bank, stock, payable, and receivable differences;
- an authorized person can find any party, vehicle, load, payment, or settlement within seconds;
- the business can continue safely if either of the two current operators is temporarily unavailable.

The reported scale is more than ₹50 crore annual revenue, around ₹50 lakh daily money movement, and around 100 metric tonnes of daily trade. The number of deals, loads, payments, users, and printouts per day still needs measurement because those counts—not tonnage alone—drive UX and capacity targets.

## 8. Journey log

### Before repository creation

The initial ChatGPT discussion defined the problem as automation of a traditional grain middleman/trading business. It proposed masters, purchase, sale, a daily debit/credit money book, ledgers, outstanding balances, reports, and a later dashboard. PostgreSQL was preferred because the domain is relational and transactional.

### 7 September 2026 — context imported

- The prior “Agri Business Automation” conversation was reviewed and adopted as seed context.
- The workspace was confirmed empty and not yet initialized as a Git repository.
- Coding was deliberately postponed until domain business calculations are validated.

### 7 September 2026 — structured discovery started

- Market and regulatory research began using official e-NAM, GST/e-way-bill, CBIC, MeitY, and technology documentation.
- The central modelling risk was identified: a single “buy form” or “sell form” cannot safely represent deals, loads, weighment, settlement, payments, and accounting as one record.
- A living context, discovery document, decision log, and real-transaction worksheet were created.

### 7 September 2026 — operating context and first transaction supplied

- Operating base recorded as Bhadohi district, Uttar Pradesh, with sales to Bihar, Madhya Pradesh, Gujarat, Maharashtra, and other states.
- Both warehouse/storage and direct seller-to-buyer movements were confirmed.
- A mixed operating pattern involving own firms, smaller firms, and undocumented cash transactions was disclosed. The target system boundary was set: all future transactions must be recorded regardless of payment mode.
- The first purchase example was validated: one 10,000 kg vehicle load containing 6,200 kg rice and a calculated 3,800 kg wheat balance; item deductions, purchase-level deductions, a partial payment, and an outstanding balance all reconcile.
- The canonical example is stored in `examples/PURCHASE_EXAMPLE_001.md`.

### 7 September 2026 — engineering ownership charter established

- A repository-wide `AGENTS.md` was created from the owner’s engineering-quality charter.
- The primary agent is explicitly responsible for whole-codebase coherence rather than isolated task completion.
- The charter requires agents to read and maintain the project context, discovery, decision log, and canonical examples.
- HisabKitab’s financial, entity, audit, exact-arithmetic, compliance, security, and no-off-books invariants were made non-negotiable repository guidance.
- The current discovery gate was preserved: an empty repository is not permission to scaffold before core business rules are validated or the owner deliberately advances the phase.

### 7 September 2026 — Git repository connected

- The local HisabKitab workspace was initialized as a Git repository on the `main` branch.
- GitHub repository `https://github.com/saurabh221402/HisabKitab.git` was configured as the `origin` fetch and push remote.
- The remote had no advertised refs when connected, consistent with an empty repository.
- The initial repository publication contains the engineering charter, discovery documents, decision log, transaction worksheet, and first validated purchase example.

### 7 September 2026 — scale and adoption strategy clarified

- The business scale was recorded as more than ₹50 crore annual revenue, approximately ₹50 lakh daily money movement, and approximately 100 metric tonnes bought/sold per day.
- Operational knowledge and paper calculations are concentrated mainly in the owner’s father and uncle.
- The core product purpose was refined: make accounts, cash flow, stock, analytics, history, and growth visible at the fingertips while reducing dependence on memory and two individuals.
- A gradual adoption rule was accepted. Paper operations will continue during a parallel run; HisabKitab must first prove reconciliation and usefulness rather than forcing an abrupt cutover.
- Operational dashboards and daily reconciliation were promoted as core outcomes, while predictive/advanced analytics remain deferred.

### 7 September 2026 — lean V1 direction agreed

- Sai Traders and Guru Dev Traders were confirmed as separate GST-registered firms; future firms must be addable.
- The owner asked V1 to focus on the simplest useful questions: from whom the business bought and to whom it sold.
- A sale example was added: 300 quintal of rice at ₹3,000 per quintal gives a gross sale of ₹9,00,000. A ₹3,000 buyer deduction produces ₹8,97,000 receivable. Later clarification established that brokerage and transport are business-borne costs outside buyer receivable, and the earlier generic ₹43 expense field was removed.
- Five warehouse locations were disclosed, but location-wise stock was explicitly deferred. V1 may use remarks instead.
- Advanced weight discrepancy/shortage handling and detailed charge-accounting were deferred.
- Bag weights were confirmed as variable (for example 50 kg, 60 kg, or 78 kg), so bag count and actual weight must be entered independently. Party GSTIN is optional.
- The cash book was simplified to current available cash plus DB/Cash Out and CR/Cash In entries with amount, person, and remark. Papa defines DB as money given to suppliers and CR as money received from buyers.
- Papa and Uncle are the initial direct users. Mixed-language, highly usable responsive screens and resilience to unreliable internet are required.
- Kanta parchi attachments are relevant on purchase and sale. Printer-specific support remains future scope.
- The dashboard will start with filtered KPIs and buyer/seller tables; charts are future scope.
- `docs/MVP_SCOPE.md` became the concise V1 boundary.

### 7 September 2026 — initial cloud database selected

- The owner created a Supabase project named **HisabKitab** with project reference `wpwrohqmjxwhdzoatlrq`.
- The project was verified as healthy in the Mumbai (`ap-south-1`) region on nano compute.
- At verification it had no application migrations, branches, repository integration, or available backups, providing a clean starting point.
- Supabase-hosted PostgreSQL was accepted as the initial remote database. This is already PostgreSQL; any future provider move should be a PostgreSQL dump/restore rather than an application data-model rewrite.
- The project started clean; versioned database migrations were later introduced only after the relevant purchase, sale, and cash rules were accepted.
- Secrets must remain outside Git and documentation. Independent logical backups and a restore test are required before production reliance.

### 7 September 2026 — Phase 1 foundation scaffolded

- The owner deliberately advanced the project from discovery-only work into technical setup while keeping unresolved transaction rules gated.
- A Next.js modular monolith was scaffolded with strict TypeScript, Tailwind CSS, ESLint boundary rules, Vitest, and automated CI checks.
- Presentation code lives in `src/frontend`, server application and configuration code in `src/backend`, framework adapters in `src/app`, and future pure accounting rules in `src/domain`.
- A responsive mixed-language foundation page and a non-secret health endpoint were added without inventing purchase, sale, ledger, or tax behavior.
- Supabase environment placeholders were documented; no secret, database migration, financial table, or direct browser database write was added.
- The official Supabase and Supabase PostgreSQL Agent Skills were installed locally for future engineering work.
- The Supabase MCP server and CLI were registered and authenticated for project `wpwrohqmjxwhdzoatlrq`; project migrations are now managed from the repository.

### 7 September 2026 — Phase 1 product requirements drafted

- The owner defined the Phase 1 base requirements: a modern user-friendly dashboard, reusable entity/party and commodity registration, purchase entry, sale entry, individual seller/buyer balances, daily Rokad cash flow, KPIs, and buyer/seller/commodity analytics tables.
- `docs/PRD_PHASE_1.md` converts that direction into goals, non-goals, user flows, exact KPI meanings, UX standards, lifecycle/audit rules, acceptance scenarios, delivery order, and success measures.
- Phase 1 analytics are defined as explainable KPIs and drill-down tables. Charts, stock valuation, and profit remain deferred until source records and costing rules are trustworthy.
- Internal business firms and external parties are explicitly separated: a business firm owns each posted transaction, while a party may be a buyer, seller, broker, transporter, or several roles.
- The PRD remains a draft until Papa and Uncle validate the operator workflow and the remaining example/configuration values are supplied.
- The owner added an engineering and visual-system requirement: follow strong coding practices and manage font, color, theme, spacing, surfaces, focus treatment, radii, and shadows centrally. The current foundation was refactored to semantic global design tokens so later screens inherit one consistent visual language.

### 8 September 2026 — Phase 1 financial and dashboard rules refined

- Sale transport was confirmed as a business-borne cost that does not reduce buyer receivable. Brokerage remains treated the same way.
- The generic sale-expense field was removed. Buyer deductions remain supported but require a reason such as moisture, quality, or another explicit explanation.
- A sale receipt may be split between cash and bank accounts belonging to the selling firm; the canonical example still needs the exact amounts and selling firm.
- Kanta, sack, Hamali, and other purchase-level amounts are combined into one seller-borne purchase deduction total in Phase 1. It reduces supplier payable without creating separate third-party liabilities.
- Papa and Uncle may both operate Sai Traders and Guru Dev Traders. The firms remain legally separated in source records, while a Group Overview may consolidate operational visibility.
- Daily liquidity is shown as shared operational cash plus the recorded balances of Sai Traders and Guru Dev Traders bank accounts, with firm/account drill-down preserved.
- On-account advance allocation was deferred. Backdated posting, reversal, opening-balance changes, and reopening a day require the Main role, a reason, and extra confirmation.
- Phase 1 accepts whole-kilogram weight and whole-rupee rate inputs. Derived amounts retain exact paise; `kg × ₹/Qt` is calculated as integer paise, so this input policy requires no rounding.
- The five primary mobile KPIs were selected: Net Purchase Value, Gross Sale Value, Seller Outstanding, Buyer Outstanding, and Total Available Funds.

### 8 September 2026 — first operational slice built

- The owner authorized implementation with a deliberate simplicity constraint: make safe technical decisions, document them, and avoid ERP-scale complexity.
- The foundation page was replaced by a responsive mixed-language operations dashboard using the five accepted KPIs. The dashboard now derives live values from posted source records; unknown opening liquidity is shown as unknown rather than invented.
- The canonical purchase became a working form with Kanta net weight, one automatic residual commodity, exact item totals, combined seller deduction, cash/bank payment choice, reload-safe device draft saving, and a reconciled summary.
- Pure domain calculations now use integer kilograms, whole-rupee rates, and integer paise. Automated tests reconcile Purchase Example 001 to ₹3,73,100 payable and ₹1,73,100 pending and prove a ₹30.01 edge case without floating-point arithmetic.
- Supabase SSR authentication, route protection, server-side validation, reusable party and commodity registration, atomic purchase posting, idempotency, and a posted purchase detail screen were implemented behind the documented frontend/backend/domain boundaries.
- Versioned remote migrations created the initial access, master, purchase, payment, summary, and audit model. RLS is enabled on every application table. Supabase database lint reports no schema errors.
- The local repository is linked to Supabase CLI and its migration history is reconciled.

### 8 September 2026 — Phase 1 operational core completed

- The sale-to-receipt vertical slice was implemented from Sale Example 001. One actual whole-kilogram weight remains independent of bag count; buyer deduction reduces receivable; brokerage and transport remain separate business costs; up to five cash/bank receipt portions reduce pending balance.
- Automated sale tests reproduce ₹9,00,000 gross and ₹8,97,000 final receivable and verify exact paise behavior. Purchase and sale now share one exact-number policy without floating-point money arithmetic.
- Daily Rokad was implemented as a derived view over cash purchase payments, cash sale receipts, and reasoned manual cash entries. A single immutable operational-cash opening is reserved for a Main user; until supplied, cash and liquidity are visibly provisional.
- The dashboard now uses live, RLS-filtered data for the five selected KPIs, current weight movement, and recent source records. Bank balances derive from bank-account openings and linked bank movements.
- A filterable party-position table now shows firm-specific buyer, seller, broker, and transporter exposure from posted transactions.
- Eight remote migrations are aligned with the repository. Production build, strict TypeScript, ESLint, exact-calculation tests, and remote database lint pass; Supabase security/performance advisors remain part of the final activation check.

### 8 September 2026 — authenticated activation and browser QA

- Separate `papa` and `uncle` Supabase accounts were created, confirmed, assigned the Main role, and granted access to both Sai Traders and Guru Dev Traders. Their rotated temporary credentials remain only in a git-ignored local handoff file.
- Public email self-registration was disabled in Supabase. The application is invite/admin-only and now provides an explicit sign-out action. The login redirect cache handoff was corrected and both accounts were verified from sign-out through the live dashboard.
- Dashboard, Masters, Purchase, Sale, Rokad, and Parties were exercised under Papa's real authenticated RLS context on desktop and a 390 px mobile viewport. Both users reached their personalized dashboard without a runtime error.
- Purchase and sale forms now autosave changed drafts to the current device, restore them after reload, reject stale/corrupt references, and provide a discard action. Browser QA proved autosave, reload restoration, and cleanup for both forms without posting sample financial data.
- Normal purchase and sale entries now start clean with today's business date. The two canonical calculation sets remain available only behind explicit “Load validated example” actions, preventing demo amounts from being mistaken for live business data.
- All eight local/remote migrations remain aligned. Remote database lint and Performance Advisor report no errors or warnings. Security Advisor reports no errors and one Free-plan limitation: leaked-password screening requires Supabase Pro; strong generated temporary passwords are used meanwhile.

## 9. Current checkpoint

We have a runnable, secured Phase 1 operational core backed by the remote Supabase project. Papa and Uncle's individual Main accounts are active and authenticated browser validation is complete. The remaining gate is controlled real/example posting and paper reconciliation; unvalidated opening balances, reversal UI, attachments, exports, and formal daily close remain deliberately incomplete.

```text
Register real seller, buyer, broker, transporter, and bank accounts
  -> post and reconcile Purchase Example 001
  -> post and reconcile Sale Example 001 after missing values are supplied
  -> set verified cash/bank openings
  -> validate dashboard, balances, and Rokad with Papa and Uncle
```

## 10. How this document should be maintained

- Update the journey log whenever a meaningful phase, validation, or implementation milestone completes.
- Put detailed product findings in `DISCOVERY.md`.
- Record decisions and reversals in `DECISIONS.md`; do not erase superseded decisions.
- Mark assumptions explicitly until the owner/accountant validates them.
