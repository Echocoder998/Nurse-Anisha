import type { Metadata } from 'next';
import './globals.css';
import { SWRegister } from '@/components/sw-register';

export const metadata: Metadata = {
  title: "Anisha's NCLEX Lab · Moro Heritage",
  description: 'NCLEX study companion for nursing students',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/anishalogo.svg', type: 'image/svg+xml' },
    ],
    apple: '/favicon.png',
  },
  openGraph: {
    title: "Anisha's NCLEX Lab",
    description: 'NCLEX study companion for nursing students',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: "Anisha's NCLEX Lab" }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Anisha's NCLEX Lab",
    description: 'NCLEX study companion for nursing students',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2E9387" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body>
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
