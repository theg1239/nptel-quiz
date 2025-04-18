'use client';

import { useClientTranslation } from '@/components/TranslationProvider';

export function useTranslator() {
  const { 
    translate, 
    translateText, 
    translateParagraph,
    formatNumber, 
    formatDate,
    currentLocale, 
    isRTL,
    isIndicScript 
  } = useClientTranslation();

  const t = (key: string, params?: Record<string, any>): string => {
    return translate(key, params);
  };

  const translateContent = (content: string): string => {
    return translateParagraph(content);
  };
  
  const formatNum = (num: number): string => {
    return formatNumber(num);
  };
  
  const formatDt = (date: Date | string | number): string => {
    return formatDate(date);
  };

  return {
    t,
    translateText,
    translateContent,
    formatNum,
    formatDt,
    locale: currentLocale,
    isRTL,
    isIndicScript
  };
}
