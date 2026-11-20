import { redirect } from "next/navigation";
import { PublicMoleculeDetail } from "@/app/ui/public-molecules";
import { getActiveSession } from "@/lib/authorization";

export default async function Page({ params }) {
  const session = await getActiveSession();
  if (!session) redirect("/login");
  const { codigo } = await params;
  return <PublicMoleculeDetail codigo={codigo} />;
}
