import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coins - Vispicy Credits",
  description: "Purchase coins to generate more AI content. Choose from various coin packages and subscriptions for your creative projects on Vispicy.",
};

export default function CoinsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
