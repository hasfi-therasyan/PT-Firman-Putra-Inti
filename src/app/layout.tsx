import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SplashScreen } from "@/components/splash-screen";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FPI-GMS — Gas Management System",
    template: "%s | FPI-GMS",
  },
  description:
    "Sistem manajemen distribusi gas LPG — PT Firman Putra Inti",
  applicationName: "FPI-GMS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FPI-GMS",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icons/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
    shortcut: ["/favicon.ico"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#134376" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1119" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-dvh bg-background text-foreground font-sans">
        <SplashScreen />
        {children}
      </body>
    </html>
  );
}
