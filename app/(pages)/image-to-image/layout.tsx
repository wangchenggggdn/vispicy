import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to Image - Vispicy AI Enhancement",
  description: "Transform and enhance your images using AI-powered image-to-image technology. Edit photos, change styles, and create stunning variations with Vispicy.",
};

export default function ImageToImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
