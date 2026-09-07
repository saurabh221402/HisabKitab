# HisabKitab — Decision Log

Last updated: 7 September 2026

Status meanings:

- **Accepted:** safe foundation already agreed or strongly required.
- **Proposed:** recommended direction awaiting explicit validation.
- **Open:** business input or a prototype is required.
- **Deferred:** intentionally outside the current phase.
- **Superseded:** retained for history but replaced by a later decision.

## Decisions

| ID | Status | Decision | Why / consequence | Validation needed |
| --- | --- | --- | --- | --- |
| D-001 | Accepted | Complete discovery before scaffolding UI/backend | Wrong settlement rules would force database and accounting redesign | Validate using real transactions |
| D-002 | Accepted | PostgreSQL is the database direction | The domain needs transactions, constraints, joins, allocations, exact decimals, and reports | Select provider/version later |
| D-003 | Accepted | Ledgers and daily books are generated from source events | Prevents duplicate entry and unexplained balances | Posting matrix must reconcile with paper |
| D-004 | Accepted | No floating-point arithmetic for money, rates, weights, or quantities | Financial and quantity rounding must be deterministic | Choose precision per field |
| D-005 | Accepted | Posted records are reversed/amended, not hard-deleted | Preserves auditability and legal/business history | Define roles and closed-period flow |
| D-006 | Accepted | V1 excludes AI, OCR, predictive analytics, and WhatsApp automation | Core operational correctness has higher value | Revisit after stable adoption |
| D-007 | Proposed | Model deal, load/lot, weighment, settlement, invoice, payment, and journal separately | These events can occur at different times and in many-to-many patterns | Validate against real paper flow |
| D-008 | Proposed | Use a unified Party with multiple roles | One firm can buy, sell, broker, or transport; duplicate masters split balances | Confirm current party practices |
| D-009 | Proposed | Use kg as canonical mass while retaining original units | Supports consistent stock and conversion without losing source meaning | Confirm units and bag behavior |
| D-010 | Proposed | Hide double-entry mechanics behind business actions | Users understand “pay” and “receive”; balanced postings protect correctness | Review journal examples with accountant |
| D-011 | Proposed | Build a modular monolith with Next.js and PostgreSQL | Fastest path for a small team while preserving module boundaries | Confirm expected clients/team/scale |
| D-012 | Proposed | Use Prisma for mainstream typed CRUD and explicit SQL for complex reports | Balances developer speed with transparent reporting | Run schema/reporting spike before lock |
| D-013 | Proposed | Start responsive and connection-resilient, not fully offline-first | Full financial conflict resolution is expensive and risky without evidence | Measure actual connectivity |
| D-014 | Proposed | Build one purchase-to-payment vertical slice before all screens | Tests domain, accounting, permissions, and reporting end-to-end | Approve after discovery |
| D-015 | Proposed | Use formula versions and settlement snapshots | Old transactions must not change when rate-card logic changes | Confirm amendment policy |
| D-016 | Accepted | Support principal-trader and commission/other-party roles per deal | The business reports using both models; ownership, revenue, inventory, invoice, and profit treatment differ | Map exact role and postings using examples |
| D-017 | Open | Stock valuation: specific lot, FIFO, weighted average, or combination | Determines COGS and profit | Work examples required |
| D-018 | Open | Authoritative weights and shortage responsibility | Seller payable, buyer receivable, stock, and transporter liability may differ | Work examples required |
| D-019 | Open | Tax/APMC rules and documents | Depend on state, registration, turnover, commodity, packaging, and trade type | State + CA/APMC review required |
| D-020 | Open | Languages, devices, printing, and offline needs | Directly affects UX and infrastructure | Observe actual workplace |
| D-021 | Open | Roles, approvals, period closing, and backdating | Determines security and audit workflow | Identify real users |
| D-022 | Deferred | Direct e-NAM, GST, e-invoice, e-way-bill, and banking integrations | Integrate only after internal documents and statuses are stable | Separate future decision |
| D-023 | Deferred | Native mobile applications and microservices | No current evidence they are necessary | Revisit with usage/scale evidence |
| D-024 | Accepted | Cash is a payment mode, never an off-books mode | The product must preserve a complete, auditable business record and must not facilitate concealment | Define lawful migration/opening balance with CA |
| D-025 | Accepted | Support both warehoused and direct seller-to-buyer fulfilment | Both are used in the business and have different stock/ownership events | Map ownership transfer for each |
| D-026 | Proposed | Allow one residual commodity weight per multi-commodity vehicle | First real purchase calculates wheat as net vehicle weight minus rice weight | Confirm behavior for 3+ commodities and tolerance |
| D-027 | Accepted | Support both line-level and purchase-level adjustments | First real purchase has quality deductions per commodity and shared purchase deductions | Classify charge liability/cost treatment |
| D-028 | Open | Sai Traders and Guru Dev Traders entity relationship | Separate entities require isolated books, registrations, numbering, stock, and bank accounts | PAN/GSTIN/legal structure answer required |
| D-029 | Open | Uttar Pradesh mandi/APMC forms applicable in Bhadohi | UP e-Mandi exposes licence and Form 6/7/9/gate-pass workflows; exact applicability varies | Verify with local records/professional |
| D-030 | Open | Purpose and beneficiary of Kanta, sack, Hamali, and other deductions | A deduction from seller payable is not automatically the same as an expense or inventory-cost reduction | Owner/accountant answer required |

## Architecture checkpoints before D-011/D-012 are accepted

- Demonstrate an atomic settlement posting and reversal against PostgreSQL.
- Demonstrate Decimal serialization from form → server → database → report.
- Demonstrate one party ledger and outstanding query with realistic data volume.
- Demonstrate printable purchase/sale document generation.
- Decide whether background jobs can remain PostgreSQL-backed.
- Record the selected package versions and upgrade policy at scaffolding time.

## Decision-history rule

Do not delete a decision when it changes. Mark it `Superseded`, add the replacement decision ID, date, and reason. This file is part of the project’s memory.
