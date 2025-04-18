'use client';

import React from 'react';
import { useTranslator } from '@/hooks/useTranslator';
import { cn } from '@/lib/utils';
import { TranslationFeedback } from './TranslationFeedback';

interface TranslatedTextProps extends React.HTMLAttributes<HTMLElement> {
  text: string;
  type?: 'text' | 'content';
  tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | 'label';
  variables?: Record<string, any>;
  showFeedback?: boolean;
}

export function TranslatedText({
  text,
  type = 'text',
  tag = 'span',
  variables,
  showFeedback = false,
  className,
  ...props
}: TranslatedTextProps) {
  const { t, translateText, translateContent, isRTL, isIndicScript } = useTranslator();
  
  const translatedText = React.useMemo(() => {
    if (!text) return '';
    
    try {
      return t(text, variables);
    } catch {
      return type === 'content' ? translateContent(text) : translateText(text);
    }
  }, [t, translateText, translateContent, text, type, variables]);
  
  const scriptStyles = React.useMemo(() => {
    if (isIndicScript) {
      return 'font-medium tracking-wide leading-relaxed';
    }
    if (isRTL) {
      return 'font-medium';
    }
    return '';
  }, [isIndicScript, isRTL]);
  
  const Tag = tag;
  
  return (
    <Tag className={cn('group relative', scriptStyles, className)} {...props}>
      {translatedText}
      
      {showFeedback && (
        <span className="inline-flex ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TranslationFeedback 
            translationKey={text} 
            text={translatedText} 
          />
        </span>
      )}
    </Tag>
  );
}

export function TranslatedTitle({
  text,
  level = 2,
  showFeedback = false,
  className,
  ...props
}: {
  text: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  showFeedback?: boolean;
  className?: string;
  [key: string]: any;
}) {
  const tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  return (
    <TranslatedText
      text={text}
      tag={tag}
      showFeedback={showFeedback}
      className={cn(`text-${7-level}xl font-bold`, className)}
      {...props}
    />
  );
}

export function TranslatedParagraph({
  text,
  showFeedback = false,
  className,
  ...props
}: {
  text: string;
  showFeedback?: boolean;
  className?: string;
  [key: string]: any;
}) {
  return (
    <TranslatedText
      text={text}
      tag="p"
      type="content"
      showFeedback={showFeedback}
      className={cn('text-base leading-relaxed', className)}
      {...props}
    />
  );
}