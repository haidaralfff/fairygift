import Link from "next/link";
import { Clock, Gift, MessageCircle, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/brand-logo";
import { MAKE_TO_ORDER_LEAD_DAYS } from "@/lib/constants";

export function StorefrontFooter() {
  return (
    <footer className="hairline-t mt-20 bg-[var(--panel)]">
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          {/* Brand summary */}
          <div className="space-y-3 md:col-span-5">
            <Link href="/" aria-label="Beranda FairyGift" className="inline-flex">
              <BrandLogo height={26} />
            </Link>
            <p className="max-w-[44ch] text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
              Butik kurasi hadiah dan hampers personal untuk setiap momen berharga. Pilih paket siap kirim atau rangkai sendiri sesuai selera dengan rincian harga yang jelas sejak awal.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--fg-rose-soft)] px-2.5 py-1 text-[length:var(--text-meta)] text-[var(--fg-rose-text)]">
                <Gift className="size-3.5" aria-hidden="true" />
                <span>Pilihan Kemasan Eksklusif</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ink-2 px-2.5 py-1 text-[length:var(--text-meta)] text-ink-11">
                <Clock className="size-3.5" aria-hidden="true" />
                <span>Dirangkai Fresh Min. {MAKE_TO_ORDER_LEAD_DAYS} Hari</span>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="space-y-3 md:col-span-3">
            <p className="text-[length:var(--text-meta)] uppercase tracking-wider text-ink-10">
              Belanja
            </p>
            <ul className="space-y-2 text-[length:var(--text-body)] text-ink-11">
              <li>
                <Link href="/katalog" className="transition-colors hover:text-ink-12">
                  Katalog paket siap pesan
                </Link>
              </li>
              <li>
                <Link href="/custom-gift" className="transition-colors hover:text-ink-12">
                  Rangkai kado custom
                </Link>
              </li>
              <li>
                <Link href="/keranjang" className="transition-colors hover:text-ink-12">
                  Keranjang belanja
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="transition-colors hover:text-ink-12">
                  Selesaikan pesanan
                </Link>
              </li>
            </ul>
          </div>

          {/* Service guarantees */}
          <div className="space-y-3 md:col-span-4">
            <p className="text-[length:var(--text-meta)] uppercase tracking-wider text-ink-10">
              Komitmen Layanan
            </p>
            <ul className="space-y-2.5 text-[length:var(--text-body)] text-ink-11">
              <li className="flex items-start gap-2.5">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--fg-rose)]" aria-hidden="true" />
                <span>Setiap pesanan tercatat rapi dengan bukti transaksi resmi untuk Anda.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-[var(--fg-rose)]" aria-hidden="true" />
                <span>Konsultasi pesanan dan konfirmasi pembayaran cepat melalui WhatsApp.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="hairline-t mt-10 flex flex-col gap-3 pt-6 text-[length:var(--text-meta)] text-ink-10 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FairyGift. Dirangkai khusus untuk setiap momen berharga.</p>
          <p>Hadiah Personal · Pengiriman Aman &amp; Tepat Waktu</p>
        </div>
      </div>
    </footer>
  );
}

