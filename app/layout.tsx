import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
