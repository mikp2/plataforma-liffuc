import { redirect } from "next/navigation";
import PanelDataPage from "@/app/ui/panel-data-page";
import { getActiveSession } from "@/lib/authorization";
import "@/app/ui/workspace.css";

export default async function Page() {
  const session = await getActiveSession();
  if (session?.user?.role !== "ADMIN") redirect("/panel/inicio");

  return <PanelDataPage view="aprobaciones" />;
}
