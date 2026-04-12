import { KeepingPrrDashboard } from "@/components/keeping-prr/keeping-prr-dashboard";
import { getKeepingPrrData } from "@/services/keeping-prr-service";

export const revalidate = 600;

export default async function KeepingPrrPage() {
  const data = await getKeepingPrrData();
  return <KeepingPrrDashboard data={data} />;
}
