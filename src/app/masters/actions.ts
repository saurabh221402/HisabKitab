"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";
import type { MasterMutationState } from "@/shared/contracts/master-data";

const partyRole = z.enum(["seller", "buyer", "broker", "transporter"]);

export async function createParty(
  _previousState: MasterMutationState,
  formData: FormData,
): Promise<MasterMutationState> {
  const parsedInput = z
    .object({
      address: z.string().trim().max(500),
      gstin: z.string().trim().max(20),
      mobile: z.string().trim().max(20),
      name: z.string().trim().min(2).max(150),
      roles: z.array(partyRole).min(1),
    })
    .safeParse({
      address: formData.get("address") ?? "",
      gstin: formData.get("gstin") ?? "",
      mobile: formData.get("mobile") ?? "",
      name: formData.get("name"),
      roles: formData.getAll("roles"),
    });

  if (!parsedInput.success) {
    return { error: "Enter a party name and select at least one role.", success: null };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("create_party", {
    idempotency_key: crypto.randomUUID(),
    payload: parsedInput.data,
  });

  if (error) {
    return { error: "Party could not be registered. Check the details and try again.", success: null };
  }

  revalidatePath("/masters");
  revalidatePath("/purchases/new");
  return { error: null, success: `${parsedInput.data.name} registered.` };
}

export async function createCommodity(
  _previousState: MasterMutationState,
  formData: FormData,
): Promise<MasterMutationState> {
  const parsedInput = z
    .object({
      localName: z.string().trim().max(100),
      name: z.string().trim().min(2).max(100),
    })
    .safeParse({
      localName: formData.get("localName") ?? "",
      name: formData.get("name"),
    });

  if (!parsedInput.success) {
    return { error: "Enter a valid commodity name.", success: null };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("commodities").insert({
    local_name: parsedInput.data.localName || null,
    name: parsedInput.data.name,
  });

  if (error) {
    return { error: "Commodity already exists or could not be added.", success: null };
  }

  revalidatePath("/masters");
  revalidatePath("/purchases/new");
  return { error: null, success: `${parsedInput.data.name} added.` };
}
