import type { Metadata } from "next";

import { getPurchaseReferenceData } from "@/backend/application/purchases/get-purchase-reference-data";
import { PurchaseEntryPage } from "@/frontend/features/purchases/purchase-entry-page";

export const metadata: Metadata = {
  title: "New Purchase",
};

export const dynamic = "force-dynamic";

export default async function NewPurchasePage() {
  const referenceData = await getPurchaseReferenceData();
  const defaultBusinessDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  return (
    <PurchaseEntryPage
      defaultBusinessDate={defaultBusinessDate}
      referenceData={referenceData}
    />
  );
}
