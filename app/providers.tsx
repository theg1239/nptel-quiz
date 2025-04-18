'use client'

import { SessionProvider } from 'next-auth/react'
import { type ReactNode } from 'react'
import { TranslationProvider } from '@/components/TranslationProvider'
import { Locale } from '@/lib/languageUtils'

export function Providers({ 
  children, 
  locale 
}: { 
  children: ReactNode, 
  locale: Locale 
}) {
  return (
    <SessionProvider>
      <TranslationProvider locale={locale}>
        {children}
      </TranslationProvider>
    </SessionProvider>
  )
}