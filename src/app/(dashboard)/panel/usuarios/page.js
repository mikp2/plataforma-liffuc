import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import UsersPage from "@/app/ui/users-page";
import { authOptions } from "@/lib/auth";
import "@/app/ui/workspace.css";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") redirect("/panel/inicio");

  return <UsersPage />;
}
