"use server";

import { postSale } from "@/backend/application/sales/post-sale";
import type { PostSaleInput, PostSaleResult } from "@/shared/contracts/sales";

export async function postSaleAction(
  input: PostSaleInput,
): Promise<PostSaleResult> {
  return await postSale(input);
}
