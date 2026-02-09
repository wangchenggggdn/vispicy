import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing - Vispicy AI Plans",
  description: "Explore Vispicy's flexible pricing options. Purchase coin packages or choose a subscription plan for unlimited access to AI image and video generation tools.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
