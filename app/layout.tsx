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
  title: "NPTELPrep - Practice Made Easy",
  description: "Master NPTEL Swayam courses with interactive questions, quizzes, and study tools on NPTELPrep. Practice, learn, and succeed with personalized learning paths.",
  keywords: ["NPTEL", "Practice", "Quizzes", "Courses", "Interactive Learning", "Exam Prep"],
  authors: [{ name: "Ishaan S", url: "https://nptelprep.in" }],
  creator: "Ishaan S",
  publisher: "NPTELPrep",
  applicationName: "NPTELPrep",
  referrer: "origin-when-cross-origin",
  robots: "index, follow",
  openGraph: {
    title: "NPTELPrep - Your NPTEL Practice Hub",
    description: "Interactive questions, quizzes, and resources for mastering NPTEL courses. Join NPTELPrep for an engaging learning experience.",
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
    title: "NPTELPrep - Practice Made Easy",
    description: "Enhance your NPTEL learning with interactive quizzes and resources on NPTELPrep.",
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
      </body>
    </html>
  );
}
