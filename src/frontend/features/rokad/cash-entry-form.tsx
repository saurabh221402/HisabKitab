"use client";

import { useRef, useState, useTransition } from "react";

import { createCashEntry } from "@/app/rokad/actions";
import type {
  CashEntryMutationState,
  RokadReferenceData,
} from "@/shared/contracts/rokad";

const initialState: CashEntryMutationState = { error: null, success: null };
const inputClassName =
  "border-line bg-surface-raised text-ink placeholder:text-ink-subtle/65 focus:border-brand min-h-11 w-full rounded-xl border px-3.5 text-sm outline-none transition-colors";
const labelClassName = "text-ink-muted mb-1.5 block text-xs font-semibold";

export function CashEntryForm({
  businessDate,
  referenceData,
}: Readonly<{
  businessDate: string;
  referenceData: RokadReferenceData;
}>) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, setState] = useState<CashEntryMutationState>(initialState);
  const [isPending, startTransition] = useTransition();
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        startTransition(async () => {
          const result = await createCashEntry(initialState, formData);
          setState(result);

          if (result.success) {
            formRef.current?.reset();
            setRequestId(crypto.randomUUID());
          }
        });
      }}
      ref={formRef}
    >
      <input name="businessDate" type="hidden" value={businessDate} />
      <input name="requestId" type="hidden" value={requestId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className={labelClassName}>DB / CR *</span>
          <select className={inputClassName} defaultValue="out" name="direction">
            <option value="out">DB · Cash Out / दिया</option>
            <option value="in">CR · Cash In / मिला</option>
          </select>
        </label>
        <label>
          <span className={labelClassName}>Amount *</span>
          <input
            className={`${inputClassName} text-right tabular-nums`}
            inputMode="decimal"
            min="0.01"
            name="amount"
            placeholder="₹ amount"
            required
            step="0.01"
            type="number"
          />
        </label>
        <label>
          <span className={labelClassName}>Business firm *</span>
          <select className={inputClassName} name="firmId" required>
            {referenceData.firms.map((firm) => (
              <option key={firm.id} value={firm.id}>{firm.name}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={labelClassName}>Registered party</span>
          <select className={inputClassName} defaultValue="" name="partyId">
            <option value="">Select if registered</option>
            {referenceData.parties.map((party) => (
              <option key={party.id} value={party.id}>{party.name}</option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className={labelClassName}>Person name</span>
          <input
            className={inputClassName}
            name="personName"
            placeholder="Required only when party is not registered"
          />
        </label>
        <label className="sm:col-span-2">
          <span className={labelClassName}>Remark / कारण *</span>
          <textarea
            className={`${inputClassName} min-h-20 resize-y py-3`}
            name="remark"
            placeholder="Why did cash come in or go out?"
            required
          />
        </label>
      </div>

      {state.error ? (
        <p className="bg-danger-soft text-danger rounded-xl px-3 py-2.5 text-xs" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p className="bg-brand-soft text-brand-strong rounded-xl px-3 py-2.5 text-xs" role="status">
          ✓ {state.success}
        </p>
      ) : null}

      <button
        className="bg-brand text-surface-raised min-h-11 w-full rounded-xl text-sm font-semibold disabled:opacity-45"
        disabled={isPending || referenceData.firms.length === 0}
        type="submit"
      >
        {isPending ? "Recording…" : "Record cash movement"}
      </button>
      <p className="text-ink-subtle text-center text-[0.68rem] leading-4">
        Purchase payments and sale receipts appear automatically—do not enter them again.
      </p>
    </form>
  );
}
