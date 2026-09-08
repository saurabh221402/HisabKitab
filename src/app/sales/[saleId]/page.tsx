import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getSaleDetails } from "@/backend/application/sales/get-sale-details";
import { SaleDetailsPage } from "@/frontend/features/sales/sale-details-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sale record",
};

type SalePageProps = Readonly<{
  params: Promise<{ saleId: string }>;
}>;

export default async function SalePage({ params }: SalePageProps) {
  const { saleId } = await params;
  const sale = await getSaleDetails(saleId);

  if (!sale) notFound();
  return <SaleDetailsPage sale={sale} />;
}
