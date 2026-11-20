import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import ProfilePage from "@/app/ui/profile-page";
import { authOptions } from "@/lib/auth";
import "@/app/ui/workspace.css";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <ProfilePage user={session.user} />;
}
