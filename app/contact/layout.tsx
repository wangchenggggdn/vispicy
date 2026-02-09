import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Vispicy - Support & Help",
  description: "Contact the Vispicy team for support, sales inquiries, partnerships, or feedback. We're here to help you make the most of our AI creative tools.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
