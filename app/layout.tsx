import type {Metadata, Viewport} from 'next';
import {headers} from 'next/headers';
import {Geist, Geist_Mono} from 'next/font/google';
import {detectLocale} from '@/lib/i18n';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

export const viewport: Viewport = {
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#e2e8c2'},
    {media: '(prefers-color-scheme: dark)', color: '#22037d'}
  ]
};

export const metadata: Metadata = {
  title: {
    template: '%s — Атлетик',
    default: 'Атлетик'
  },
  description: 'Спортивный клуб Атлетик — онлайн информация о загруженности зала',
  openGraph: {
    siteName: 'Атлетик',
    locale: 'ru_RU',
    type: 'website'
  }
};

export default async function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  const locale = detectLocale((await headers()).get('accept-language'));
  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
