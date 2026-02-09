import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders - Vispicy Purchase History",
  description: "View your order history and track your purchases on Vispicy. Manage your subscriptions and coin purchases.",
};

export default function OrdersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
