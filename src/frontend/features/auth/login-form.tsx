"use client";

import { useActionState } from "react";

import { login, type LoginState } from "@/app/login/actions";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-7 space-y-4">
      <label className="block">
        <span className="text-ink-muted mb-1.5 block text-xs font-semibold">Username</span>
        <input
          autoComplete="username"
          className="border-line bg-surface-raised text-ink focus:border-brand min-h-12 w-full rounded-xl border px-4 text-sm outline-none"
          name="username"
          placeholder="username"
          required
          type="text"
        />
      </label>
      <label className="block">
        <span className="text-ink-muted mb-1.5 block text-xs font-semibold">Password</span>
        <input
          autoComplete="current-password"
          className="border-line bg-surface-raised text-ink focus:border-brand min-h-12 w-full rounded-xl border px-4 text-sm outline-none"
          minLength={12}
          name="password"
          required
          type="password"
        />
      </label>
      {state.error ? (
        <p className="bg-danger-soft text-danger rounded-xl px-3 py-2.5 text-xs" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        className="bg-brand text-surface-raised hover:bg-brand-strong min-h-12 w-full rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing in…" : "Sign in securely"}
      </button>
    </form>
  );
}
