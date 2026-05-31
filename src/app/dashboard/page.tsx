import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { fireData } from "@/lib/fire-data";

export default function DashboardPage() {
  return <DashboardShell data={fireData} />;
}
