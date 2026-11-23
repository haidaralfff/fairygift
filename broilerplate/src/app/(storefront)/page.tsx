import Link from "next/link";
import { ArrowRight, Gift, MessageCircle, Sparkles } from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Pilih paket atau rangkai sendiri",
    description:
      "Mulai dari paket siap pesan di katalog atau buka Custom Gift Builder untuk memilih kemasan, isi hadiah, dan kartu ucapan.",
  },
  {
    step: "2",
    title: "Isi data pengiriman dan pesan kartu",
    description:
      "Masukkan detail pemesan, penerima, tanggal kirim atau ambil, dan pesan personal tanpa biaya tersembunyi.",
  },
  {
    step: "3",
    title: "Konfirmasi pembayaran via WhatsApp",
    description:
      "Setelah pesanan tercatat dengan nomor FG, Anda diarahkan ke WhatsApp Admin dengan ringkasan pesanan otomatis.",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6 md:py-12">
      {/* Hero Banner — 1 Primary Action per surface */}
      <section className="surface-panel rounded-[var(--radius-feature)] bg-[var(--panel)] p-6 shadow-[var(--shadow-panel)] md:p-10">
        <div className="max-w-[640px]">
          <span className="inline-flex h-[var(--badge-h)] items-center rounded-full bg-[var(--plum-3)] px-2.5 text-[length:var(--text-meta)] text-[var(--plum-11)]">
            Custom Gift Platform
          </span>

          <h1 className="mt-4 text-[length:var(--text-display)] leading-[var(--leading-display)] tracking-[var(--tracking-display)] text-ink-11">
            Rangkai hadiah{" "}
            <span className="text-ink-12">personal</span> untuk setiap momen spesial.
          </h1>

          <p className="mt-3 text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
            Pilih paket hadiah siap pesan atau racik kemasan, warna, isi hadiah, dan pesan
            kartu ucapan sendiri dengan perhitungan harga langsung sebelum checkout.
          </p>

          <div className="mobile-stack mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/custom-gift"
              className="inline-flex h-[var(--control-h)] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--primary-bg)] px-4 text-[length:var(--text-body)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)] transition-transform duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-[var(--primary-hover)] active:scale-[0.97]"
            >
              <Sparkles className="size-4" strokeWidth={2} aria-hidden="true" />
              <span>Mulai buat custom gift</span>
            </Link>

            <Link
              href="/katalog"
              className="inline-flex h-[var(--control-h)] items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-[var(--root-ink-2)] active:scale-[0.97]"
            >
              <span>Lihat katalog</span>
              <ArrowRight className="size-4 text-ink-10" strokeWidth={2} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cara Kerja 3 Langkah */}
      <section className="mt-10" aria-labelledby="cara-kerja-heading">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="cara-kerja-heading"
            className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12"
          >
            Cara memesan di FairyGift
          </h2>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center gap-2.5">
                <span className="tabular-nums inline-flex size-6 items-center justify-center rounded-full bg-ink-3 text-[length:var(--text-meta)] text-ink-12">
                  {item.step}
                </span>
                <h3 className="text-[length:var(--text-title)] leading-[var(--leading-title)] text-ink-12">
                  {item.title}
                </h3>
              </div>
              <p className="mt-2.5 text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Info Status Integrasi Boilerplate */}
      <section className="mt-10 rounded-[var(--radius-container)] bg-[var(--panel)] p-5 shadow-[var(--shadow-panel)]">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Gift className="mt-0.5 size-4 shrink-0 text-[var(--plum-11)]" aria-hidden="true" />
            <div>
              <p className="text-[length:var(--text-body)] text-ink-12">
                Boilerplate FairyGift siap dihubungkan ke Firebase & Cloudinary
              </p>
              <p className="text-[length:var(--text-meta)] text-ink-11">
                Cek status koneksi environment lewat endpoint{" "}
                <code className="font-mono text-ink-12">/api/health</code> setelah mengisi{" "}
                <code className="font-mono text-ink-12">.env.local</code>.
              </p>
            </div>
          </div>

          <Link
            href="/api/health"
            className="inline-flex h-[var(--control-h-compact)] shrink-0 items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
          >
            <MessageCircle className="size-3.5 text-ink-10" aria-hidden="true" />
            <span>Cek /api/health</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
