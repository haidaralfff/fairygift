"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Gift, Search, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import type { Category, Product } from "@/types/domain";

interface CatalogClientProps {
  categories: Category[];
  products: Product[];
  initialCategorySlug?: string;
}

export function CatalogClient({
  categories,
  products,
  initialCategorySlug = "semua",
}: CatalogClientProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialCategorySlug);
  const [availability, setAvailability] = useState<"all" | "available">("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((prod) => {
      if (selectedSlug !== "semua") {
        const matchedCat = categories.find((c) => c.slug === selectedSlug);
        if (matchedCat && prod.categoryId !== matchedCat.id) {
          return false;
        }
      }
      if (availability === "available" && !prod.isAvailable) {
        return false;
      }
      if (q) {
        return (
          prod.name.toLowerCase().includes(q) ||
          prod.description.toLowerCase().includes(q) ||
          prod.categoryName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, categories, selectedSlug, availability, query]);

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      {/* Merchandising Header */}
      <div className="hairline-b flex flex-col justify-between gap-5 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-[length:var(--text-figure)] leading-[var(--leading-figure)] tracking-[-0.02em] text-ink-12 md:text-[28px]">
            Katalog paket hadiah
          </h1>
          <p className="mt-1.5 max-w-[54ch] text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
            Paket hadiah siap pesan dengan rincian isi terkurasi untuk ulang tahun, wisuda, anniversary, dan momen spesial lainnya.
          </p>
        </div>

        <Link
          href="/custom-gift"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors hover:bg-[var(--fg-rose-hover)] active:scale-[0.98]"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          <span>Rangkai kado custom</span>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar edge-fade-x flex items-center gap-2 overflow-x-auto py-1 pr-6">
          <button
            type="button"
            onClick={() => setSelectedSlug("semua")}
            className={`inline-flex h-[var(--control-h-pill)] shrink-0 items-center rounded-full px-3.5 text-[length:var(--text-meta)] transition-colors duration-[var(--dur-hover)] ${
              selectedSlug === "semua"
                ? "bg-[var(--fg-rose)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)]"
                : "bg-[var(--raised)] text-ink-12 shadow-[var(--shadow-toggle)] hover:bg-ink-3"
            }`}
          >
            Semua kategori
          </button>

          {categories.map((cat) => {
            const active = selectedSlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedSlug(cat.slug)}
                className={`inline-flex h-[var(--control-h-pill)] shrink-0 items-center rounded-full px-3.5 text-[length:var(--text-meta)] transition-colors duration-[var(--dur-hover)] ${
                  active
                    ? "bg-[var(--fg-rose)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)]"
                    : "bg-[var(--raised)] text-ink-12 shadow-[var(--shadow-toggle)] hover:bg-ink-3"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SegmentedToggle
            ariaLabel="Filter ketersediaan produk"
            value={availability}
            onChange={setAvailability}
            options={[
              { value: "all", label: "Semua" },
              { value: "available", label: "Tersedia" },
            ]}
          />

          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-10"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari paket hadiah…"
              aria-label="Cari paket hadiah"
              className="h-[var(--control-h)] w-full rounded-full border-0 bg-ink-3 pr-3 pl-8 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none"
            />
          </div>
        </div>
      </div>

      <p className="tabular-nums mt-4 text-[length:var(--text-meta)] text-ink-10">
        Menampilkan {filtered.length} dari {products.length} paket hadiah
      </p>

      {/* Grid / Empty State */}
      {filtered.length === 0 ? (
        <div className="mt-4 flex flex-col items-center justify-center rounded-[var(--radius-feature)] border-[0.5px] border-[var(--line)] bg-[var(--panel)] p-11 text-center">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)]">
            <Gift className="size-5" strokeWidth={1.8} aria-hidden="true" />
          </span>
          <p className="mt-3 text-[length:var(--text-title)] text-ink-12">
            Tidak ada produk yang cocok dengan pencarian Anda.
          </p>
          <p className="mt-1 max-w-[40ch] text-[length:var(--text-body)] text-ink-11">
            Ubah kata kunci pencarian, tampilkan semua produk, atau rangkai kado custom sesuai keinginan Anda.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedSlug("semua");
                setAvailability("all");
                setQuery("");
              }}
              className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-container)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
            >
              Tampilkan semua
            </button>
            <Link
              href="/custom-gift"
              className="inline-flex h-[var(--control-h)] items-center gap-1.5 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] hover:bg-[var(--fg-rose-hover)]"
            >
              <Sparkles className="size-4" aria-hidden="true" />
              <span>Rangkai kado custom</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

