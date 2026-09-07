# HisabKitab — Application Architecture

Last updated: 7 September 2026

Status: Initial foundation; transactional domain and database schema remain gated by business-rule validation

## Architecture choice

HisabKitab is a modular monolith: one deployable Next.js application with strict internal responsibility boundaries and one Supabase-hosted PostgreSQL database.

This gives the project a single operational unit without mixing frontend, backend, domain, and infrastructure code.

## Source boundaries

```text
src/app
  Next.js pages, layouts, and HTTP route adapters only
        |
        +--> src/frontend
        |      presentation, interaction, formatting, accessibility
        |
        +--> src/backend
               application use cases, authorization, persistence adapters
                         |
                         +--> src/domain
                                pure business rules and exact calculations

src/shared
  small environment-neutral types or constants genuinely shared by both sides
```

### `src/app`

- Owns framework routing and request/response adaptation.
- Pages delegate presentation to `src/frontend`.
- Route Handlers delegate operations to `src/backend`.
- Must not contain financial formulas, persistence logic, or permission rules.

### `src/frontend`

- Owns accessible components, form interaction, tables, and view formatting.
- May consume explicit transport contracts.
- Must not import `src/backend`, database clients, secrets, or server-only modules.
- Client validation improves usability but is never the integrity boundary.

### `src/backend`

- Owns application use cases, authentication/authorization, transaction boundaries, persistence, integrations, and safe API results.
- Must not import frontend components.
- Database and Supabase access must remain server-only.
- Every protected operation authenticates and authorizes at the operation boundary.

### `src/domain`

- Owns business terminology, invariants, formula policies, exact calculations, and state transitions.
- Must not depend on Next.js, React, Prisma, Supabase, HTTP, or UI code.
- Unresolved money, stock, tax, or settlement behavior must not be invented here.

### `src/shared`

- Contains only genuinely environment-neutral code.
- Must not become a miscellaneous utility directory or a way to bypass boundaries.

## Data and security boundary

```text
Browser
  |
  | authenticated, validated request
  v
Next.js route/action adapter
  |
  v
Backend application service
  |
  | authorized business operation + database transaction
  v
Supabase-hosted PostgreSQL
```

The browser will not write directly to financial tables. Supabase credentials remain in ignored local environment files or the deployment platform’s secret store. Public project identifiers may be committed; passwords, database URLs containing credentials, and service-role keys may not.

## Dependency rules

1. Dependencies point inward toward domain policy, never outward from the domain to frameworks.
2. Use direct imports; do not create broad barrel files that hide module ownership.
3. Keep request/user state local to the request; never store it in mutable module globals.
4. Server Actions and Route Handlers are public security boundaries and must authenticate, authorize, and validate inputs.
5. Financial writes use idempotency plus PostgreSQL transactions and constraints.
6. Exact decimal values cross boundaries as explicit decimal strings, never JavaScript binary floating point.
7. Only server-confirmed records affect balances; local/offline records remain visibly labelled drafts.

## Current setup boundary

The foundation intentionally includes no transaction tables or provisional accounting schema. The next implementation slice starts only after the relevant purchase/payment rules and data model are accepted.

The production build currently uses Next.js's supported webpack path. Turbopack's CSS worker cannot bind its internal local port in the current Codex execution environment; this choice is a build-environment compatibility measure, not an application architecture dependency, and can be re-evaluated after the toolchain changes.
