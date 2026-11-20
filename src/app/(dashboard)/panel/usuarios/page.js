import { redirect } from "next/navigation";
import UsersPage from "@/app/ui/users-page";
import { getActiveSession } from "@/lib/authorization";
import "@/app/ui/workspace.css";

export default async function Page() {
  const session = await getActiveSession();
  if (session?.user?.role !== "ADMIN") redirect("/panel/inicio");

  return <UsersPage />;
}
