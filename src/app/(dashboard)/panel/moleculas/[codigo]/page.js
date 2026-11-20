import MoleculeDetailPage from "@/app/ui/molecule-detail-page";
import { getActiveSession } from "@/lib/authorization";

export default async function Page({ params }) {
  const { codigo } = await params;
  const session = await getActiveSession();
  const canEdit = ["ADMIN", "INVESTIGADOR"].includes(session?.user?.role);
  return <MoleculeDetailPage codigo={codigo} canEdit={canEdit} />;
}
