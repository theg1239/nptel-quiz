import { getRequestConfig, type GetRequestConfigParams, type RequestConfig } from 'next-intl/server';
import { locales, defaultLocale, type Locale } from '../lib/languageUtils';

export default getRequestConfig(
  async ({ locale }: GetRequestConfigParams): Promise<RequestConfig> => {
    const requested = locale as Locale | undefined;
    const validLocale: Locale =
      requested && locales.includes(requested) ? requested : defaultLocale;

    let messages: Record<string, unknown>;
    try {
      messages = (await import(`../messages/${validLocale}.json`)).default;
    } catch {
      messages = (await import(`../messages/${defaultLocale}.json`)).default;
    }

    return {
      locale: validLocale,
      messages,
      timeZone: 'UTC',
      now: new Date(),
    };
  }
);