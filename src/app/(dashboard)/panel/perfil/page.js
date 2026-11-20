import { redirect } from "next/navigation";
import ProfilePage from "@/app/ui/profile-page";
import { getActiveSession } from "@/lib/authorization";
import "@/app/ui/workspace.css";

export default async function Page() {
  const session = await getActiveSession();
  if (!session) redirect("/login");

  return <ProfilePage user={session.user} />;
}
