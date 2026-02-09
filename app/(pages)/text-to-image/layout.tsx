import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to Image - Vispicy AI Generator",
  description: "Generate stunning images from text descriptions using advanced AI models. Create unique artwork, designs, and visuals in seconds with Vispicy's text-to-image generator.",
};

export default function TextToImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
