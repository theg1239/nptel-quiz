export const locales = [
  'en', 'es', 'fr', 'de', 'pt', 'it', 'ru', 'ja', 'ko', 'zh', 'ar',
  
  'hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or', 'as', 'sd'
] as const;

export type Locale = (typeof locales)[number];

export const languageNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  it: 'Italiano',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  zh: '中文',
  ar: 'العربية',
  
  hi: 'हिन्दी', // Hindi
  bn: 'বাংলা', // Bengali
  ta: 'தமிழ்', // Tamil
  te: 'తెలుగు', // Telugu
  mr: 'मराठी', // Marathi
  gu: 'ગુજરાતી', // Gujarati
  kn: 'ಕನ್ನಡ', // Kannada
  ml: 'മലയാളം', // Malayalam
  pa: 'ਪੰਜਾਬੀ', // Punjabi
  ur: 'اردو', // Urdu
  or: 'ଓଡ଼ିଆ', // Odia
  as: 'অসমীয়া', // Assamese
  sd: 'سنڌي' // Sindhi
};

export const defaultLocale: Locale = 'en';

export function detectUserLanguage(
  acceptLanguageHeader: string | null
): Locale {
  if (!acceptLanguageHeader) return defaultLocale;

  const userLanguages = acceptLanguageHeader
    .split(',')
    .map((lang) => {
      const [code, q = '1.0'] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0],
        priority: parseFloat(q),
      };
    })
    .sort((a, b) => b.priority - a.priority);

  const match = userLanguages.find(({ code }) =>
    locales.includes(code as Locale)
  );

  return (match?.code as Locale) || defaultLocale;
}

export function isIndicLanguage(locale: Locale): boolean {
  return ['hi', 'bn', 'ta', 'te', 'mr', 'gu', 'kn', 'ml', 'pa', 'ur', 'or', 'as', 'sd'].includes(locale);
}

export function getLanguageDirection(locale: Locale): 'ltr' | 'rtl' {
  return ['ar', 'ur', 'sd'].includes(locale) ? 'rtl' : 'ltr';
}
