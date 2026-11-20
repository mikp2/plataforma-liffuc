import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { PublicMoleculeDetail } from "@/app/ui/public-molecules";
import { authOptions } from "@/lib/auth";

export default async function Page({ params }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const { codigo } = await params;
  return <PublicMoleculeDetail codigo={codigo} />;
}
