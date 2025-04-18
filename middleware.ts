import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/languageUtils';

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: true,
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|images|public).*)',
  ],
};
