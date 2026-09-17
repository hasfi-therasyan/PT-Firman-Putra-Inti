import type { Metadata } from "next";
import { getDashboardData } from "./actions";
import { DashboardCharts } from "./dashboard-charts";

export const metadata: Metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Monitoring</h1>
      <DashboardCharts initialData={data} />
    </div>
  );
}
