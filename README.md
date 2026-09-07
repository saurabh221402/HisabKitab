# HisabKitab

HisabKitab is a planned business operating system for a family-run grain trading business in India. The business buys agricultural commodities from farmers and local traders, moves and settles those goods, and sells them to firms and mills.

The project is currently in **Phase 0: business discovery**. No application code has been selected or scaffolded yet. This is intentional: the calculation, settlement, inventory, and accounting rules must be understood before the database and UI are designed.

## Current working documents

- [Project context](docs/PROJECT_CONTEXT.md) — why the project exists, its journey, scope, principles, and current status.
- [Product and business discovery](docs/DISCOVERY.md) — market findings, proposed workflows, business-rule catalogue, risks, product scope, and technology recommendation.
- [Decision log](docs/DECISIONS.md) — accepted, proposed, and open decisions with their rationale.
- [Real transaction worksheet](docs/TRANSACTION_WORKSHEET.md) — information needed from actual paper transactions before implementation.
- [Purchase Example 001](docs/examples/PURCHASE_EXAMPLE_001.md) — the first reconciled real-world purchase calculation and its unresolved accounting rules.

## Current next step

Complete the transaction worksheet with one real purchase, one real sale, one payment/receipt, and at least one exceptional case. We will then convert the validated rules into a PRD, data model, accounting posting rules, API contracts, and an implementation plan.
