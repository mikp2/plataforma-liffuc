import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PublicMoleculeExplorer } from "@/app/ui/public-molecules";
import { authOptions } from "@/lib/auth";

export default async function Page({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const search = await searchParams;
  return <PublicMoleculeExplorer initialSpecies={search?.especie || ""} />;
}
