# HisabKitab — Decision Log

Last updated: 8 September 2026

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
| D-002 | Accepted | PostgreSQL is the database direction | The domain needs transactions, constraints, joins, allocations, exact decimals, and reports | Initial provider selected in D-051 |
| D-003 | Accepted | Ledgers and daily books are generated from source events | Prevents duplicate entry and unexplained balances | Posting matrix must reconcile with paper |
| D-004 | Accepted | No floating-point arithmetic for money, rates, weights, or quantities | Phase 1 inputs use whole kg for weight and whole rupees for rate; derived financial rounding remains deterministic and explicit | Validate one example that produces paise |
| D-005 | Accepted | Posted records are reversed/amended, not hard-deleted | Preserves auditability and legal/business history | Define roles and closed-period flow |
| D-006 | Accepted | V1 excludes AI, OCR, predictive analytics, and WhatsApp automation | Core operational correctness has higher value | Revisit after stable adoption |
| D-007 | Proposed | Model deal, load/lot, weighment, settlement, invoice, payment, and journal separately | These events can occur at different times and in many-to-many patterns | Validate against real paper flow |
| D-008 | Accepted | Use a unified Party with multiple roles and optional GSTIN | One party can buy, sell, broker, or transport; GSTIN absence must not block ordinary party creation | Validate only compliance-required fields with CA |
| D-009 | Accepted | Use whole kg as canonical Phase 1 mass input while retaining original units; never infer weight from bag count | Bags have variable weights such as 50 kg, 60 kg, or 78 kg; the owner selected kg-level input precision | Confirm derived-money rounding |
| D-010 | Proposed | Hide double-entry mechanics behind business actions | Users understand “pay” and “receive”; balanced postings protect correctness | Review journal examples with accountant |
| D-011 | Accepted | Build a modular monolith with Next.js and PostgreSQL | The owner selected the stack and explicitly required frontend/backend separation; one deployable app keeps V1 operations simple while enforced module boundaries preserve separation of concerns | Reassess only if measured clients/team/scale demand it |
| D-012 | Superseded | Use Prisma for mainstream typed CRUD and explicit SQL for complex reports | The first implementation proved that Supabase's typed Data API plus small explicit SQL functions cover the current slice with less operational weight | Replaced by D-064 |
| D-013 | Proposed | Start responsive and connection-resilient, not fully offline-first | Full financial conflict resolution is expensive and risky without evidence | Measure actual connectivity |
| D-014 | Accepted | Build one purchase-to-payment vertical slice before all screens | Tests domain, accounting, permissions, and reporting end-to-end; implementation began after the owner authorized best-effort decisions | Validate with the primary users after the first real posting |
| D-015 | Proposed | Use formula versions and settlement snapshots | Old transactions must not change when rate-card logic changes | Confirm amendment policy |
| D-016 | Superseded | Support principal-trader and commission/other-party roles per deal | Later clarification established principal trading as the V1 flow | Replaced by D-046 |
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
| D-028 | Accepted | Sai Traders and Guru Dev Traders are separate GST-registered business firms | Transactions, documents, money accounts, and reports must be firm-scoped; future firms are addable | Confirm PAN/bank/inter-firm details |
| D-029 | Open | Uttar Pradesh mandi/APMC forms applicable in Bhadohi | UP e-Mandi exposes licence and Form 6/7/9/gate-pass workflows; exact applicability varies | Verify with local records/professional |
| D-030 | Accepted | Combine Kanta, sack, Hamali, and other purchase-level amounts into one seller-borne purchase deduction in Phase 1 | It reduces supplier payable and creates no separate third-party liability; the original breakdown may remain only in the remark/source paper | Revisit only if separate liabilities are actually paid |
| D-031 | Accepted | Adopt gradually through paper-plus-digital parallel operation | Current operators should not abandon a trusted workflow abruptly; the product must earn trust through reconciliation | Define promotion period and sign-off |
| D-032 | Accepted | Treat continuity and control as primary product outcomes | More than ₹50 crore revenue, roughly ₹50 lakh daily money movement, and roughly 100 tonnes daily are concentrated in two operators | Identify backup operator and access plan |
| D-033 | Proposed | Add a formal daily close and reconciliation workflow | High-value daily movement requires explained cash/bank, stock, party, and paper-vs-digital differences | Reproduce the current end-of-day check |
| D-034 | Accepted | Include a traceable operational dashboard after source modules reconcile | Fingertip visibility is a core reason for the product, but metrics cannot precede trustworthy data | Select first five metrics and definitions |
| D-035 | Open | Define parallel-run exit criteria | Digital-first adoption needs evidence rather than a calendar promise | Choose duration, tolerance, and approvers |
| D-036 | Open | Measure transaction counts and peak entry load | Tonnage and rupee value describe risk, not UI/database operation counts | Observe at least one normal and peak day |
| D-037 | Open | Define business-continuity ownership | Two-person concentration is a material operational risk | Name backup users, emergency procedure, and export custody |
| D-038 | Accepted | Keep V1 focused on buy-from and sell-to workflows | Owner explicitly requested simplicity over comprehensive ERP behavior | Use `MVP_SCOPE.md` as boundary |
| D-039 | Accepted | Defer warehouse/location tracking | Five locations exist but the owner does not need structured location records now | Allow remarks; revisit with stock need |
| D-040 | Accepted | Use DB/Cash Out and CR/Cash In in the simple cash book | Matches the business's familiar convention while retaining understandable labels | Validate opening/closing cash example |
| D-041 | Accepted | Two primary family operators are the initial direct users | UX must optimize for their terminology, speed, mixed language, and responsive devices | Observe device and entry behavior |
| D-042 | Accepted | Support unreliable internet with local drafts and explicit sync state | Work must not be lost, but offline records cannot silently alter official balances | Prototype and test reconnection behavior |
| D-043 | Accepted | Defer printer integrations and dashboard charts | Tables, KPIs, and attachments provide the first useful value | Revisit after pilot |
| D-044 | Accepted | Require a business firm before final posting | `Unassigned` can preserve an incomplete draft but cannot serve as an off-books entity | Define review/assignment responsibility |
| D-045 | Proposed | Use one simple form per purchase/sale while storing structured child records | Keeps operator UX simple without sacrificing calculations, ledger generation, or future extension | Validate form with the primary users |
| D-046 | Accepted | Model principal trading in V1; defer full commission-agent accounting | The confirmed flow is seller/farmer → business → buyer/mill, with broker as mediator | Revisit only with a real non-ownership transaction |
| D-047 | Accepted | Support only legitimate, separately accounted business firms | Multi-firm records must remain firm-scoped and professionally reviewed; no dummy or off-books firm is permitted | Validate tax and inter-firm rules with CA |
| D-048 | Accepted | Sale brokerage is a business-paid cost calculated per actual quintal | It creates a broker payable/expense and does not reduce buyer receivable | Capture the example rate and payment timing |
| D-049 | Accepted | Sale transport is a business-borne cost calculated as rate × actual weight in quintal | It creates a separate transporter cost/payable and does not reduce buyer receivable | Capture the example rate and payment timing |
| D-050 | Accepted | A reasoned buyer-facing sale deduction reduces receivable | Moisture, quality, or another explicit reason explains why ₹9,00,000 less ₹3,000 produces ₹8,97,000 receivable | Validate allowed reasons with real entries |
| D-051 | Accepted | Use Supabase-hosted PostgreSQL as the initial remote database | The owner created a healthy HisabKitab project in Mumbai; Supabase provides full PostgreSQL and avoids operating a database server during V1 | Review plan/backups before production use |
| D-052 | Accepted | Keep Supabase usage PostgreSQL-portable | Version schema in repository migrations, use standard PostgreSQL types, keep financial rules in application modules, and avoid direct browser writes to financial tables | Prove dump/restore and provider migration before production |
| D-053 | Proposed | Use Supabase Storage behind an application storage interface | Convenient for Kanta parchi attachments while allowing a later S3-compatible replacement | Validate limits, access policy, backup/export, and cost |
| D-054 | Accepted | Begin a technical foundation while keeping transaction implementation gated | The owner explicitly advanced setup; routing, UI shell, boundaries, tests, and CI can be established without inventing unresolved financial rules | Business examples still gate schema and posting code |
| D-055 | Accepted | Use pnpm, strict TypeScript, ESLint boundary rules, Vitest, and CI for the initial codebase | Reproducible dependencies and automated architecture/quality checks reduce risk before financial modules are added | Review versions during planned upgrades |
| D-056 | Accepted | Phase 1 product scope is the operational core: modern dashboard, reusable masters, purchase, sale, party outstanding, daily Rokad, KPIs, and filterable analytics tables | The owner explicitly identified these as the base requirements; the scope digitizes the highest-value daily work without becoming a full ERP | Validate the detailed PRD and remaining example/configuration values with the primary users |
| D-057 | Accepted | Manage typography, color, theme, spacing scale, surfaces, focus treatment, radii, and shadows through a global semantic design-token layer | The owner requires visual consistency and maintainability; features should consume the design system instead of owning duplicated theme values | Validate the visual system with the first dashboard and entry form |
| D-058 | Accepted | Remove the generic sale-expense field from Phase 1 | Brokerage, business-borne transport, and buyer deductions are explicit; an unexplained generic expense would make receivable and cost reporting ambiguous | Add a new explicit cost type only from a validated example |
| D-059 | Accepted | Allow a sale receipt to be split between cash and one or more bank accounts of the selling firm | Real settlement may use both cash and firm bank accounts; each portion must create one linked movement | Capture the exact split in Sale Example 001 |
| D-060 | Accepted | Both primary users may operate both firms; Main role protects reversal, backdating, opening balances, and reopening | The business is operated together, while source records must still preserve their Sai Traders or Guru Dev Traders legal ownership | Both initial accounts may be Main; review with pilot |
| D-061 | Accepted | Show one Group Overview total for shared operational cash plus recorded Sai Traders and Guru Dev Traders bank balances | The owner wants a single liquidity view; underlying bank accounts, movements, and transactions remain firm-labelled and legally separate | Define opening balances and reconciliation frequency |
| D-062 | Deferred | On-account advance allocation | The owner asked to leave this complexity for later; Phase 1 settlement portions link directly to a purchase or sale | Revisit with a real advance example |
| D-063 | Accepted | Default mobile dashboard shows Net Purchase Value, Gross Sale Value, Seller Outstanding, Buyer Outstanding, and Total Available Funds | These five cover activity, exposure, and liquidity; detail views retain weights, paid/received, and cash flow | Validate ordering and labels with the primary users |
| D-064 | Accepted | Use Supabase's cookie-based SSR client and Data API for Phase 1 instead of adding an ORM | It preserves RLS end to end, keeps the browser away from financial writes, and avoids an unnecessary persistence abstraction while the schema is small | Reassess only if query complexity or team scale creates measured friction |
| D-065 | Accepted | Calculate purchase values with integer kilograms, whole-rupee rates, and integer paise in TypeScript; persist exact `numeric(18,2)` snapshots | `kg × ₹/Qt` converts exactly to paise without floating-point or rounding; the canonical example and a paise edge case are automated tests | Define an explicit rounding policy before accepting fractional rates or weights |
| D-066 | Accepted | The last commodity row is the only residual row; the database supports up to ten lines and requires their total to equal Kanta net weight | This keeps the two-commodity entry fast while safely accommodating later multi-commodity loads | Validate the interaction with a three-commodity paper example |
| D-067 | Accepted | Financial posting uses authenticated server actions, an idempotency key, RLS, constraints, and one PostgreSQL transaction | Repeat clicks cannot create a second purchase; partial headers, lines, payments, or audit events cannot be committed | Prove with authenticated integration tests and a real operator posting |
| D-068 | Accepted | Use the same exact integer-paise policy for sales; one Phase 1 sale contains one commodity, one reasoned buyer deduction, optional broker/transport rates, and up to five linked receipt portions | Implements the validated sale without inventing multi-commodity or generic-expense behavior | Validate exact broker/transport rates and receipt split with a real sale |
| D-069 | Accepted | Daily Rokad is derived from source-linked cash purchase payments, cash sale receipts, and explicit manual movements | Prevents duplicate cash entry and keeps DB/Cash Out and CR/Cash In traceable to their source | Enter verified opening cash and reconcile one day |
| D-070 | Accepted | Keep one immutable, Main-authorized operational cash opening; later corrections are explicit movements rather than silent opening edits | A stable anchor makes every daily opening and closing explainable | Confirm amount, date, and responsible Main user |
| D-071 | Accepted | Dashboard and party-position totals are security-invoker PostgreSQL read models over posted records | Provides fast, explainable KPIs without creating competing ledger data | Validate totals against paper after first postings |
| D-072 | Accepted | Treat sale brokerage and transport as outstanding business costs until later linked payments are explicitly modelled | The sale example establishes the payable amounts but not their payment timing | Supply real broker/transporter payment examples before settlement UI |
| D-073 | Accepted | Keep Supabase authentication invite/admin-only and disable public self-registration | Phase 1 has two known individual users; public signup would allow unauthorized accounts to reach the profile/access provisioning path | Add future users only through a Main-controlled workflow |
| D-074 | Accepted | Autosave changed purchase and sale drafts on the current device and restore them after reload without affecting official totals | Office internet is unreliable and unfinished entry must survive interruption; only explicit server posting affects reports | Validate behavior on the actual office phones and computers |
| D-075 | Accepted | Start new financial entries blank with today's business date; load canonical examples only through an explicit action | Prefilled financial values could be mistaken for real data and posted after a party is selected | Keep example loading available during paper reconciliation, but visibly separate from normal entry |
| D-076 | Accepted | Use neutral user labels in product copy; show Mohan for the primary profile and User for the second profile | Family-relation labels look informal in a business application and do not describe access or responsibility | Review labels during the operator pilot |

## Data-layer checkpoints before D-012 is accepted

- Demonstrate an atomic settlement posting and reversal against PostgreSQL.
- Demonstrate Decimal serialization from form → server → database → report.
- Demonstrate one party ledger and outstanding query with realistic data volume.
- Demonstrate printable purchase/sale document generation.
- Decide whether background jobs can remain PostgreSQL-backed.
- Record the selected package versions and upgrade policy at scaffolding time.

## Decision-history rule

Do not delete a decision when it changes. Mark it `Superseded`, add the replacement decision ID, date, and reason. This file is part of the project’s memory.
