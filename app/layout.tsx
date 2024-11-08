import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import SpaceLoader from "@/components/SpaceLoader";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react"

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
  description: "Ace your NPTEL exams with interactive quizzes, mock exams, and study resources tailored for NPTEL courses. Practice and succeed on NPTELPrep.",
  keywords: ["NPTEL practice", "free NPTEL quizzes", "NPTEL mock exams", "Swayam courses", "NPTEL preparation"],
  authors: [{ name: "Ishaan S", url: "https://nptelprep.in" }],
  creator: "Ishaan S",
  publisher: "NPTELPrep",
  applicationName: "NPTELPrep",
  referrer: "origin-when-cross-origin",
  robots: "index, follow",
  openGraph: {
    title: "NPTELPrep - Your Free NPTEL Practice Hub",
    description: "Get free interactive questions, quizzes, and resources for NPTEL success. Join NPTELPrep for engaging and effective learning.",
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
    description: "Interactive NPTEL quizzes and resources for exam success. Join NPTELPrep today!",
    images: ["/twitter-image.jpg"], 
    creator: "@img2pdf",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  }
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
        <Analytics />
      </body>
    </html>
  );
}
