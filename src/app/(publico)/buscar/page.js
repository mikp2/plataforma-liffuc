import { redirect } from "next/navigation";
import { PublicMoleculeExplorer } from "@/app/ui/public-molecules";
import { getActiveSession } from "@/lib/authorization";

export default async function Page({ searchParams }) {
  const session = await getActiveSession();
  if (!session) redirect("/login");
  const search = await searchParams;
  return <PublicMoleculeExplorer initialSpecies={search?.especie || ""} />;
}
