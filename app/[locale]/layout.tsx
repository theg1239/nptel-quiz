import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Providers } from '../providers';
import { locales, getLanguageDirection, isIndicLanguage, Locale } from '@/lib/languageUtils';
import { fontVariables, getFontForLocale } from '../fonts';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  // Await the params object to get the locale
  const { locale } = await params;
  
  // Validate that the requested locale is supported
  if (!locales.includes(locale as Locale)) {
    notFound();
  }
  
  // Load the messages for the requested locale
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    // If messages file doesn't exist, try to use fallback
    try {
      messages = (await import(`../../messages/en.json`)).default;
    } catch {
      notFound();
    }
  }

  // Get text direction based on locale
  const dir = getLanguageDirection(locale as Locale);
  
  // Determine if this is an Indic script language
  const isIndic = isIndicLanguage(locale as Locale);

  // Get appropriate font family for the locale
  const fontFamily = getFontForLocale(locale);
  
  // Font adjustments for different script types
  const scriptAdjustments = isIndic 
    ? { 
        fontFeatureSettings: "'kern' 1", 
        letterSpacing: '0.02em',
      } 
    : {};

  return (
    <html 
      lang={locale} 
      dir={dir}
      className={fontVariables}
      style={{
        ...scriptAdjustments,
        fontFamily
      }}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers locale={locale as Locale}>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}