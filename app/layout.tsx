import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import SpaceLoader from "@/components/SpaceLoader";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || 'https://nptelprep.in'),
  title: {
    default: "NPTELPrep - Free NPTEL & Swayam Course Practice | Interactive Learning Platform",
    template: "%s | NPTELPrep"
  },
  description: "Master NPTEL & Swayam courses with NPTELPrep's comprehensive learning platform. Access free practice questions, interactive quizzes, video lectures, study materials, and discussion forums. Join thousands of students preparing for NPTEL certification exams.",
  keywords: [
    "NPTEL",
    "Swayam NPTEL",
    "NPTEL courses",
    "NPTEL practice questions",
    "NPTEL exam preparation",
    "NPTEL mock tests",
    "NPTEL quiz portal",
    "NPTEL video lectures",
    "NPTEL study materials",
    "NPTEL course materials",
    "NPTEL discussion forum",
    "free NPTEL resources",
    "NPTEL certification preparation",
    "NPTEL exam tips",
    "NPTEL course catalog",
    "NPTEL learning platform",
    "best NPTEL practice",
    "NPTEL assignment help",
    "NPTEL weekly quiz practice",
    "NPTEL course discussions"
  ],
  authors: [{ name: "Ishaan S", url: "https://nptelprep.in" }],
  creator: "Ishaan S",
  publisher: "NPTELPrep",
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
    title: "NPTELPrep - Your Free NPTEL & Swayam Practice Hub",
    description: "Transform your NPTEL learning experience with our comprehensive practice platform. Access free interactive questions, video lectures, study materials, and discussion forums for all NPTEL courses.",
    url: "https://nptelprep.in",
    siteName: "NPTELPrep",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NPTELPrep - Your Ultimate NPTEL Learning Companion",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NPTELPrep - Free NPTEL Practice & Study Materials",
    description: "Access free interactive quizzes, video lectures, and study materials for all NPTEL courses. Join the largest NPTEL learning community today!",
    images: ["/twitter-image.jpg"],
    creator: "@img2pdf",
  }
};

export const generateViewport = () => ({
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
});

interface MetaTag {
  name: string;
  content: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const additionalMetaTags: MetaTag[] = [
    {
      name: "viewport",
      content:
        "width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes",
    },
    {
      name: "theme-color",
      content: "#ffffff",
    },
  ];

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "NPTELPrep",
      url: "https://nptelprep.in",
      logo: "https://nptelprep.in/logo.png",
      description:
        "NPTELPrep provides free interactive quizzes, mock exams, and study resources for NPTEL and Swayam courses to help students excel in their exams.",
      sameAs: [
        "https://twitter.com/img2pdf"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "NPTELPrep",
      url: "https://nptelprep.in",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://nptelprep.in/courses?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "NPTELPrep",
      url: "https://nptelprep.in",
      logo: "https://nptelprep.in/logo.png",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support"
      }
    }
  ];

  return (
    <html lang="en">
      <head>
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /> */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {additionalMetaTags.map((meta: MetaTag, index: number) => (
          <meta key={index} name={meta.name} content={meta.content} />
        ))}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense
          fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
              <SpaceLoader size={200} />
            </div>
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}
