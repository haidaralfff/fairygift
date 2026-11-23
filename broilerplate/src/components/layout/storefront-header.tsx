"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function StorefrontHeader() {
  return (
    <header className="surface-panel hairline-b sticky top-0 z-[var(--z-portal)] bg-[var(--panel)]">
      <div className="mx-auto flex h-13 max-w-[1200px] items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="touch-target inline-flex items-center rounded-[var(--radius-control)] focus-visible:outline-2"
            aria-label="Beranda FairyGift"
          >
            <BrandLogo height={26} />
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 md:flex">
            <Link
              href="/katalog"
              className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] px-3 text-[length:var(--text-body)] text-ink-11 transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-ink-2 hover:text-ink-12"
            >
              Katalog
            </Link>
            <Link
              href="/custom-gift"
              className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] px-3 text-[length:var(--text-body)] text-ink-11 transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-ink-2 hover:text-ink-12"
            >
              Custom gift builder
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/keranjang"
            aria-label="Keranjang belanja"
            className="touch-target inline-flex h-[var(--control-h-pill)] items-center gap-1.5 rounded-full bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-toggle)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-ink-3 active:scale-[0.97]"
          >
            <ShoppingBag className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
            <span>Keranjang</span>
            <span className="tabular-nums text-ink-11">(0)</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
