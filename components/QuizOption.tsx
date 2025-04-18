'use client';

import React from 'react';
import { useTranslator } from '@/hooks/useTranslator';
import { cn } from '@/lib/utils';
import { TranslatedText } from './TranslatedText';

interface QuizOptionProps extends React.HTMLAttributes<HTMLDivElement> {
  option: string;
  isSelected?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
  showResult?: boolean;
}

export function QuizOption({
  option,
  isSelected = false,
  isCorrect = false,
  isIncorrect = false,
  onSelect,
  disabled = false,
  showResult = false,
  className,
  ...props
}: QuizOptionProps) {
  const { isRTL, isIndicScript } = useTranslator();
  
  const baseStyles = "p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200";
  
  const selectionStyles = isSelected 
    ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400 bg-blue-50 dark:bg-blue-900/20" 
    : "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer";
  
  let resultStyles = "";
  if (showResult) {
    if (isCorrect) {
      resultStyles = "ring-2 ring-offset-2 ring-green-500 bg-green-50 dark:bg-green-900/20 dark:ring-green-400";
    } else if (isIncorrect) {
      resultStyles = "ring-2 ring-offset-2 ring-red-500 bg-red-50 dark:bg-red-900/20 dark:ring-red-400";
    }
  }
  
  const disabledStyles = disabled 
    ? "opacity-60 cursor-not-allowed" 
    : "";
  
  const scriptStyles = isIndicScript 
    ? "text-[105%] tracking-wide" 
    : "";
  
  const directionStyles = isRTL ? "text-right" : "text-left";
  
  return (
    <div
      onClick={!disabled ? onSelect : undefined}
      className={cn(
        baseStyles,
        selectionStyles,
        resultStyles,
        disabledStyles,
        scriptStyles,
        directionStyles,
        className
      )}
      dir={isRTL ? "rtl" : "ltr"}
      {...props}
    >
      <TranslatedText 
        text={option} 
        type="content"
        className="font-medium"
      />
    </div>
  );
}
