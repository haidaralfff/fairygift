import Link from "next/link";
import { BrandLogo } from "@/components/ui/brand-logo";

export function StorefrontFooter() {
  return (
    <footer className="hairline-t mt-16 bg-[var(--ground)] py-10">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between md:px-6">
        <div className="flex flex-col gap-2">
          <BrandLogo height={22} />
          <p className="text-[length:var(--text-meta)] leading-[var(--leading-meta)] text-ink-11">
            Hadiah custom Make-to-Order dengan konfirmasi dan pembayaran manual via WhatsApp.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[length:var(--text-meta)] text-ink-11">
          <Link href="/katalog" className="hover:text-ink-12">
            Katalog
          </Link>
          <Link href="/custom-gift" className="hover:text-ink-12">
            Custom gift builder
          </Link>
          <Link href="/keranjang" className="hover:text-ink-12">
            Keranjang
          </Link>
          <Link href="/admin/login" className="text-ink-10 hover:text-ink-12">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
