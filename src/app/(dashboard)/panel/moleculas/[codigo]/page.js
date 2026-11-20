import MoleculeDetailPage from "@/app/ui/molecule-detail-page";

export default async function Page({ params }) {
  const { codigo } = await params;
  return <MoleculeDetailPage codigo={codigo} />;
}
