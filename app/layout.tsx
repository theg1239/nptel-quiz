import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import SpaceLoader from "@/components/SpaceLoader";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

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
  title: "NPTELPrep - Free Practice for NPTEL Exams | Interactive Quizzes",
  description:
    "Ace your NPTEL exams with interactive quizzes, mock exams, and study resources tailored for NPTEL and Swayam courses. Practice and succeed with NPTELPrep's comprehensive materials, including courses like Wild Life Ecology, Data Structures, Machine Learning, and more.",
  keywords: [
    "NPTEL practice",
    "free NPTEL quizzes",
    "NPTEL mock exams",
    "Swayam courses",
    "NPTEL preparation",
    "Swayam NPTEL",
    "NPTEL online courses",
    "Swayam NPTEL courses",
    "Wild Life Ecology",
    "Data Structures NPTEL",
    "Machine Learning NPTEL",
    "NPTEL course practice",
    "Swayam course practice",
    "NPTEL exam preparation",
    "free Swayam courses",
    "NPTEL study resources",
    "Swayam study materials",
    "NPTEL online learning",
    "Swayam online courses",
    "NPTEL certification",
    "Swayam certification",
    "NPTEL video lectures",
    "Swayam video lectures",
    "NPTEL assignments",
    "Swayam assignments",
    "NPTEL test series",
    "Swayam test series",
    "NPTEL interactive quizzes",
    "Swayam interactive quizzes",
    "NPTEL exam success",
    "Swayam exam success",
    "Best NPTEL courses",
    "Top Swayam courses",
    "NPTEL course list",
    "Swayam course list",
  ],
  authors: [{ name: "Ishaan S", url: "https://nptelprep.in" }],
  creator: "Ishaan S",
  publisher: "NPTELPrep",
  applicationName: "NPTELPrep",
  referrer: "origin-when-cross-origin",
  robots: "index, follow",
  openGraph: {
    title: "NPTELPrep - Your Free NPTEL Practice Hub",
    description:
      "Get free interactive questions, quizzes, and resources for NPTEL and Swayam course success. Join NPTELPrep for engaging and effective learning in courses like Wild Life Ecology, Data Structures, Machine Learning, and more.",
    url: "https://nptelprep.in",
    siteName: "NPTELPrep",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "NPTELPrep - Practice Made Easy",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NPTELPrep - Free NPTEL Practice and Quizzes",
    description:
      "Interactive NPTEL and Swayam quizzes and resources for exam success. Join NPTELPrep today for courses like Wild Life Ecology, Data Structures, Machine Learning, and more!",
    images: ["/twitter-image.jpg"],
    creator: "@img2pdf",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const generateViewport = () => ({
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Include preconnects for external resources if required */}
        {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" /> */}
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
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
