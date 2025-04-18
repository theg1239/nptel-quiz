'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/Input';
import { Textarea } from './ui/textarea';
import { TranslatedText } from './TranslatedText';
import { useTranslator } from '@/hooks/useTranslator';
import { Send, Languages, Check } from 'lucide-react';

interface TranslationFeedbackProps {
  translationKey: string;
  text: string;
}

export function TranslationFeedback({ translationKey, text }: TranslationFeedbackProps) {
  const { locale, t } = useTranslator();
  const [isOpen, setIsOpen] = useState(false);
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log({
      key: translationKey,
      currentText: text,
      suggestion,
      locale,
      timestamp: new Date().toISOString()
    });
    
    setSubmitted(true);
    
    setTimeout(() => {
      setSubmitted(false);
      setSuggestion('');
      setIsOpen(false);
    }, 3000);
  };
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-full"
          title={t('Common.suggestTranslation')}
        >
          <Languages className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <h4 className="font-medium">
                <TranslatedText text="Common.suggestBetterTranslation" />
              </h4>
              <p className="text-xs text-muted-foreground">
                <TranslatedText text="Common.helpUsImproveTranslations" />
              </p>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium">
                <TranslatedText text="Common.currentTranslation" />
              </label>
              <div className="p-2 bg-muted rounded text-sm">{text}</div>
            </div>
            
            <div className="space-y-1">
              <label htmlFor="suggestion" className="text-xs font-medium">
                <TranslatedText text="Common.yourSuggestion" />
              </label>
              <Textarea
                id="suggestion"
                placeholder={t('Common.enterBetterTranslation')}
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="min-h-[80px]"
                required
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={!suggestion.trim()}
                size="sm"
                className="gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <TranslatedText text="Common.submitSuggestion" />
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-4 text-center">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h4 className="font-medium">
              <TranslatedText text="Common.thankYouForSuggestion" />
            </h4>
            <p className="text-sm text-muted-foreground mt-1">
              <TranslatedText text="Common.translationImprovement" />
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}