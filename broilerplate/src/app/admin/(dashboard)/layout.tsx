import Link from "next/link";
import { LayoutDashboard, Package, CreditCard, ShoppingCart, Sparkles } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingCart },
  { href: "/admin/pembayaran", label: "Pembayaran", icon: CreditCard },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kustomisasi", label: "Kemasan & komponen", icon: Sparkles },
];

export default function AdminDashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh flex-col bg-[var(--ground)] md:flex-row">
      {/* Desktop Rail (292px) */}
      <aside className="surface-rail hidden w-[292px] shrink-0 flex-col justify-between p-4 md:flex">
        <div>
          <div className="flex items-center justify-between px-2 py-1">
            <Link href="/admin" aria-label="FairyGift Admin">
              <BrandLogo height={24} />
            </Link>
          </div>

          <nav aria-label="Navigasi Admin" className="mt-6 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-[var(--control-h)] items-center gap-2.5 rounded-[var(--radius-control)] px-2.5 text-[length:var(--text-body)] text-ink-11 transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-ink-3 hover:text-ink-12"
                >
                  <Icon className="size-4 text-ink-9" strokeWidth={2} aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center justify-between px-2 pt-4">
          <ThemeToggle />
          <Link href="/" className="text-[length:var(--text-meta)] text-ink-11 hover:text-ink-12">
            Lihat toko
          </Link>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <header className="surface-panel hairline-b flex h-14 items-center justify-between bg-[var(--panel)] px-4 md:hidden">
        <BrandLogo height={20} />
        <ThemeToggle />
      </header>

      {/* Floating Panel */}
      <main
        id="main-content"
        className="surface-panel flex-1 bg-[var(--panel)] md:m-2 md:rounded-[var(--radius-container)] md:shadow-[var(--shadow-panel)]"
      >
        {children}
      </main>
    </div>
  );
}
