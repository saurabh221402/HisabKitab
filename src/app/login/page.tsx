import type { Metadata } from "next";

import { BookIcon } from "@/frontend/components/icons";
import { LoginForm } from "@/frontend/features/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <main className="app-hero-surface grid min-h-screen place-items-center px-4 py-10">
      <section className="border-line bg-surface-raised rounded-card w-full max-w-md border p-6 shadow-feature sm:p-8">
        <div className="bg-brand text-surface-raised grid size-12 place-items-center rounded-2xl">
          <BookIcon className="size-6" />
        </div>
        <p className="text-brand mt-6 text-xs font-semibold tracking-[0.14em] uppercase">HisabKitab</p>
        <h1 className="text-ink mt-2 text-3xl font-semibold tracking-[-0.035em]">Welcome back</h1>
        <p className="text-ink-muted mt-2 text-sm leading-6">
          Authorized users ke liye secure business access.
        </p>
        <LoginForm />
        <p className="text-ink-subtle mt-5 text-center text-xs">
          Accounts are created only by the Main user.
        </p>
      </section>
    </main>
  );
}
