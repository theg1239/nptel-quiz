'use client';

import React from 'react';
import { useTranslator } from '@/hooks/useTranslator';
import { cn } from '@/lib/utils';

interface LocalizedDateProps extends React.HTMLAttributes<HTMLTimeElement> {
  date: Date | string | number;
  format?: 'long' | 'short' | 'numeric';
  includeTime?: boolean;
}

export function LocalizedDate({
  date,
  format = 'long',
  includeTime = false,
  className,
  ...props
}: LocalizedDateProps) {
  const { locale, formatDt, isRTL, isIndicScript } = useTranslator();
  const dateObj = typeof date === 'object' ? date : new Date(date);
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'numeric' ? 'numeric' : format === 'short' ? 'short' : 'long',
    day: 'numeric',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  };
  
  const formattedDate = new Intl.DateTimeFormat(locale, options).format(dateObj);
  
  const isoDate = dateObj.toISOString();
  
  const scriptClass = isIndicScript ? 'tracking-wide font-medium' : '';
  const dirClass = isRTL ? 'rtl' : 'ltr';
  
  return (
    <time 
      dateTime={isoDate} 
      className={cn(scriptClass, dirClass, className)}
      {...props}
    >
      {formattedDate}
    </time>
  );
}