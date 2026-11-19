import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <iframe
      title="Catálogo de moléculas"
      src="/inicio/moleculas.html"
      style={{ border: 0, display: "block", width: "100%", height: "100vh" }}
    />
  );
}
