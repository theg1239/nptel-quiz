'use client';

import { SessionProvider } from 'next-auth/react';
import { type ReactNode } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/toast-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </SessionProvider>
  );
}
