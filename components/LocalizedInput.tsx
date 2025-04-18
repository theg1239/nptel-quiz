'use client';

import React from 'react';
import { Input, InputProps } from '@/components/ui/Input';
import { useTranslator } from '@/hooks/useTranslator';
import { cn } from '@/lib/utils';

interface LocalizedInputProps extends Omit<InputProps, 'dir'> {
  placeholder?: string;
  placeholderKey?: string;
}

export function LocalizedInput({
  placeholder,
  placeholderKey,
  className,
  ...props
}: LocalizedInputProps) {
  const { t, isRTL, isIndicScript, locale } = useTranslator();
  
  const localizedPlaceholder = placeholderKey 
    ? t(placeholderKey) 
    : placeholder;
  
  const indicStyles = isIndicScript 
    ? 'text-[105%] tracking-wide leading-relaxed font-medium' 
    : '';
  
  return (
    <Input
      dir={isRTL ? 'rtl' : 'ltr'}
      placeholder={localizedPlaceholder}
      className={cn(indicStyles, 
        isRTL ? 'text-right' : 'text-left',
        className
      )}
      {...props}
    />
  );
}