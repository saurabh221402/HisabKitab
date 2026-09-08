import type { Metadata } from "next";

import { getSaleReferenceData } from "@/backend/application/sales/get-sale-reference-data";
import { SaleEntryPage } from "@/frontend/features/sales/sale-entry-page";

export const metadata: Metadata = {
  title: "New Sale",
};

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const referenceData = await getSaleReferenceData();
  const defaultBusinessDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });

  return (
    <SaleEntryPage
      defaultBusinessDate={defaultBusinessDate}
      referenceData={referenceData}
    />
  );
}
