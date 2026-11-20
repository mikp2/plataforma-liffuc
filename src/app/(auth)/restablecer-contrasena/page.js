import PasswordResetPage from "@/app/ui/password-reset-page";
import "@/app/ui/workspace.css";

export const metadata = {
  referrer: "no-referrer",
  robots: { index: false, follow: false },
};

export default async function Page({ searchParams }) {
  const search = await searchParams;
  return <PasswordResetPage token={typeof search?.token === "string" ? search.token : ""} />;
}
