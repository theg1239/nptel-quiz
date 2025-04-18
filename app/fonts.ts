import React from 'react';
import localFont from 'next/font/local';
import { Noto_Sans } from 'next/font/google';
import { Noto_Sans_Arabic } from 'next/font/google';
import { Noto_Sans_Bengali } from 'next/font/google';
import { Noto_Sans_Devanagari } from 'next/font/google';
import { Noto_Sans_Tamil } from 'next/font/google';
import { Noto_Sans_Telugu } from 'next/font/google';
import { Noto_Sans_Kannada } from 'next/font/google';
import { Noto_Sans_Malayalam } from 'next/font/google';
import { Noto_Sans_Gujarati } from 'next/font/google';
import { Noto_Sans_Gurmukhi } from 'next/font/google';
import { Noto_Sans_Oriya } from 'next/font/google';

// Base font
const geist = localFont({
  src: [
    {
      path: './fonts/GeistVF.woff',
      style: 'normal',
    },
  ],
  variable: '--font-geist',
});

// Base monospace font
const geistMono = localFont({
  src: [
    {
      path: './fonts/GeistMonoVF.woff',
      style: 'normal',
    },
  ],
  variable: '--font-geist-mono',
});

// Latin and common scripts
const notoSans = Noto_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin', 'latin-ext'],
  variable: '--font-noto-sans',
  display: 'swap',
});

// Arabic script (for Arabic, Urdu, etc.)
const notoSansArabic = Noto_Sans_Arabic({
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  variable: '--font-noto-sans-arabic',
  display: 'swap',
});

// Indic scripts
const notoSansBengali = Noto_Sans_Bengali({
  weight: ['400', '500', '600', '700'],
  subsets: ['bengali'],
  variable: '--font-noto-sans-bengali',
  display: 'swap',
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari'],
  variable: '--font-noto-sans-devanagari',
  display: 'swap',
});

const notoSansTamil = Noto_Sans_Tamil({
  weight: ['400', '500', '600', '700'],
  subsets: ['tamil'],
  variable: '--font-noto-sans-tamil',
  display: 'swap',
});

const notoSansTelugu = Noto_Sans_Telugu({
  weight: ['400', '500', '600', '700'],
  subsets: ['telugu'],
  variable: '--font-noto-sans-telugu',
  display: 'swap',
});

const notoSansKannada = Noto_Sans_Kannada({
  weight: ['400', '500', '600', '700'],
  subsets: ['kannada'],
  variable: '--font-noto-sans-kannada',
  display: 'swap',
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  weight: ['400', '500', '600', '700'],
  subsets: ['malayalam'],
  variable: '--font-noto-sans-malayalam',
  display: 'swap',
});

const notoSansGujarati = Noto_Sans_Gujarati({
  weight: ['400', '500', '600', '700'],
  subsets: ['gujarati'],
  variable: '--font-noto-sans-gujarati',
  display: 'swap',
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  weight: ['400', '500', '600', '700'],
  subsets: ['gurmukhi'],
  variable: '--font-noto-sans-gurmukhi',
  display: 'swap',
});

const notoSansOriya = Noto_Sans_Oriya({
  weight: ['400', '500', '600', '700'],
  subsets: ['oriya'],
  variable: '--font-noto-sans-oriya',
  display: 'swap',
});

// Combined font variables string
export const fontVariables = [
  geist.variable,
  geistMono.variable,
  notoSans.variable,
  notoSansArabic.variable,
  notoSansBengali.variable,
  notoSansDevanagari.variable,
  notoSansTamil.variable,
  notoSansTelugu.variable,
  notoSansKannada.variable,
  notoSansMalayalam.variable,
  notoSansGujarati.variable,
  notoSansGurmukhi.variable,
  notoSansOriya.variable,
].join(' ');

// Map of locales to font families
export const localeFontMap: Record<string, string> = {
  // Default
  default: 'var(--font-geist), var(--font-noto-sans), system-ui, sans-serif',
  
  // Arabic script languages
  ar: 'var(--font-noto-sans-arabic), var(--font-noto-sans), system-ui, sans-serif',
  ur: 'var(--font-noto-sans-arabic), var(--font-noto-sans), system-ui, sans-serif',
  sd: 'var(--font-noto-sans-arabic), var(--font-noto-sans), system-ui, sans-serif',
  
  // Indic languages
  hi: 'var(--font-noto-sans-devanagari), var(--font-noto-sans), system-ui, sans-serif',
  mr: 'var(--font-noto-sans-devanagari), var(--font-noto-sans), system-ui, sans-serif',
  bn: 'var(--font-noto-sans-bengali), var(--font-noto-sans), system-ui, sans-serif',
  as: 'var(--font-noto-sans-bengali), var(--font-noto-sans), system-ui, sans-serif',
  ta: 'var(--font-noto-sans-tamil), var(--font-noto-sans), system-ui, sans-serif',
  te: 'var(--font-noto-sans-telugu), var(--font-noto-sans), system-ui, sans-serif',
  kn: 'var(--font-noto-sans-kannada), var(--font-noto-sans), system-ui, sans-serif',
  ml: 'var(--font-noto-sans-malayalam), var(--font-noto-sans), system-ui, sans-serif',
  gu: 'var(--font-noto-sans-gujarati), var(--font-noto-sans), system-ui, sans-serif',
  pa: 'var(--font-noto-sans-gurmukhi), var(--font-noto-sans), system-ui, sans-serif',
  or: 'var(--font-noto-sans-oriya), var(--font-noto-sans), system-ui, sans-serif',
};

// Function to get the appropriate font family based on locale
export function getFontForLocale(locale: string): string {
  return localeFontMap[locale] || localeFontMap.default;
}