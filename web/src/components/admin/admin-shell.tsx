"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AdminShellProps {
  children: React.ReactNode;
}

const ROUTE_TITLES: Array<{ prefix: string; title: string; parent?: string }> = [
  { prefix: "/admin/pesanan", title: "Pesanan", parent: "Operasional" },
  { prefix: "/admin/pembayaran", title: "Pembayaran", parent: "Operasional" },
  { prefix: "/admin/produk", title: "Produk", parent: "Katalog" },
  { prefix: "/admin/kustomisasi", title: "Kemasan & komponen", parent: "Katalog" },
  { prefix: "/admin", title: "Overview", parent: "Ringkasan" },
];

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, configured, adminFetch, logout } = useAdminAuth();

  const [pendingCount, setPendingCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && configured && !user) {
      router.replace("/admin/login");
    }
  }, [loading, configured, user, router]);

  useEffect(() => {
    if (!user) return;
    let active = true;

    const refreshOverview = () => {
      adminFetch("/api/admin/overview")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (active && data?.metrics && typeof data.metrics.pendingPayments === "number") {
            setPendingCount(data.metrics.pendingPayments);
          }
        })
        .catch(() => {});
    };

    refreshOverview();
    window.addEventListener("fairygift:admin-refresh-overview", refreshOverview);
    return () => {
      active = false;
      window.removeEventListener("fairygift:admin-refresh-overview", refreshOverview);
    };
  }, [user, pathname, adminFetch]);

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

  const currentMeta =
    ROUTE_TITLES.find((r) =>
      r.prefix === "/admin" ? pathname === "/admin" : pathname.startsWith(r.prefix)
    ) ?? ROUTE_TITLES[4]!;

  const navGroups = [
    {
      label: "Ringkasan",
      items: [{ href: "/admin", label: "Overview", icon: LayoutDashboard }],
    },
    {
      label: "Operasional",
      items: [
        { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
        {
          href: "/admin/pembayaran",
          label: "Pembayaran",
          icon: CreditCard,
          badge: pendingCount > 0 ? pendingCount : undefined,
        },
      ],
    },
    {
      label: "Katalog",
      items: [
        { href: "/admin/produk", label: "Produk", icon: Package },
        { href: "/admin/kustomisasi", label: "Kemasan & komponen", icon: Sparkles },
      ],
    },
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    router.push(q ? `/admin/pesanan?q=${encodeURIComponent(q)}` : "/admin/pesanan");
  }

  if (loading || (configured && !user)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[var(--ground)]">
        <p className="text-[length:var(--text-body)] text-ink-11">
          {loading ? "Memeriksa sesi admin…" : "Mengalihkan ke halaman masuk…"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--ground)] md:flex-row">
      {/* Desktop Left Rail (292px) */}
      <aside className="surface-rail hidden w-[292px] shrink-0 flex-col justify-between p-4 md:flex">
        <div>
          <div className="flex items-center justify-between px-2 py-1">
            <Link href="/admin" aria-label="FairyGift Admin">
              <BrandLogo height={24} />
            </Link>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Cari pesanan cepat"
              className="inline-flex h-7 items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-2 text-[length:var(--text-meta)] text-ink-10 shadow-[var(--shadow-button)] hover:text-ink-12"
            >
              <Search className="size-3.5" aria-hidden="true" />
              <kbd className="font-mono text-[11px]">⌘K</kbd>
            </button>
          </div>

          <nav aria-label="Navigasi Admin" className="mt-6 space-y-5">
            {navGroups.map((group) => (
              <div key={group.label}>
                <p className="px-2.5 text-[length:var(--text-meta)] text-ink-9">
                  {group.label}
                </p>
                <div className="mt-1.5 flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active =
                      item.href === "/admin"
                        ? pathname === "/admin"
                        : pathname.startsWith(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex h-[var(--control-h)] items-center justify-between rounded-[var(--radius-control)] px-2.5 text-[length:var(--text-body)] transition-colors duration-[var(--dur-hover)] ${
                          active
                            ? "bg-ink-3 text-ink-12"
                            : "text-ink-11 hover:bg-ink-2 hover:text-ink-12"
                        }`}
                      >
                        <span className="inline-flex items-center gap-2">
                          <Icon
                            className={`size-4 ${active ? "text-ink-12" : "text-ink-9"}`}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                        </span>
                        {item.badge ? (
                          <span className="tabular-nums text-[length:var(--text-meta)] text-ink-11">
                            {item.badge}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Pinned Foot */}
        <div className="space-y-3 pt-4">
          {pendingCount > 0 ? (
            <div className="rounded-[var(--radius-container)] bg-[var(--raised)] p-3 shadow-[var(--shadow-card)]">
              <p className="tabular-nums text-[length:var(--text-meta)] text-ink-12">
                {pendingCount} pembayaran menunggu verifikasi
              </p>
              <Link
                href="/admin/pembayaran"
                className="mt-2 inline-flex h-[var(--control-h-pill)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
              >
                Periksa
              </Link>
            </div>
          ) : null}

          <div className="flex items-center justify-between px-1">
            <div className="min-w-0">
              <p className="truncate text-[length:var(--text-meta)] text-ink-12">
                {user?.email || "Mode Preview"}
              </p>
              <Link
                href="/"
                className="text-[length:var(--text-meta)] text-ink-10 hover:text-ink-12"
              >
                Lihat toko
              </Link>
            </div>

            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Keluar"
                  className="touch-target inline-flex size-7 items-center justify-center rounded-full bg-[var(--raised)] text-ink-10 shadow-[var(--shadow-button)] hover:text-ink-12"
                >
                  <LogOut className="size-3.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="surface-panel hairline-b sticky top-0 z-[var(--z-portal)] flex h-14 items-center justify-between bg-[var(--panel)] px-4 md:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href="/admin" aria-label="FairyGift Admin" className="shrink-0">
            <BrandLogo height={20} />
          </Link>
          <span className="truncate text-[length:var(--text-meta)] text-ink-11">
            / {currentMeta.title}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Cari pesanan cepat"
            className="touch-target inline-flex size-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] text-ink-11 shadow-[var(--shadow-button)] hover:text-ink-12"
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label={mobileMenuOpen ? "Tutup menu admin" : "Buka menu admin"}
            className="touch-target inline-flex size-10 items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] text-ink-12 shadow-[var(--shadow-button)]"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen ? (
        <div className="surface-panel hairline-b bg-[var(--panel)] px-4 py-3 md:hidden">
          <nav aria-label="Navigasi Admin Seluler" className="flex flex-col gap-1">
            {navGroups.flatMap((g) => g.items).map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`inline-flex h-11 items-center justify-between rounded-[var(--radius-control)] px-3 text-[length:var(--text-body)] ${
                    active ? "bg-ink-3 text-ink-12" : "text-ink-11"
                  }`}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <Icon className="size-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </span>
                  {item.badge ? (
                    <span className="tabular-nums text-[length:var(--text-meta)]">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {pendingCount > 0 ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-[var(--raised)] p-3 shadow-[var(--shadow-card)]">
              <p className="tabular-nums text-[length:var(--text-meta)] text-ink-12">
                {pendingCount} pembayaran menunggu verifikasi
              </p>
              <Link
                href="/admin/pembayaran"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex h-[var(--control-h-pill)] shrink-0 items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)]"
              >
                Periksa
              </Link>
            </div>
          ) : null}

          <div className="hairline-t mt-3 flex items-center justify-between gap-3 pt-3">
            <div className="min-w-0">
              <p className="truncate text-[length:var(--text-meta)] text-ink-12">
                {user?.email || "Mode Preview"}
              </p>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[length:var(--text-meta)] text-ink-10 hover:text-ink-12"
              >
                Lihat toko
              </Link>
            </div>

            {user ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                aria-label="Keluar dari admin"
                className="touch-target inline-flex h-[var(--control-h-compact)] items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-11 shadow-[var(--shadow-button)] hover:text-ink-12"
              >
                <LogOut className="size-3.5" aria-hidden="true" />
                <span>Keluar</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Main Floating Panel */}
      <div className="surface-panel flex flex-1 flex-col bg-[var(--panel)] md:m-2 md:rounded-[var(--radius-container)] md:shadow-[var(--shadow-panel)]">
        {/* Desktop Top Strip (52px) */}
        <div className="hairline-b relative hidden h-13 items-center justify-between px-6 md:flex">
          <div className="flex items-center gap-1.5 text-[length:var(--text-meta)]">
            <span className="text-ink-10">{currentMeta.parent}</span>
            <span className="text-ink-8">/</span>
            <span className="text-ink-12">{currentMeta.title}</span>
          </div>

          <p className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[length:var(--text-body)] text-ink-12">
            {currentMeta.title}
          </p>

          <div className="text-[length:var(--text-meta)] text-ink-10">
            {configured ? "Firebase Live" : "Setup Pending"}
          </div>
        </div>

        <main id="main-content" className="flex-1">
          {!configured ? (
            <div className="mx-auto max-w-[1200px] px-4 pt-4 md:px-6">
              <div className="rounded-[var(--radius-control)] bg-[var(--amber-3)] px-3.5 py-2.5 text-[length:var(--text-meta)] text-[var(--amber-11)]">
                Firebase belum dikonfigurasi di <code className="font-mono">.env.local</code>.
                Isi konfigurasi Firebase & Cloudinary untuk mengaktifkan data admin langsung.
              </div>
            </div>
          ) : null}
          {children}
        </main>
      </div>

      {/* Quick Order Search Modal (⌘K) */}
      <ModalSheet
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Cari pesanan"
        size="confirm"
      >
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nomor pesanan (FG-2026-0001) atau nama pelanggan"
            className="h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-[var(--control-h)] w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--primary-bg)] px-4 text-[length:var(--text-body)] text-[var(--primary-fg)]"
          >
            Cari di daftar pesanan
          </button>
        </form>
      </ModalSheet>
    </div>
  );
}
