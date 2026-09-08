import { getMasterData } from "@/backend/application/masters/get-master-data";
import { MasterDataPage } from "@/frontend/features/masters/master-data-page";

export const dynamic = "force-dynamic";

export default async function MastersPage() {
  const data = await getMasterData();
  return <MasterDataPage data={data} />;
}
