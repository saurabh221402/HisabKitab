import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPurchaseDetails } from "@/backend/application/purchases/get-purchase-details";
import { PurchaseDetailsPage } from "@/frontend/features/purchases/purchase-details-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Purchase record",
};

type PurchasePageProps = Readonly<{
  params: Promise<{ purchaseId: string }>;
}>;

export default async function PurchasePage({ params }: PurchasePageProps) {
  const { purchaseId } = await params;
  const purchase = await getPurchaseDetails(purchaseId);

  if (!purchase) notFound();
  return <PurchaseDetailsPage purchase={purchase} />;
}
