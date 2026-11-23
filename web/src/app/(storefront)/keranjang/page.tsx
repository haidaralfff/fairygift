"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { useCart } from "@/components/cart/cart-provider";
import { PillBadge } from "@/components/ui/pill-badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ResilientImage } from "@/components/ui/resilient-image";
import { formatRupiah } from "@/lib/format";

export default function KeranjangPage() {
  const { items, hydrated, totalPrice, updateQuantity, removeItem } = useCart();
  const [stockIssues, setStockIssues] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    if (!hydrated || items.length === 0) {
      setStockIssues({});
      return;
    }

    let cancelled = false;
    setValidating(true);
    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data && typeof data.issues === "object") {
          setStockIssues(data.issues || {});
        }
      })
      .catch(() => {
        // Ignore transient network check error; checkout API will verify atomically
      })
      .finally(() => {
        if (!cancelled) setValidating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, items]);

  const hasIssues = Object.keys(stockIssues).length > 0;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8 md:px-6">
        <div className="h-7 w-48 animate-pulse rounded-[var(--radius-control)] bg-ink-4" />
        <div className="mt-6 h-40 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[840px] px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-[length:var(--text-figure)] leading-[var(--leading-figure)] tracking-[-0.02em] text-ink-12">
          Keranjang belanja
        </h1>
        {items.length > 0 ? (
          <p className="tabular-nums text-[length:var(--text-meta)] text-ink-10">
            {items.length} jenis paket
          </p>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--panel)] p-11 text-center shadow-[var(--shadow-panel)]">
          <span className="inline-flex size-11 items-center justify-center rounded-full bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)]">
            <ShoppingBagOutlinedIcon style={{ fontSize: 20 }} aria-hidden="true" />
          </span>
          <p className="mt-3 text-[length:var(--text-title)] text-ink-12">
            Keranjang belanja kosong.
          </p>
          <p className="mt-1 max-w-[38ch] text-[length:var(--text-body)] text-ink-11">
            Pilih paket hadiah siap pesan atau rangkai hadiah custom terlebih dahulu.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/katalog"
              className="inline-flex h-11 items-center rounded-[var(--radius-container)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
            >
              Lihat katalog
            </Link>
            <Link
              href="/custom-gift"
              className="inline-flex h-11 items-center rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] hover:bg-[var(--fg-rose-hover)]"
            >
              Rangkai kado custom
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <ul className="surface-raised divide-y-[0.5px] divide-[var(--line)] rounded-[var(--radius-feature)] border-[0.5px] border-[var(--line)] bg-[var(--raised)] shadow-[var(--shadow-card)]">
            {items.map((item) => {
              const issue = stockIssues[item.cartItemId];
              return (
                <li key={item.cartItemId} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3.5">
                      {item.type === "ready_made" ? (
                        <ResilientImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-16 shrink-0 rounded-[var(--radius-container)] border-[0.5px] border-ink-6"
                        />
                      ) : (
                        <div className="flex size-16 shrink-0 items-center justify-center rounded-[var(--radius-container)] border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)]">
                          <span className="text-[length:var(--text-meta)]">Custom</span>
                        </div>
                      )}

                      <div className="min-w-0">
                        {item.type === "custom_gift" ? (
                          <div className="mb-1">
                            <PillBadge tone="plum">Kado Custom</PillBadge>
                          </div>
                        ) : null}

                        <h2 className="text-[length:var(--text-title)] leading-[var(--leading-title)] text-ink-12">
                          {item.name}
                        </h2>

                        {item.type === "ready_made" ? (
                          <p className="tabular-nums mt-0.5 text-[length:var(--text-meta)] text-ink-11">
                            {formatRupiah(item.unitPrice)} / paket
                          </p>
                        ) : (
                          <div className="mt-1 space-y-0.5 text-[length:var(--text-meta)] text-ink-11">
                            <p>
                              Kemasan: {item.customization.packagingName} (
                              {item.customization.selectedColor.name},{" "}
                              {item.customization.selectedDesign})
                            </p>
                            <p>
                              Isi:{" "}
                              {item.customization.components
                                .map((c) => c.name)
                                .join(", ")}
                            </p>
                            <p className="break-words">
                              Kartu ({item.customization.cardDesignName}):{" "}
                              {item.customization.greetingMessage
                                ? `"${item.customization.greetingMessage}"`
                                : "Tanpa pesan"}
                            </p>
                          </div>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <QuantityStepper
                            size="pill"
                            value={item.quantity}
                            onChange={(qty) => updateQuantity(item.cartItemId, qty)}
                          />

                          {item.type === "custom_gift" ? (
                            <Link
                              href={`/custom-gift?edit=${encodeURIComponent(item.cartItemId)}`}
                              className="inline-flex h-[var(--control-h-pill)] items-center px-2 text-[length:var(--text-meta)] text-ink-11 underline hover:text-ink-12"
                            >
                              Ubah
                            </Link>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => removeItem(item.cartItemId)}
                            className="inline-flex h-[var(--control-h-pill)] items-center rounded-[var(--radius-control)] px-2 text-[length:var(--text-meta)] text-ink-10 transition-colors hover:bg-ink-2 hover:text-ink-12"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right">
                      <p className="tabular-nums text-[length:var(--text-title)] text-ink-12">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </p>
                    </div>
                  </div>

                  {issue ? (
                    <p
                      role="alert"
                      className="mt-3 rounded-[var(--radius-control)] bg-[var(--red-3)] px-3 py-2 text-[length:var(--text-meta)] text-[var(--red-11)]"
                    >
                      {issue}
                    </p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Summary */}
          <div className="surface-raised rounded-[var(--radius-feature)] border-[0.5px] border-[var(--line)] bg-[var(--raised)] p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-[length:var(--text-body)] text-ink-11">
                Total harga
              </span>
              <span className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-[var(--fg-rose-text)]">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            {hasIssues ? (
              <p className="mt-2 text-[length:var(--text-meta)] text-[var(--red-11)]">
                Sesuaikan atau hapus hadiah yang stoknya sedang kosong sebelum lanjut ke data pengiriman.
              </p>
            ) : null}

            <div className="mobile-stack-reverse mt-5 flex flex-wrap items-center justify-between gap-3">
              <Link
                href="/katalog"
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-container)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
              >
                Tambah hadiah lain
              </Link>

              {hasIssues || validating ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-5 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] opacity-45"
                >
                  {validating ? "Mengecek ketersediaan…" : "Lanjut isi data kirim"}
                </button>
              ) : (
                <Link
                  href="/checkout"
                  className="inline-flex h-11 items-center justify-center rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-5 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.98]"
                >
                  Lanjut isi data kirim
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
