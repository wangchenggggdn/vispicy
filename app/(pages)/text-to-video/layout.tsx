import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to Video - Vispicy AI Generator",
  description: "Create stunning videos from text descriptions. Transform your ideas into dynamic video content with Vispicy's advanced AI video generation technology.",
};

export default function TextToVideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
