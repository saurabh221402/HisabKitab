# HisabKitab — Living Project Context

Last updated: 7 September 2026

Current phase: Phase 0 — discovery and business-rule validation

Implementation status: Not started

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

The user has indicated that the business operates in both principal-trader and commission/other-party contexts. The exact role must be recorded per deal because it changes inventory ownership, revenue recognition, invoices, taxes, and profit rules.

Two trading names were identified: **Sai Traders** and **Guru Dev Traders**. It is not yet known whether these are separate legal entities/GST registrations or trade names under the same entity. Until that is resolved, no transaction may be allowed to move silently between their books.

The current approximate transaction mix was described as:

- 50% documented business through Sai Traders or Guru Dev Traders;
- 30% cash transactions currently conducted without paper records;
- 20% involving small trader firms.

HisabKitab’s target process will record **every** transaction, including cash transactions. Cash is a payment mode, not an off-books mode. The system will not implement a hidden, unofficial, or unrecorded ledger. The existing 30% is treated as a migration, adoption, and compliance risk to be resolved with the business accountant/CA.

## 3. Product vision

Build a fast, dependable, auditable system that mirrors the real grain-trading workflow and produces ledgers and reports from source transactions automatically.

The product should feel like a better register, not a generic ERP imposed on the family. Familiar terminology, fast keyboard/mobile entry, local print formats, and simple corrections matter as much as technical sophistication.

## 4. Initial users

| User | Primary need |
| --- | --- |
| Owner | Current cash, stock, margin, exposure, receivables, and payables |
| Accountant / munshi | Rapid entry, correct calculations, reconciliation, ledgers, exports, and closing |
| Operations staff | Lot, vehicle, weighment, dispatch, and document entry |
| Auditor / CA | Traceable source documents, tax fields, immutable history, and exports |

Actual roles and approval permissions remain to be confirmed.

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

- maintain parties, commodities, units, grades, transporters, vehicles, and expense/charge types;
- record purchase and sale deals and their physical loads;
- record weighment, deductions, charges, and final settlement;
- record receipts, payments, advances, and their allocation;
- generate party ledgers, outstanding reports, registers, and stock views;
- maintain audit history and export data;
- support responsive use and practical printing.

### Explicitly deferred until the core is stable

- AI assistant and predictive analytics;
- OCR of handwritten slips;
- automated WhatsApp messages;
- live market-rate trading decisions;
- GPS tracking;
- direct GST, e-invoice, e-way bill, or banking API integration;
- public marketplace or e-NAM trading integration;
- native mobile apps;
- complex multi-company SaaS billing.

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
- family users can operate the system after brief training.

Targets such as maximum entry time, number of users, and daily volume will be set during discovery.

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

## 9. Current checkpoint

We have a strong hypothesis, not a finalized specification. The next gate is business validation using real documents and calculations. After that:

```text
Validated examples
  -> calculation specification
  -> PRD and permission model
  -> domain/data model
  -> accounting posting rules
  -> API and UI flows
  -> implementation milestones
```

## 10. How this document should be maintained

- Update the journey log whenever a meaningful phase, validation, or implementation milestone completes.
- Put detailed product findings in `DISCOVERY.md`.
- Record decisions and reversals in `DECISIONS.md`; do not erase superseded decisions.
- Mark assumptions explicitly until the owner/accountant validates them.
