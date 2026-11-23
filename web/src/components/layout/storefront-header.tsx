"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clock,
  Menu,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  X,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { ResilientImage } from "@/components/ui/resilient-image";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { MAKE_TO_ORDER_LEAD_DAYS } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/types/domain";

export function StorefrontHeader() {
  const pathname = usePathname();
  const { totalItems, hydrated } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!searchOpen || products.length > 0) return;
    setLoadingProducts(true);
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, [searchOpen, products.length]);

  const filtered = products.filter((p) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  });

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
              <Sparkles className="size-3 shrink-0" aria-hidden="true" />
              <span>Rangkai Kado Custom · Estimasi Harga Langsung</span>
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <Clock className="size-3 shrink-0" aria-hidden="true" />
              <span>Dirangkai Fresh · Min. {MAKE_TO_ORDER_LEAD_DAYS} Hari Sebelum Kirim</span>
            </span>
            <span className="hidden items-center gap-1.5 md:inline-flex">
              <MessageCircle className="size-3 shrink-0" aria-hidden="true" />
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
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari paket hadiah"
              className="touch-target inline-flex h-[var(--control-h-pill)] items-center gap-2 rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-10 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-ink-2 hover:text-ink-12 md:px-3"
            >
              <Search className="size-3.5 text-ink-10" strokeWidth={2.2} aria-hidden="true" />
              <span className="hidden md:inline">Cari hadiah</span>
              <kbd className="hidden h-[var(--key-chip)] items-center rounded-[var(--radius-xs)] bg-ink-3 px-1.5 font-mono text-[11px] text-ink-11 md:inline-flex">
                ⌘K
              </kbd>
            </button>

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
              <ShoppingBag className="size-3.5 shrink-0" strokeWidth={2.2} aria-hidden="true" />
              <span className="hidden sm:inline">Keranjang</span>
              <span className="tabular-nums">· {activeItemsCount}</span>
            </Link>

            {pathname !== "/custom-gift" ? (
              <Link
                href="/custom-gift"
                className="hidden h-[var(--control-h-pill)] items-center gap-1.5 whitespace-nowrap rounded-full bg-[var(--fg-rose)] px-3.5 text-[length:var(--text-meta)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.97] lg:inline-flex"
              >
                <Sparkles className="size-3.5" aria-hidden="true" />
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
                <X className="size-4" aria-hidden="true" />
              ) : (
                <Menu className="size-4" aria-hidden="true" />
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
                  <Sparkles className="size-3.5" aria-hidden="true" />
                  <span>Rangkai Hadiah</span>
                </Link>
              ) : null}
            </div>
          </nav>
        ) : null}
      </header>

      <ModalSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Cari paket hadiah"
        size="form"
      >
        <div className="flex flex-col gap-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ketik nama paket atau acara (mis. Ulang Tahun, Wisuda)"
            aria-label="Cari nama paket atau kategori"
            className="h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none"
          />

          {loadingProducts ? (
            <p className="py-6 text-center text-[length:var(--text-body)] text-ink-11">
              Memuat katalog…
            </p>
          ) : filtered.length === 0 ? (
            <p className="py-6 text-center text-[length:var(--text-body)] text-ink-11">
              Tidak ada produk yang cocok dengan pencarian Anda.
            </p>
          ) : (
            <ul className="divide-y-[0.5px] divide-[var(--line)] rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] bg-[var(--raised)]">
              {filtered.slice(0, 6).map((prod) => (
                <li key={prod.id}>
                  <Link
                    href={`/produk/${prod.slug}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-ink-2"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <ResilientImage
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="size-10 shrink-0 rounded-[var(--radius-sm)] border-[0.5px] border-ink-6"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-[length:var(--text-body)] text-ink-12">
                          {prod.name}
                        </p>
                        <p className="text-[length:var(--text-meta)] text-ink-11">
                          {prod.categoryName}
                        </p>
                      </div>
                    </div>
                    <span className="tabular-nums shrink-0 text-[length:var(--text-body)] text-ink-12">
                      {formatRupiah(prod.price)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </ModalSheet>
    </>
  );
}
