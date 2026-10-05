import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-plus-jakarta' });

export const metadata: Metadata = {
  title: 'SGB - CD Garupá',
  description: 'Sistema de gestión bibliotecaria del Concejo Deliberante de Garupá',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className={`${inter.className} bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
