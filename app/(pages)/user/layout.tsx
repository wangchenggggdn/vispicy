import { Metadata } from "next";

export const metadata: Metadata = {
  title: "User Profile - Vispicy Account",
  description: "Manage your Vispicy account settings, view your balance, and customize your creative experience.",
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
