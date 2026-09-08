"use client";

import { useActionState } from "react";

import { createCommodity, createParty } from "@/app/masters/actions";
import { PlusIcon } from "@/frontend/components/icons";
import type { MasterMutationState } from "@/shared/contracts/master-data";

const initialState: MasterMutationState = { error: null, success: null };
const inputClassName =
  "border-line bg-surface-raised text-ink placeholder:text-ink-subtle/65 focus:border-brand min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors";
const labelClassName = "text-ink-muted mb-1.5 block text-xs font-semibold";

function ActionMessage({ state }: Readonly<{ state: MasterMutationState }>) {
  if (!state.error && !state.success) return null;

  return (
    <p
      className={`rounded-xl px-3 py-2.5 text-xs ${
        state.error ? "bg-danger-soft text-danger" : "bg-brand-soft text-brand-strong"
      }`}
      role={state.error ? "alert" : "status"}
    >
      {state.error ?? state.success}
    </p>
  );
}

export function PartyRegistrationForm() {
  const [state, formAction, isPending] = useActionState(createParty, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className={labelClassName}>Party name *</span>
        <input className={inputClassName} name="name" placeholder="e.g. Sharma Traders" required />
      </label>
      <fieldset>
        <legend className={labelClassName}>Works as *</legend>
        <div className="grid grid-cols-2 gap-2">
          {["seller", "buyer", "broker", "transporter"].map((role) => (
            <label
              className="border-line text-ink-muted has-checked:border-brand has-checked:bg-brand-soft has-checked:text-brand-strong flex min-h-10 items-center gap-2 rounded-xl border px-3 text-xs font-semibold capitalize"
              key={role}
            >
              <input className="accent-brand" name="roles" type="checkbox" value={role} />
              {role}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <label>
          <span className={labelClassName}>Mobile</span>
          <input className={inputClassName} inputMode="tel" name="mobile" />
        </label>
        <label>
          <span className={labelClassName}>GSTIN (optional)</span>
          <input className={`${inputClassName} uppercase`} name="gstin" />
        </label>
      </div>
      <label className="block">
        <span className={labelClassName}>Address / place</span>
        <input className={inputClassName} name="address" placeholder="Village, district or city" />
      </label>
      <ActionMessage state={state} />
      <button
        className="bg-brand text-surface-raised flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        <PlusIcon className="size-4" />
        {isPending ? "Registering…" : "Register party"}
      </button>
    </form>
  );
}

export function CommodityRegistrationForm() {
  const [state, formAction, isPending] = useActionState(createCommodity, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block">
        <span className={labelClassName}>Commodity name *</span>
        <input className={inputClassName} name="name" placeholder="e.g. Maize" required />
      </label>
      <label className="block">
        <span className={labelClassName}>Local name</span>
        <input className={inputClassName} name="localName" placeholder="e.g. मक्का" />
      </label>
      <ActionMessage state={state} />
      <button
        className="border-brand/25 bg-brand-soft text-brand-strong flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border text-sm font-semibold disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        <PlusIcon className="size-4" />
        {isPending ? "Adding…" : "Add commodity"}
      </button>
    </form>
  );
}
