'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { Toaster } from 'sonner';
import TRPCProvider from './_trpc/Provider';

function SonnerToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      position="top-right"
      closeButton
      theme={resolvedTheme as 'light' | 'dark'}
      toastOptions={{
        classNames: {
          toast: 'custom-toast',
          title: 'custom-toast-title',
          description: 'custom-toast-description',
          actionButton: 'custom-toast-action',
        },
      }}
    />
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TRPCProvider>
        {children}
        <SonnerToaster />
      </TRPCProvider>
    </ThemeProvider>
  );
}
