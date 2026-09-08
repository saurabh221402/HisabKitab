import { getDashboardOverview } from "@/backend/application/dashboard/get-dashboard-overview";
import { DashboardPage } from "@/frontend/features/dashboard/dashboard-page";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const businessDate = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const overview = await getDashboardOverview(businessDate);

  return <DashboardPage overview={overview} />;
}
