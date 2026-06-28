import type { Metadata } from 'next';

const PAGE_URL = 'https://vispicy.com/face-swap';
const PAGE_TITLE = 'Free Face Swap';
const PAGE_DESCRIPTION =
  'Swap faces online for free with Vispicy AI. Try one free face swap without signing up — upload a target photo and a face source, get realistic AI results in seconds.';

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    'free face swap',
    'AI face swap',
    'face swap online',
    'swap faces free',
    'photo face swap',
    'face swap app',
    'online face changer',
    'free AI face swap',
    'face swap no sign up',
  ],
  alternates: {
    canonical: '/face-swap',
  },
  openGraph: {
    title: 'Free Face Swap Online — Try Once Free | Vispicy',
    description: PAGE_DESCRIPTION,
    url: PAGE_URL,
    type: 'website',
    siteName: 'Vispicy',
    images: [
      {
        url: '/img/confused-black-guy-meme-face-swap.webp',
        width: 1200,
        height: 900,
        alt: 'Free AI face swap example — meme face swap before and after',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Face Swap Online | Vispicy',
    description: PAGE_DESCRIPTION,
    images: ['/img/confused-black-guy-meme-face-swap.webp'],
  },
};

const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Vispicy Free Face Swap',
  url: PAGE_URL,
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'One free face swap without account registration',
  },
  description: PAGE_DESCRIPTION,
  featureList: [
    'Free trial without sign up',
    'AI-powered realistic face swap',
    'Upload target photo and face source',
    'Instant online processing',
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is Vispicy face swap free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. You can try one free face swap without creating an account. Additional swaps are available for a small fee or with Vispicy coins when signed in.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I use the free face swap tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Upload a target image (the photo you want to change) and a face source image (the face you want to use). Click Start Face Swap and download your result when processing completes.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do I need to sign up for a free face swap?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No sign up is required for your first free face swap. Create a free account to use coins, save history, and access other AI tools on Vispicy.',
      },
    },
  ],
};

export default function FaceSwapLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
