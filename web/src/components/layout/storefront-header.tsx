"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { useCart } from "@/components/cart/cart-provider";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MAKE_TO_ORDER_LEAD_DAYS } from "@/lib/constants";

export function StorefrontHeader() {
  const pathname = usePathname();
  const { totalItems, hydrated } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { href: "/", label: "Beranda", exact: true },
    { href: "/katalog", label: "Katalog", exact: false },
    { href: "/custom-gift", label: "Kado Custom", exact: false },
  ];

  const activeItemsCount = hydrated ? totalItems : 0;

  return (
    <>
      {/* Value Proposition Strip */}
      <div className="border-b-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-x-5 gap-y-1 px-4 py-1.5 text-[11px] leading-tight sm:text-[length:var(--text-meta)] md:justify-between md:px-6">
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
            <span className="inline-flex items-center gap-1.5">
              <AutoAwesomeOutlinedIcon className="shrink-0" style={{ fontSize: 13 }} aria-hidden="true" />
              <span>Rangkai Kado Custom · Estimasi Harga Langsung</span>
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <AccessTimeOutlinedIcon className="shrink-0" style={{ fontSize: 13 }} aria-hidden="true" />
              <span>Dirangkai Fresh · Min. {MAKE_TO_ORDER_LEAD_DAYS} Hari Sebelum Kirim</span>
            </span>
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <ChatOutlinedIcon className="shrink-0" style={{ fontSize: 13 }} aria-hidden="true" />
              <span>Konsultasi &amp; Konfirmasi Cepat via WhatsApp</span>
            </span>
          </div>

          <Link
            href="/custom-gift"
            className="hidden items-center gap-1 underline-offset-4 hover:underline lg:inline-flex"
          >
            <span>Rangkai sekarang</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <header
        className={`surface-panel sticky top-0 z-[var(--z-portal)] transition-[background-color,border-color,box-shadow] duration-150 ${
          scrolled
            ? "hairline-b bg-[color-mix(in_oklab,var(--panel)_86%,transparent)] shadow-[0_6px_18px_-14px_rgb(var(--shadow-ink)/0.22)] backdrop-blur-md"
            : "border-b-[0.5px] border-[var(--line)] bg-[var(--panel)]"
        }`}
      >
        <div className="mx-auto flex h-15 max-w-[1200px] items-center justify-between gap-2 px-4 md:gap-3 md:px-6">
          <div className="flex min-w-0 items-center gap-4 md:gap-7">
            <Link
              href="/"
              className="touch-target inline-flex shrink-0 items-center rounded-[var(--radius-control)]"
              aria-label="Beranda FairyGift"
            >
              <BrandLogo height={26} />
            </Link>

            <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex h-[var(--control-h-compact)] shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[length:var(--text-body)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] ${
                      active
                        ? "bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)] shadow-[0_0_0_0.5px_var(--fg-rose-border)]"
                        : "text-ink-11 hover:bg-ink-2 hover:text-ink-12"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <ThemeToggle />

            <Link
              href="/keranjang"
              aria-label={`Keranjang belanja, ${activeItemsCount} item`}
              className={`touch-target inline-flex h-[var(--control-h-pill)] items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 text-[length:var(--text-meta)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] active:scale-[0.97] sm:px-3 ${
                activeItemsCount > 0
                  ? "bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)] shadow-[0_0_0_0.5px_var(--fg-rose-border)] hover:bg-[var(--fg-rose-tint)]"
                  : "bg-[var(--raised)] text-ink-12 shadow-[var(--shadow-toggle)] hover:bg-ink-3"
              }`}
            >
              <ShoppingBagOutlinedIcon className="shrink-0" style={{ fontSize: 15 }} aria-hidden="true" />
              <span className="hidden sm:inline">Keranjang</span>
              <span className="tabular-nums">· {activeItemsCount}</span>
            </Link>

            {pathname !== "/custom-gift" ? (
              <Link
                href="/custom-gift"
                className="hidden h-[var(--control-h-pill)] items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--fg-rose)] px-3.5 text-[length:var(--text-meta)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.97] lg:inline-flex"
              >
                <AutoAwesomeOutlinedIcon style={{ fontSize: 15 }} aria-hidden="true" />
                <span>Rangkai Hadiah</span>
              </Link>
            ) : null}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={mobileMenuOpen}
              className="touch-target inline-flex h-[var(--control-h-pill)] w-9 items-center justify-center rounded-full bg-[var(--raised)] text-ink-12 shadow-[var(--shadow-button)] transition-colors hover:bg-ink-2 md:hidden"
            >
              {mobileMenuOpen ? (
                <CloseRoundedIcon style={{ fontSize: 18 }} aria-hidden="true" />
              ) : (
                <MenuRoundedIcon style={{ fontSize: 18 }} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <nav
            aria-label="Navigasi seluler"
            className="hairline-t bg-[var(--panel)] px-4 py-3 md:hidden"
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`inline-flex h-10 items-center rounded-[var(--radius-control)] px-3 text-[length:var(--text-body)] ${
                      active
                        ? "bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)] shadow-[0_0_0_0.5px_var(--fg-rose-border)]"
                        : "text-ink-11 hover:bg-ink-2 hover:text-ink-12"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
              {pathname !== "/custom-gift" ? (
                <Link
                  href="/custom-gift"
                  onClick={() => setMobileMenuOpen(false)}
                  className="mt-1 inline-flex h-10 items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--fg-rose)] px-3.5 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)]"
                >
                  <AutoAwesomeOutlinedIcon style={{ fontSize: 15 }} aria-hidden="true" />
                  <span>Rangkai Hadiah</span>
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}
      </header>
    </>
  );
}
