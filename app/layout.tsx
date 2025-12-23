import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ASAP Jet - Rapid Response Private Jet Charter",
  description: "Time-critical private jet charter. Professional, reliable, and ready when you need it. Same-day and urgent flight coordination with Part 135 operators.",
  icons: {
    icon: '/logo.svg',
  },
  openGraph: {
    title: "ASAP Jet - Rapid Response Private Jet Charter",
    description: "Time-critical private jet charter. Professional, reliable, and ready when you need it.",
    images: ['/logo.svg'],
    type: 'website',
    url: 'https://asapjet.flights',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Ads Conversion Tracking */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=AW-17827004507"
          strategy="afterInteractive"
        />
        <Script id="google-ads-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17827004507');
          `}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
