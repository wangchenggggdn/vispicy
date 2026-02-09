import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Subscription - Vispicy Pricing Plans",
  description: "Choose the perfect subscription plan for your creative needs. Get exclusive discounts and unlimited access to Vispicy's AI generation tools.",
};

export default function SubscriptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
