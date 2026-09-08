"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { readRuntimeEnvironment } from "@/backend/config/runtime-environment";
import { createSupabaseServerClient } from "@/backend/infrastructure/supabase/server-client";

export type LoginState = Readonly<{
  error: string | null;
}>;

const loginSchema = z.object({
  password: z.string().min(1).max(200),
  username: z
    .string()
    .trim()
    .min(2)
    .max(40)
    .regex(/^[a-zA-Z0-9._-]+$/),
});

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!readRuntimeEnvironment().supabaseConfigured) {
    return { error: "Secure database connection is not configured yet." };
  }

  const parsedInput = loginSchema.safeParse({
    password: formData.get("password"),
    username: formData.get("username"),
  });

  if (!parsedInput.success) {
    return { error: "Enter a valid username and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: `${parsedInput.data.username.toLowerCase()}@hisabkitab.local`,
    password: parsedInput.data.password,
  });

  if (error) {
    return { error: "Login failed. Check your username and password." };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
