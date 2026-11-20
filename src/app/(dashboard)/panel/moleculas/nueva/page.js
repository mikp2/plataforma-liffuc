import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/authorization";

export default async function Page() {
  const session = await getActiveSession();
  if (!["ADMIN", "INVESTIGADOR"].includes(session?.user?.role)) redirect("/panel/moleculas");

  return (
    <iframe
      title="Registrar molécula"
      src="/inicio/editar-molecula.html?new=1"
      style={{ border: 0, display: "block", width: "100%", height: "100vh" }}
    />
  );
}
