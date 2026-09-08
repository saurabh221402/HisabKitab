"use server";

import { postPurchase } from "@/backend/application/purchases/post-purchase";
import type {
  PostPurchaseInput,
  PostPurchaseResult,
} from "@/shared/contracts/purchases";

export async function postPurchaseAction(
  input: PostPurchaseInput,
): Promise<PostPurchaseResult> {
  return await postPurchase(input);
}
