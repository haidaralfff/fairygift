import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MotionConfig } from "motion/react";
import { CartProvider } from "@/components/cart/cart-provider";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FairyGift — Kado & Hampers Custom",
  description:
    "Butik hadiah personal dan hampers siap pesan dengan pilihan kado custom serta konfirmasi mudah lewat WhatsApp.",
};

const themeInitScript = `
(function () {
  try {
    var saved = localStorage.getItem('fg-theme');
    if (saved === 'light' || saved === 'dark') {
      document.documentElement.setAttribute('data-theme', saved);
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        <MotionConfig reducedMotion="user">
          <ToastProvider>
            <CartProvider>{children}</CartProvider>
          </ToastProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
