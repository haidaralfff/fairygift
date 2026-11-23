import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["500"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FairyGift — Hadiah Custom & Paket Hadiah Personal",
  description:
    "Platform pemesanan hadiah siap pesan dan Custom Gift Builder dengan kemasan, isi hadiah, dan kartu ucapan personal.",
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
      <body className="min-h-dvh antialiased selection:bg-[var(--plum-3)] selection:text-ink-12">
        <a href="#main-content" className="skip-link">
          Langsung ke konten utama
        </a>
        {children}
      </body>
    </html>
  );
}
