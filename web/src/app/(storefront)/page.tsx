import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import InventoryOutlinedIcon from "@mui/icons-material/InventoryOutlined";
import PaletteOutlinedIcon from "@mui/icons-material/PaletteOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { ProductCard } from "@/components/storefront/product-card";
import { ResilientImage } from "@/components/ui/resilient-image";
import { MAKE_TO_ORDER_LEAD_DAYS } from "@/lib/constants";
import {
  getBuilderCatalog,
  getStorefrontCategories,
  getStorefrontProducts,
} from "@/lib/data/catalog-service";
import { formatRupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

const VALUE_PILLARS = [
  {
    icon: PaletteOutlinedIcon,
    title: "Kemasan Pilihan",
    description:
      "Hardbox satin, kraft box hangat, hingga buket floral dengan warna sesuai selera penerima.",
  },
  {
    icon: CalculateOutlinedIcon,
    title: "Harga Transparan",
    description:
      "Total biaya kemasan, isi hadiah, dan kartu ucapan tampil jelas tanpa biaya tersembunyi.",
  },
  {
    icon: AccessTimeOutlinedIcon,
    title: `Dirangkai Fresh Min. ${MAKE_TO_ORDER_LEAD_DAYS} Hari`,
    description:
      "Setiap bingkisan disiapkan khusus setelah dipesan agar seluruh isinya tampil sempurna.",
  },
  {
    icon: ChatOutlinedIcon,
    title: "Layanan WhatsApp",
    description:
      "Pesanan terhubung langsung ke tim kami di WhatsApp untuk panduan bayar dan jadwal kirim.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Pilih paket kurasi atau rangkai sendiri",
    description:
      "Pilih hampers siap pesan dari katalog kami atau padukan sendiri kemasan, isi hadiah, dan warnanya.",
  },
  {
    step: "2",
    title: "Tulis kartu ucapan & tentukan jadwal",
    description:
      "Sertakan pesan personal untuk penerima, lalu pilih layanan antar ke alamat tujuan atau ambil di tempat.",
  },
  {
    step: "3",
    title: "Konfirmasi & bayar melalui WhatsApp",
    description:
      "Klik tombol WhatsApp pada nota pesanan—seluruh detail kado Anda otomatis siap untuk diproses tim kami.",
  },
];

const FAQ_ITEMS = [
  {
    question: "Berapa lama waktu penyiapan pesanan kado?",
    answer: `Setiap pesanan dirangkai khusus minimal ${MAKE_TO_ORDER_LEAD_DAYS} hari sebelum tanggal kirim agar seluruh bunga, kudapan, dan kemasan tertata rapi sebelum dikirim atau diambil.`,
  },
  {
    question: "Apakah isi hadiah dan warna kemasan bisa dipilih sendiri?",
    answer:
      "Tentu. Melalui layanan Rangkai Kado Custom, Anda bebas menentukan jenis kemasan, warna pita/kotak, kombinasi isi hadiah, hingga desain kartu ucapannya.",
  },
  {
    question: "Bagaimana cara melakukan pembayaran setelah memesan?",
    answer:
      "Setelah menyelesaikan pemesanan, nomor pesanan Anda langsung tercatat. Anda cukup menekan tombol Konfirmasi pesanan via WhatsApp untuk menerima panduan pembayaran resmi.",
  },
  {
    question: "Bisakah hadiah dikirim langsung ke alamat penerima?",
    answer:
      "Ya, saat mengisi data pengiriman Anda dapat menuliskan nama serta alamat penerima secara langsung, atau memilih opsi ambil di toko.",
  },
];

function getCategoryIcon(slug: string) {
  const s = slug.toLowerCase();
  if (s.includes("birthday")) return CakeOutlinedIcon;
  if (s.includes("graduation")) return WorkspacePremiumOutlinedIcon;
  if (s.includes("anniversary")) return FavoriteBorderRoundedIcon;
  if (s.includes("aesthetic")) return PaletteOutlinedIcon;
  return CardGiftcardOutlinedIcon;
}

export default async function HomePage() {
  const [categories, products, builderCatalog] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts(),
    getBuilderCatalog(),
  ]);

  const featuredProducts = products
    .filter((p) => p.isFeatured)
    .slice(0, 6);
  const displayProducts =
    featuredProducts.length > 0 ? featuredProducts : products.slice(0, 6);

  const availableProductsCount = products.filter((p) => p.isAvailable).length;

  const minPackPrice =
    builderCatalog.packagings.length > 0
      ? Math.min(...builderCatalog.packagings.map((p) => p.price))
      : 0;
  const minCompPrice =
    builderCatalog.components.length > 0
      ? Math.min(...builderCatalog.components.map((c) => c.price))
      : 0;
  const customStartPrice = minPackPrice + minCompPrice;

  const categoryCounts = new Map<string, number>();
  for (const prod of products) {
    categoryCounts.set(
      prod.categoryId,
      (categoryCounts.get(prod.categoryId) ?? 0) + 1
    );
  }

  return (
    <div>
      {/* 1. Full-Bleed Editorial Hero (open canvas, zero outer card box) */}
      <section className="fg-hero-surface hairline-b">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-4 py-10 md:px-6 md:py-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-7">
            <h1 className="max-w-[18ch] text-[clamp(2rem,3.8vw,3.1rem)] leading-[1.1] tracking-[-0.03em] text-ink-12 [text-wrap:balance]">
              Hadiah personal yang{" "}
              <span className="text-[var(--fg-rose-text)]">
                dirangkai khusus
              </span>{" "}
              untuk setiap momen
            </h1>

            <p className="mt-5 max-w-[54ch] text-[15px] leading-[1.65] text-ink-11 md:text-[16px]">
              Temukan hampers pilihan siap kirim atau rangkai sendiri kado impian
              Anda—mulai dari kemasan, isi hadiah, hingga kartu ucapan—dengan
              rincian harga yang jelas sejak awal.
            </p>

            <div className="mobile-stack-reverse mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/custom-gift"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-5 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.98]"
              >
                <AutoAwesomeOutlinedIcon style={{ fontSize: 17 }} aria-hidden="true" />
                <span>Rangkai kado custom</span>
              </Link>

              <Link
                href="/katalog"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--raised)] px-5 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-ink-2 active:scale-[0.98]"
              >
                <span>Jelajahi katalog</span>
                <ArrowForwardRoundedIcon className="text-ink-10" style={{ fontSize: 17 }} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Asymmetric Editorial Showcase (no nested card stacks) */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line)] bg-ink-2 shadow-[var(--shadow-panel)]">
              <ResilientImage
                src="/images/paketgift/wadahgift/floral-ribbon-hardbox-bag.jpg"
                alt="Set kotak kado pita floral dan paper bag FairyGift"
                priority
                className="size-full"
              />
              <div className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--panel)_92%,transparent)] px-3 py-1 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] backdrop-blur-sm">
                <InventoryOutlinedIcon
                  className="text-[var(--fg-rose)]"
                  style={{ fontSize: 15 }}
                  aria-hidden="true"
                />
                <span className="tabular-nums">
                  {availableProductsCount} paket siap pesan
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Keunggulan Layanan: Clean Unboxed 4-Column Strip (no table borders) */}
      <section aria-label="Keunggulan FairyGift">
        <div className="mx-auto max-w-[1200px] px-4 md:px-6">
          <div className="hairline-b grid grid-cols-1 gap-x-8 gap-y-7 py-10 sm:grid-cols-2 lg:grid-cols-4">
            {VALUE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="flex flex-col items-start">
                  <span className="inline-flex size-9 items-center justify-center rounded-full bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)]">
                    <Icon style={{ fontSize: 18 }} aria-hidden="true" />
                  </span>
                  <h2 className="mt-3.5 text-[length:var(--text-title)] leading-[var(--leading-title)] text-ink-12">
                    {pillar.title}
                  </h2>
                  <p className="mt-1.5 text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Kategori Momen: Asymmetric Split with Tactile Occasion Pills */}
      <section
        aria-labelledby="categories-heading"
        className="mx-auto max-w-[1200px] px-4 pt-12 md:px-6 md:pt-14"
      >
        <div className="hairline-b grid grid-cols-1 items-center gap-6 pb-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2
              id="categories-heading"
              className="text-[length:var(--text-figure)] leading-[var(--leading-figure)] tracking-[-0.02em] text-ink-12 md:text-[26px]"
            >
              Temukan hadiah sesuai perayaan
            </h2>
            <p className="mt-1.5 max-w-[42ch] text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
              Telusuri kurasi hampers berdasarkan momen spesial orang terdekat.
            </p>
            <Link
              href="/katalog"
              className="mt-3.5 inline-flex items-center gap-1.5 text-[length:var(--text-body)] text-[var(--fg-rose-text)] transition-colors hover:text-[var(--fg-rose)]"
            >
              <span>Lihat semua kategori</span>
              <ArrowForwardRoundedIcon style={{ fontSize: 17 }} aria-hidden="true" />
            </Link>
          </div>

          <ul className="flex flex-wrap items-center gap-2.5 lg:col-span-7 lg:justify-end">
            {categories.map((cat) => {
              const Icon = getCategoryIcon(cat.slug);
              const count = categoryCounts.get(cat.id) ?? 0;
              return (
                <li key={cat.id}>
                  <Link
                    href={`/katalog?kategori=${encodeURIComponent(cat.slug)}`}
                    className="group inline-flex items-center gap-2.5 rounded-full border-[0.5px] border-[var(--line)] bg-[var(--raised)] py-1.5 pr-3.5 pl-1.5 shadow-[var(--shadow-button)] transition-[border-color,background-color,transform] duration-150 hover:-translate-y-0.5 hover:border-[var(--fg-rose-border)] hover:bg-[var(--fg-rose-soft)] motion-reduce:hover:translate-y-0"
                  >
                    <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)] transition-colors group-hover:bg-[var(--fg-rose)] group-hover:text-[var(--fg-rose-fg)]">
                      <Icon style={{ fontSize: 17 }} aria-hidden="true" />
                    </span>
                    <span className="text-[length:var(--text-body)] text-ink-12 transition-colors group-hover:text-[var(--fg-rose-text)]">
                      {cat.name}
                    </span>
                    <span className="tabular-nums rounded-full bg-ink-2 px-2 py-0.5 text-[11px] text-ink-10 transition-colors group-hover:bg-[var(--panel)] group-hover:text-[var(--fg-rose-text)]">
                      {count} paket
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* 4. Paket Hadiah Pilihan (Gallery Product Grid — only card grid on homepage) */}
      <section
        aria-labelledby="featured-heading"
        className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 md:py-16"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="featured-heading"
              className="text-[length:var(--text-figure)] leading-[var(--leading-figure)] tracking-[-0.02em] text-ink-12 md:text-[26px]"
            >
              Paket hadiah pilihan
            </h2>
            <p className="mt-1.5 text-[length:var(--text-body)] text-ink-11">
              Rangkaian hampers siap pesan yang paling sering dipilih pelanggan kami.
            </p>
          </div>

          <Link
            href="/katalog"
            className="inline-flex h-[var(--control-h-compact)] items-center gap-1.5 rounded-full bg-[var(--raised)] px-3.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] transition-colors hover:bg-ink-2"
          >
            <span>Lihat semua paket</span>
            <ArrowForwardRoundedIcon className="text-ink-10" style={{ fontSize: 15 }} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {displayProducts.map((product, idx) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={idx < 3}
            />
          ))}
        </div>
      </section>

      {/* 5. Layanan Kado Custom: Full-Bleed Blush Canvas Band (zero nested cards) */}
      <section
        aria-labelledby="custom-spotlight-heading"
        className="border-y-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] py-12 md:py-16"
      >
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-4 md:px-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h2
              id="custom-spotlight-heading"
              className="max-w-[22ch] text-[length:var(--text-figure)] leading-[1.18] tracking-[-0.02em] text-ink-12 md:text-[30px]"
            >
              Rangkai kado custom sesuai karakter penerima
            </h2>
            <p className="mt-3 max-w-[54ch] text-[length:var(--text-body)] leading-[var(--leading-body)] text-[var(--fg-rose-text)]">
              Padukan {builderCatalog.packagings.length} pilihan kemasan eksklusif,{" "}
              {builderCatalog.components.length} isi hadiah kurasi (bunga,
              cokelat, boneka, parfum, tumbler, aksesori), serta{" "}
              {builderCatalog.cardDesigns.length} desain kartu ucapan personal.
            </p>

            {/* Open 3-step typographic row without box/card containers */}
            <dl className="mt-7 grid grid-cols-1 gap-4 border-t-[0.5px] border-[var(--fg-rose-border)] pt-5 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[var(--fg-rose-text)]">
                  Kemasan &amp; Warna
                </dt>
                <dd className="mt-1 text-[length:var(--text-body)] text-ink-12">
                  Pilih kotak atau buket
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[var(--fg-rose-text)]">
                  Isi Hadiah
                </dt>
                <dd className="mt-1 text-[length:var(--text-body)] text-ink-12">
                  Kombinasi favorit penerima
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-[var(--fg-rose-text)]">
                  Kartu Ucapan
                </dt>
                <dd className="mt-1 text-[length:var(--text-body)] text-ink-12">
                  Tulis pesan hangat Anda
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/custom-gift"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-5 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors hover:bg-[var(--fg-rose-hover)] active:scale-[0.98]"
              >
                <AutoAwesomeOutlinedIcon style={{ fontSize: 17 }} aria-hidden="true" />
                <span>Mulai rangkai hadiah</span>
              </Link>

              {customStartPrice > 0 ? (
                <p className="text-[length:var(--text-meta)] text-[var(--fg-rose-text)]">
                  Estimasi mulai dari{" "}
                  <span className="tabular-nums text-ink-12">
                    {formatRupiah(customStartPrice)}
                  </span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Staggered Unboxed Editorial Diptych */}
          <div className="grid grid-cols-2 items-start gap-4 lg:col-span-6">
            <figure>
              <div className="aspect-square overflow-hidden rounded-[16px] border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--panel)]">
                <ResilientImage
                  src="/images/paketgift/buket/buket-bunga-silverqueen.jpg"
                  alt="Rangkaian buket bunga dan cokelat kurasi FairyGift"
                  className="size-full"
                />
              </div>
              <figcaption className="mt-2.5 text-[length:var(--text-meta)] text-[var(--fg-rose-text)]">
                Buket &amp; Isi Kurasi
              </figcaption>
            </figure>
            <figure className="sm:mt-8">
              <div className="aspect-square overflow-hidden rounded-[16px] border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--panel)]">
                <ResilientImage
                  src="/images/paketgift/wadahgift/hardbox-blush-magnetic.jpg"
                  alt="Kemasan hardbox magnet pita satin FairyGift"
                  className="size-full"
                />
              </div>
              <figcaption className="mt-2.5 text-[length:var(--text-meta)] text-[var(--fg-rose-text)]">
                Kemasan &amp; Hardbox Eksklusif
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 6. Alur Pemesanan (Vertical Rail) & FAQ (Hairline Accordion) — zero cards */}
      <section
        aria-labelledby="how-it-works-heading"
        className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-4 py-12 md:px-6 md:py-16 lg:grid-cols-12"
      >
        <div className="lg:col-span-6">
          <h2
            id="how-it-works-heading"
            className="text-[length:var(--text-figure)] leading-[var(--leading-figure)] tracking-[-0.02em] text-ink-12 md:text-[26px]"
          >
            Dari memilih hingga terkirim rapi
          </h2>

          <ol className="relative mt-7 ml-3 space-y-7 border-l-[0.5px] border-[var(--fg-rose-border)] pl-7">
            {HOW_IT_WORKS.map((item) => (
              <li key={item.step} className="relative">
                <span
                  aria-hidden="true"
                  className="tabular-nums absolute -left-[41px] top-0.5 inline-flex size-7 items-center justify-center rounded-full border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] text-[length:var(--text-meta)] text-[var(--fg-rose-text)]"
                >
                  {item.step}
                </span>
                <h3 className="text-[length:var(--text-title)] leading-[var(--leading-title)] text-ink-12">
                  {item.title}
                </h3>
                <p className="mt-1.5 max-w-[48ch] text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
                  {item.description}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-6">
          <h2 className="text-[length:var(--text-figure)] leading-[var(--leading-figure)] tracking-[-0.02em] text-ink-12 md:text-[26px]">
            Pertanyaan yang sering diajukan
          </h2>

          <div className="mt-6 divide-y-[0.5px] divide-[var(--line)] border-y-[0.5px] border-[var(--line)]">
            {FAQ_ITEMS.map((faq) => (
              <details key={faq.question} className="fg-faq-item group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[length:var(--text-body)] text-ink-12 transition-colors hover:text-[var(--fg-rose-text)]">
                  <span>{faq.question}</span>
                  <KeyboardArrowDownRoundedIcon
                    className="fg-faq-chevron shrink-0 text-ink-10 transition-transform duration-200"
                    style={{ fontSize: 18 }}
                    aria-hidden="true"
                  />
                </summary>
                <div className="pb-4 pr-6 text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Open Typographic Closing CTA (zero outer box) */}
      <section className="hairline-t fg-hero-surface">
        <div className="mx-auto max-w-[1200px] px-4 py-14 text-center md:px-6 md:py-20">
          <h2 className="mx-auto max-w-[24ch] text-[length:var(--text-figure)] leading-[1.18] tracking-[-0.02em] text-ink-12 md:text-[30px]">
            Siap merangkai hadiah yang paling berkesan untuk orang terdekat?
          </h2>
          <p className="mx-auto mt-3 max-w-[50ch] text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
            Mulai dari paket kurasi siap pesan atau sesuaikan setiap detail
            hadiah Anda melalui layanan kado custom kami.
          </p>

          <div className="mobile-stack-reverse mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/custom-gift"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-5 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors hover:bg-[var(--fg-rose-hover)] active:scale-[0.98]"
            >
              <AutoAwesomeOutlinedIcon style={{ fontSize: 17 }} aria-hidden="true" />
              <span>Rangkai kado sekarang</span>
            </Link>

            <Link
              href="/katalog"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--raised)] px-5 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] transition-colors hover:bg-ink-2"
            >
              <span>Lihat katalog paket</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
