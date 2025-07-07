import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/context/LanguageContext";
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
  title: "SNR.red - Advanced URL Shortener with Analytics",
  description: "The most powerful URL shortening platform. Create short links, generate QR codes, track analytics, and grow your reach with enterprise-grade features.",
  keywords: "URL shortener, short links, QR codes, analytics, link tracking, digital marketing",
  authors: [{ name: "SNR.red" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  openGraph: {
    title: "SNR.red - Advanced URL Shortener",
    description: "Create powerful short links with advanced analytics and QR code generation",
    type: "website",
    url: "https://snr.red",
  },
  twitter: {
    card: "summary_large_image",
    title: "SNR.red - Advanced URL Shortener",
    description: "Create powerful short links with advanced analytics and QR code generation",
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
        <LanguageProvider>
          {children}
          <Toaster position="top-right" />
        </LanguageProvider>
      </body>
    </html>
  );
}
