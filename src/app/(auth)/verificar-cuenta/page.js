import VerifyVisitorAccountPage from "@/app/ui/verify-visitor-account-page";
import "@/app/ui/workspace.css";

export const metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
  const search = await searchParams;
  return <VerifyVisitorAccountPage token={typeof search?.token === "string" ? search.token : ""} />;
}
