import { Dashboard } from "@/components/dashboard";
import { getDashboardData } from "@/services/dashboard-service";

export const revalidate = 3600;

export default async function Home() {
  const data = await getDashboardData();
  return <Dashboard data={data} />;
}
