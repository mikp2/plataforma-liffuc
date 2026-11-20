import { redirect } from "next/navigation";
import { getActiveSession } from "@/lib/authorization";

export default async function DashboardLayout({ children }) {
  const session = await getActiveSession();

  if (!session) {
    redirect("/login");
  }

  return <div>{children}</div>;
}
