import Link from "next/link";
import type { ReactNode } from "react";

import { logout } from "@/app/login/actions";
import {
  BookIcon,
  BuildingIcon,
  CashIcon,
  ChevronDownIcon,
  DashboardIcon,
  DatabaseIcon,
  ExitIcon,
  PlusIcon,
  PurchaseIcon,
  SaleIcon,
  UsersIcon,
} from "@/frontend/components/icons";

type AppSection = "dashboard" | "masters" | "parties" | "purchases" | "rokad" | "sales";

type AppShellProps = Readonly<{
  children: ReactNode;
  currentSection: AppSection;
}>;

const navigation = [
  { href: "/", icon: DashboardIcon, key: "dashboard", label: "Overview", mobile: true },
  { href: "/purchases/new", icon: PurchaseIcon, key: "purchases", label: "Purchases", mobile: true },
  { href: "/sales", icon: SaleIcon, key: "sales", label: "Sales", mobile: true },
  { href: "/rokad", icon: CashIcon, key: "rokad", label: "Daily Rokad", mobile: true },
  { href: "/parties", icon: UsersIcon, key: "parties", label: "Parties", mobile: true },
  { href: "/masters", icon: DatabaseIcon, key: "masters", label: "Masters", mobile: false },
] as const;

export function AppShell({ children, currentSection }: AppShellProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="border-line bg-ink text-surface-raised hidden min-h-screen border-r lg:flex lg:flex-col">
        <div className="border-surface-raised/10 flex h-20 items-center gap-3 border-b px-6">
          <span className="bg-brand grid size-10 place-items-center rounded-xl shadow-sm">
            <BookIcon className="size-5" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-[-0.025em]">HisabKitab</p>
            <p className="text-surface-raised/55 text-xs">हिसाब साफ़, व्यापार आसान</p>
          </div>
        </div>

        <nav aria-label="Primary navigation" className="flex-1 px-3 py-6">
          <p className="text-surface-raised/35 px-3 text-[0.65rem] font-semibold tracking-[0.16em] uppercase">
            Workspace
          </p>
          <ul className="mt-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.key;

              return (
                <li key={item.key}>
                  <Link
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-surface-raised text-ink"
                        : "text-surface-raised/65 hover:bg-surface-raised/8 hover:text-surface-raised"
                    }`}
                    href={item.href}
                  >
                    <Icon className={`size-[1.15rem] ${isActive ? "text-brand" : ""}`} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-surface-raised/10 border-t p-4">
          <div className="bg-surface-raised/6 flex items-center gap-3 rounded-xl p-3">
            <span className="bg-accent grid size-9 place-items-center rounded-full text-xs font-bold">
              SG
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">Main user</p>
              <p className="text-surface-raised/45 text-xs">Papa / Uncle</p>
            </div>
            <form action={logout}>
              <button
                aria-label="Sign out"
                className="text-surface-raised/45 hover:bg-surface-raised/10 hover:text-surface-raised grid size-9 place-items-center rounded-lg transition-colors"
                title="Sign out"
                type="submit"
              >
                <ExitIcon className="size-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="border-line bg-surface/92 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-4 backdrop-blur sm:px-6 lg:h-20 lg:px-8">
          <Link className="flex items-center gap-2.5 lg:hidden" href="/">
            <span className="bg-brand text-surface-raised grid size-9 place-items-center rounded-xl">
              <BookIcon className="size-[1.1rem]" />
            </span>
            <span className="text-ink font-semibold">HisabKitab</span>
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            <BuildingIcon className="text-ink-subtle size-4" />
            <span className="text-ink-muted text-sm">Viewing</span>
            <button className="text-ink flex items-center gap-1 text-sm font-semibold" type="button">
              Group Overview
              <ChevronDownIcon className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="border-line bg-surface-raised text-ink-muted hidden rounded-lg border px-3 py-2 text-xs sm:inline-flex">
              Secure · Synced
            </span>
            <form action={logout} className="lg:hidden">
              <button
                aria-label="Sign out"
                className="border-line bg-surface-raised text-ink-muted grid size-10 place-items-center rounded-xl border"
                title="Sign out"
                type="submit"
              >
                <ExitIcon className="size-4" />
              </button>
            </form>
            <Link
              className="bg-brand text-surface-raised hover:bg-brand-strong inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold shadow-sm transition-colors"
              href={currentSection === "purchases" ? "/sales" : "/purchases/new"}
            >
              <PlusIcon className="size-4" />
              <span className="hidden sm:inline">
                {currentSection === "purchases" ? "New Sale" : "New Purchase"}
              </span>
              <span className="sm:hidden">
                {currentSection === "purchases" ? "Sale" : "Purchase"}
              </span>
            </Link>
          </div>
        </header>

        <main className="px-4 py-6 pb-24 sm:px-6 lg:px-8 lg:py-8 lg:pb-10">{children}</main>

        <nav
          aria-label="Mobile navigation"
          className="border-line bg-surface/95 fixed right-0 bottom-0 left-0 z-40 border-t px-2 py-2 backdrop-blur lg:hidden"
        >
          <ul className="grid grid-cols-5">
            {navigation.filter((item) => item.mobile).map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.key;

              return (
                <li key={item.key}>
                  <Link
                    className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[0.65rem] font-medium ${
                      isActive ? "text-brand" : "text-ink-subtle"
                    }`}
                    href={item.href}
                  >
                    <Icon className="size-[1.15rem]" />
                    {item.label === "Daily Rokad" ? "Rokad" : item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
