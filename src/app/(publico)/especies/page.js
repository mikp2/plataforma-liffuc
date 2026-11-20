import { redirect } from "next/navigation";
import { PublicMoleculeExplorer } from "@/app/ui/public-molecules";
import { getActiveSession } from "@/lib/authorization";

export default async function Page() {
  const session = await getActiveSession();
  if (!session) redirect("/login");
  return <PublicMoleculeExplorer view="species" />;
}
