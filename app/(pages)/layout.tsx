import Header from '@/components/Header';
import Providers from '@/components/Providers';
import type { Metadata } from "next";
import "../globals.css";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "ViCraft - AI生成图片与视频工具站",
  description: "专业的AI内容生成工具，支持文生图、图生图、文生视频、图片转视频等功能",
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
