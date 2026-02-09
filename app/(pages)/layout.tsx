import Header from '@/components/Header';
import Providers from '@/components/Providers';
import type { Metadata } from "next";
import "../globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Vispicy - AI Image & Video Generation Tool",
  description: "Professional AI content generation tool supporting text-to-image, image-to-image, text-to-video, and image-to-video",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
};

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>{children}</main>
      </div>
    </Providers>
  );
}
