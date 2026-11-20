import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/authorization";

export default async function Page({ params }) {
  const session = await getActiveSession();
  if (!["ADMIN", "INVESTIGADOR"].includes(session?.user?.role)) redirect("/panel/moleculas");

  const { codigo } = await params;
  const editorUrl = `/inicio/editar-molecula.html?codigo=${encodeURIComponent(codigo)}`;

  return (
    <iframe
      title="Editar molécula"
      src={editorUrl}
      style={{ border: 0, display: "block", width: "100%", height: "100vh" }}
    />
  );
}
