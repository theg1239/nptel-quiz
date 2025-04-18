'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Check, Globe, ChevronDown } from 'lucide-react';
import { Button } from './ui/Button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { useClientTranslation } from './TranslationProvider';
import { languageNames, Locale, isIndicLanguage } from '@/lib/languageUtils';

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentLocale } = useClientTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // Get all supported languages
  const languages = useMemo(() => {
    return Object.entries(languageNames).map(([code, name]) => ({
      code: code as Locale,
      name,
      isIndic: isIndicLanguage(code as Locale)
    }));
  }, []);

  // Group languages by category
  const { commonLanguages, indicLanguages } = useMemo(() => {
    const common = languages.filter(lang => !lang.isIndic);
    const indic = languages.filter(lang => lang.isIndic);
    
    return {
      commonLanguages: common,
      indicLanguages: indic
    };
  }, [languages]);

  // Switch language handler
  const switchLanguage = useCallback((locale: Locale) => {
    if (locale === currentLocale) return;
    
    // Get the path segments
    const segments = pathname.split('/');
    
    // Replace the locale segment (should be the first one)
    if (segments.length > 1) {
      segments[1] = locale;
      const newPath = segments.join('/');
      router.push(newPath);
    } else {
      router.push(`/${locale}`);
    }
    
    setIsOpen(false);
  }, [currentLocale, pathname, router]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-2 h-9 px-2 md:px-3"
        >
          <Globe className="h-4 w-4" aria-hidden="true" />
          <span className="hidden md:inline">{languageNames[currentLocale]}</span>
          <span className="inline md:hidden">{currentLocale.toUpperCase()}</span>
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Select Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs opacity-70">Common Languages</DropdownMenuLabel>
          {commonLanguages.map((lang) => (
            <DropdownMenuItem 
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className="flex justify-between"
            >
              <span>{lang.name}</span>
              {currentLocale === lang.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs opacity-70">Indic Languages</DropdownMenuLabel>
          {indicLanguages.map((lang) => (
            <DropdownMenuItem 
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className="flex justify-between"
            >
              <span>{lang.name}</span>
              {currentLocale === lang.code && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}