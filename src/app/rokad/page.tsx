import type { Metadata } from "next";

import { getRokadDay } from "@/backend/application/rokad/get-rokad-day";
import { RokadPage } from "@/frontend/features/rokad/rokad-page";

export const metadata: Metadata = {
  title: "Daily Rokad",
};

export const dynamic = "force-dynamic";

type RokadRouteProps = Readonly<{
  searchParams: Promise<{ date?: string }>;
}>;

export default async function RokadRoute({ searchParams }: RokadRouteProps) {
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const requestedDate = (await searchParams).date;
  const businessDate =
    requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) && requestedDate <= today
      ? requestedDate
      : today;
  const { day, referenceData } = await getRokadDay(businessDate);

  return (
    <RokadPage
      day={day}
      maxBusinessDate={today}
      referenceData={referenceData}
    />
  );
}
