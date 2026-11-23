"use client";

import { useState } from "react";
import Link from "next/link";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import { useCart } from "@/components/cart/cart-provider";
import { PillBadge } from "@/components/ui/pill-badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ResilientImage } from "@/components/ui/resilient-image";
import { StatusDot } from "@/components/ui/status-dot";
import { useToast } from "@/components/ui/toast";
import { MAKE_TO_ORDER_LEAD_DAYS } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/types/domain";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addReadyMade } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  function handleAddToCart() {
    if (!product.isAvailable) return;
    addReadyMade(product, quantity);
    setJustAdded(true);
    showToast(`${product.name} (${quantity}x) ditambahkan ke keranjang.`, "green");
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8 md:px-6">
      <Link
        href="/katalog"
        className="inline-flex h-[var(--control-h-compact)] items-center gap-1.5 rounded-full bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-11 shadow-[var(--shadow-button)] transition-colors hover:bg-ink-2 hover:text-ink-12"
      >
        <ArrowBackRoundedIcon style={{ fontSize: 15 }} aria-hidden="true" />
        <span>Kembali ke katalog</span>
      </Link>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-6">
          <div className="aspect-square overflow-hidden rounded-[20px] border-[0.5px] border-[var(--line)] bg-ink-2">
            <ResilientImage
              src={product.imageUrl}
              alt={product.name}
              priority
              className="size-full"
            />
          </div>
        </div>

        <div className="flex flex-col justify-between gap-6 md:col-span-6">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <PillBadge tone={product.isFeatured ? "plum" : "neutral"}>
                {product.categoryName}
              </PillBadge>
              <StatusDot
                tone={product.isAvailable ? "green" : "neutral"}
                label={product.isAvailable ? "Tersedia untuk dipesan" : "Tidak tersedia"}
                muted={!product.isAvailable}
              />
            </div>

            <h1 className="mt-3 text-[length:var(--text-figure)] leading-[var(--leading-figure)] tracking-[-0.02em] text-ink-12 md:text-[28px] md:leading-[1.2]">
              {product.name}
            </h1>

            <p className="tabular-nums mt-2 text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-[var(--fg-rose-text)]">
              {formatRupiah(product.price)}
            </p>

            <div className="hairline-t mt-4 pt-4">
              <p className="text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
                {product.description}
              </p>

              {product.contents && product.contents.length > 0 ? (
                <div className="hairline-t mt-5 pt-4">
                  <p className="text-[length:var(--text-meta)] text-ink-10">
                    Isi paket hadiah
                  </p>
                  <ul className="mt-2.5 space-y-2 text-[length:var(--text-body)] text-ink-12">
                    {product.contents.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircleOutlineRoundedIcon
                          aria-hidden="true"
                          className="mt-0.5 shrink-0 text-[var(--green-11)]"
                          style={{ fontSize: 17 }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <div className="hairline-t space-y-4 pt-5">
            <div className="flex items-center gap-3">
              <QuantityStepper
                value={quantity}
                disabled={!product.isAvailable}
                onChange={setQuantity}
              />

              <button
                type="button"
                disabled={!product.isAvailable}
                onClick={handleAddToCart}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
              >
                {justAdded ? (
                  <>
                    <CheckRoundedIcon style={{ fontSize: 17 }} aria-hidden="true" />
                    <span>Ditambahkan ke keranjang</span>
                  </>
                ) : (
                  <>
                    <ShoppingBagOutlinedIcon style={{ fontSize: 17 }} aria-hidden="true" />
                    <span>Tambah ke keranjang</span>
                  </>
                )}
              </button>
            </div>

            {!product.isAvailable ? (
              <p className="text-[length:var(--text-meta)] text-ink-11">
                Produk ini sedang habis atau tidak tersedia untuk dipesan sementara waktu.
              </p>
            ) : null}

            {/* Assurance & Cross-sell */}
            <div className="hairline-t grid grid-cols-1 gap-2 pt-3 text-[length:var(--text-meta)] text-ink-11 sm:grid-cols-2">
              <span className="inline-flex items-center gap-1.5">
                <AccessTimeOutlinedIcon className="shrink-0 text-[var(--fg-rose)]" style={{ fontSize: 15 }} aria-hidden="true" />
                <span>Disiapkan khusus min. {MAKE_TO_ORDER_LEAD_DAYS} hari sebelumnya</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ChatOutlinedIcon className="shrink-0 text-[var(--fg-rose)]" style={{ fontSize: 15 }} aria-hidden="true" />
                <span>Konfirmasi &amp; layanan via WhatsApp</span>
              </span>
            </div>

            <Link
              href="/custom-gift"
              className="flex items-center justify-between gap-2 rounded-[var(--radius-container)] border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] px-3.5 py-2.5 text-[length:var(--text-meta)] text-[var(--fg-rose-text)] transition-colors hover:bg-[var(--fg-rose-tint)]"
            >
              <span className="inline-flex items-center gap-1.5">
                <AutoAwesomeOutlinedIcon className="shrink-0" style={{ fontSize: 15 }} aria-hidden="true" />
                <span>Ingin komposisi atau warna berbeda? Rangkai sendiri</span>
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

