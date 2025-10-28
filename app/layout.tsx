import type { Metadata, Viewport } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
// import { OfflineIndicator } from "@/components/pwa/OfflineIndicator"; // DESHABILITADO: Causaba confusión mostrando "modo offline" incorrectamente
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/error-boundary";
import { MatrixRain } from "@/components/matrix-rain/MatrixRain";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Red Arcana - Marketplace Académico",
  description: "Conecta estudiantes con especialistas verificados para trabajos académicos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Red Arcana",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#dc2626",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${orbitron.variable} antialiased bg-black`}>
        <ErrorBoundary>
          <MatrixRain />
          {/* <OfflineIndicator /> */} {/* DESHABILITADO: Causaba confusión */}
          {children}
          <PWAInstallPrompt />
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
