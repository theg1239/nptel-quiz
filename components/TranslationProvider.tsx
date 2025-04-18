// clientTranslation.tsx
'use client';

import { useTranslations } from 'next-intl';
import { useEffect, createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Locale, getLanguageDirection, isIndicLanguage } from '@/lib/languageUtils';

// Enhanced context to include more translation features
type TranslationContextType = {
  translate: (key: string, params?: Record<string, any>) => string;
  translateText: (text: string) => string;
  translateParagraph: (paragraph: string) => string;
  formatNumber: (num: number) => string;
  formatDate: (date: Date | string | number) => string;
  currentLocale: Locale;
  isRTL: boolean;
  isIndicScript: boolean;
};

const TranslationContext = createContext<TranslationContextType | null>(null);

export function TranslationProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  // Use separate translators for different namespaces
  const commonT = useTranslations('Common');
  const indexT = useTranslations('Index');
  const navigationT = useTranslations('Navigation');
  const footerT = useTranslations('Footer');
  const coursesT = useTranslations('Courses');
  const aboutT = useTranslations('About');
  const languageSelectorT = useTranslations('LanguageSelector');
  const featureAnnounceT = useTranslations('FeatureAnnounce');
  
  const [currentLocale, setCurrentLocale] = useState<Locale>(locale);
  const [isRTL, setIsRTL] = useState(getLanguageDirection(locale) === 'rtl');
  const [isIndicScript, setIsIndicScript] = useState(isIndicLanguage(locale));

  useEffect(() => {
    setCurrentLocale(locale);
    setIsRTL(getLanguageDirection(locale) === 'rtl');
    setIsIndicScript(isIndicLanguage(locale));
  }, [locale]);

  const translate = useCallback(
    (key: string, params?: Record<string, any>): string => {
      try {
        const parts = key.split('.');
        
        if (parts.length > 1) {
          const namespace = parts[0];
          const restOfKey = parts.slice(1).join('.');
          
          switch (namespace) {
            case 'Common':
              return commonT(restOfKey, params);
            case 'Index':
              return indexT(restOfKey, params);
            case 'Navigation':
              return navigationT(restOfKey, params);
            case 'Footer':
              return footerT(restOfKey, params);
            case 'Courses':
              return coursesT(restOfKey, params);
            case 'About':
              return aboutT(restOfKey, params);
            case 'LanguageSelector':
              return languageSelectorT(restOfKey, params);
            case 'FeatureAnnounce':
              return featureAnnounceT(restOfKey, params);
            default:
              return commonT(key, params);
          }
        } 
        
        return commonT(key, params);
      } catch (error) {
        try {
          const parts = key.split('.');
          if (parts.length > 1) {
            return commonT(parts[parts.length - 1], params);
          }
        } catch {
          const parts = key.split('.');
          return parts[parts.length - 1];
        }
        
        const parts = key.split('.');
        return parts[parts.length - 1];
      }
    },
    [commonT, indexT, navigationT, footerT, coursesT, aboutT, languageSelectorT, featureAnnounceT]
  );

  const translateText = useCallback((text: string): string => {
    if (!text) return '';

    try {
      return commonT(text);
    } catch {
      return text
        .split(/(\s+|[^\p{L}\p{N}]+)/u)
        .map((token) => {
          if (/\p{L}|\p{N}/u.test(token)) {
            try {
              return commonT(token);
            } catch {
              return token;
            }
          }
          return token;
        })
        .join('');
    }
  }, [commonT]);

  const translateParagraph = useCallback((paragraph: string): string => {
    if (!paragraph) return '';

    try {
      return commonT(paragraph);
    } catch {
      const sentences = paragraph.split(/([.!?]+\s+|\n+)/);
      
      return sentences.map(sentence => {
        const trimmedSentence = sentence.trim();
        if (!trimmedSentence) return sentence;

        try {
          return commonT(trimmedSentence);
        } catch {
          const translatedSentence = trimmedSentence
            .split(/(\s+|[^\p{L}\p{N}]+)/u)
            .map(token => {
              if (/\p{L}|\p{N}/u.test(token)) {
                try {
                  return commonT(token);
                } catch {
                  return token;
                }
              }
              return token;
            })
            .join('');
          
          return translatedSentence + (sentence.endsWith(' ') ? ' ' : '');
        }
      }).join('');
    }
  }, [commonT]);

  const formatNumber = useCallback(
    (num: number): string => {
      try {
        return new Intl.NumberFormat(currentLocale).format(num);
      } catch {
        return new Intl.NumberFormat('en').format(num);
      }
    },
    [currentLocale]
  );

  const formatDate = useCallback(
    (date: Date | string | number): string => {
      const dateObj = typeof date === 'object' ? date : new Date(date);
      try {
        return new Intl.DateTimeFormat(currentLocale, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(dateObj);
      } catch {
        return new Intl.DateTimeFormat('en', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }).format(dateObj);
      }
    },
    [currentLocale]
  );

  return (
    <TranslationContext.Provider
      value={{ 
        translate, 
        translateText, 
        translateParagraph,
        formatNumber, 
        formatDate,
        currentLocale, 
        isRTL,
        isIndicScript
      }}
    >
      {children}
    </TranslationContext.Provider>
  );
}

export function useClientTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      'useClientTranslation must be used within a TranslationProvider'
    );
  }
  return context;
}
