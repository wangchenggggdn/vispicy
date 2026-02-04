import type { Metadata } from "next";
import Providers from '@/components/Providers';
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Vispicy - AI-Powered Image and Video Generation Platform",
    template: "%s | Vispicy"
  },
  description: "Transform your ideas into stunning visuals with Vispicy's AI-powered creative tools. Generate images and videos from text, transform images, and create dynamic content instantly.",
  keywords: ["AI image generation", "text to image", "image to image", "text to video", "AI video generator", "AI art", "creative tools", "vispicy"],
  authors: [{ name: "Vispicy" }],
  creator: "Vispicy",
  publisher: "Vispicy",
  metadataBase: new URL('https://vispicy.com'),
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vispicy.com',
    title: 'Vispicy - AI-Powered Image and Video Generation Platform',
    description: 'Transform your ideas into stunning visuals with Vispicy\'s AI-powered creative tools. Generate images and videos from text, transform images, and create dynamic content instantly.',
    siteName: 'Vispicy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vispicy - AI Creative Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vispicy - AI-Powered Image and Video Generation Platform',
    description: 'Transform your ideas into stunning visuals with Vispicy\'s AI-powered creative tools.',
    images: ['/og-image.jpg'],
    creator: '@vispicy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
