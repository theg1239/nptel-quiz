import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });
const GA_ID = process.env.NEXT_PUBLIC_GTAG_ID || 'G-D072DH0Q9Q';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://nptelprep.in'),
  title: {
    default: 'NPTELPrep - Free NPTEL & Swayam Course Practice | Interactive Learning Platform',
    template: '%s | NPTELPrep',
  },
  description:
    "Master NPTEL & Swayam courses with NPTELPrep's comprehensive learning platform. Access free practice questions, interactive quizzes, video lectures, study materials, and discussion forums. Join thousands of students preparing for NPTEL certification exams.",
  keywords: [
    'NPTEL',
    'Swayam NPTEL',
    'NPTEL courses',
    'NPTEL practice questions',
    'NPTEL exam preparation',
    'NPTEL mock tests',
    'NPTEL quiz portal',
    'NPTEL video lectures',
    'NPTEL study materials',
    'NPTEL course materials',
    'NPTEL discussion forum',
    'free NPTEL resources',
    'NPTEL certification preparation',
    'NPTEL exam tips',
    'NPTEL course catalog',
    'NPTEL learning platform',
    'best NPTEL practice',
    'NPTEL assignment help',
    'NPTEL weekly quiz practice',
    'NPTEL course discussions',
  ],
  authors: [{ name: 'Ishaan S', url: 'https://nptelprep.in' }],
  creator: 'Ishaan S',
  publisher: 'NPTELPrep',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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
  openGraph: {
    title: 'NPTELPrep - Your Free NPTEL & Swayam Practice Hub',
    description:
      'Transform your NPTEL learning experience with our comprehensive practice platform. Access free interactive questions, video lectures, study materials, and discussion forums for all NPTEL courses.',
    url: 'https://nptelprep.in',
    siteName: 'NPTELPrep',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NPTELPrep - Your Ultimate NPTEL Learning Companion',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPTELPrep - Free NPTEL Practice & Study Materials',
    description:
      'Access free interactive quizzes, video lectures, and study materials for all NPTEL courses. Join the largest NPTEL learning community today!',
    images: ['/twitter-image.jpg'],
    creator: '@img2pdf',
  },
};

export const generateViewport = () => ({
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
});

interface MetaTag {
  name: string;
  content: string;
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const additionalMetaTags: MetaTag[] = [
    {
      name: 'viewport',
      content:
        'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes',
    },
    {
      name: 'theme-color',
      content: '#ffffff',
    },
  ];

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: 'NPTELPrep',
      url: 'https://nptelprep.in',
      logo: 'https://nptelprep.in/logo.png',
      description:
        'NPTELPrep provides free interactive quizzes, mock exams, and study resources for NPTEL and Swayam courses to help students excel in their exams.',
      sameAs: ['https://twitter.com/img2pdf'],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'NPTELPrep',
      url: 'https://nptelprep.in',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://nptelprep.in/courses?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'NPTELPrep',
      url: 'https://nptelprep.in',
      logo: 'https://nptelprep.in/logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
      },
    },
  ];

  return (
    <html lang="en">
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `}
        </Script>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {additionalMetaTags.map((meta: MetaTag, idx: number) => (
          <meta key={idx} name={meta.name} content={meta.content} />
        ))}
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
