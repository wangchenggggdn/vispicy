import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Image to Video - Vispicy AI Animation",
  description: "Transform your images into dynamic videos with AI animation. Bring your photos to life with Vispicy's advanced image-to-video generation technology.",
};

export default function ImageToVideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
