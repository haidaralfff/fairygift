"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import { useCart } from "@/components/cart/cart-provider";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { PillBadge } from "@/components/ui/pill-badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ResilientImage } from "@/components/ui/resilient-image";
import { useToast } from "@/components/ui/toast";
import { MAKE_TO_ORDER_LEAD_DAYS } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { CartItem } from "@/types/domain";

export default function KeranjangPage() {
  const {
    items,
    hydrated,
    totalItems,
    totalPrice,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { showToast } = useToast();

  const [stockIssues, setStockIssues] = useState<Record<string, string>>({});
  const [initialValidated, setInitialValidated] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<CartItem | null>(
    null
  );
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  useEffect(() => {
    if (!hydrated || items.length === 0) {
      setStockIssues({});
      if (hydrated) setInitialValidated(true);
      return;
    }

    let cancelled = false;
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
        if (!cancelled) setInitialValidated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated, items]);

  const hasIssues = Object.keys(stockIssues).length > 0;
  const validating = !initialValidated && items.length > 0;

  function handleConfirmDelete() {
    if (!pendingDeleteItem) return;
    const removedName = pendingDeleteItem.name;
    removeItem(pendingDeleteItem.cartItemId);
    setPendingDeleteItem(null);
    showToast(`${removedName} dihapus dari keranjang.`, "neutral");
  }

  function handleConfirmClear() {
    clearCart();
    setConfirmClearOpen(false);
    showToast("Semua hadiah di keranjang telah dihapus.", "neutral");
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[1040px] px-4 py-8 md:px-6">
        <div className="h-7 w-52 animate-pulse rounded-[var(--radius-control)] bg-ink-4" />
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="h-52 animate-pulse rounded-[var(--radius-feature)] bg-ink-3 lg:col-span-8" />
          <div className="h-52 animate-pulse rounded-[var(--radius-feature)] bg-ink-3 lg:col-span-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1040px] px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-12 md:text-[30px]">
            Keranjang belanja
          </h1>
          {items.length > 0 ? (
            <p className="tabular-nums mt-1 text-[length:var(--text-meta)] font-medium text-ink-10">
              {items.length} jenis hadiah · {totalItems} paket total
            </p>
          ) : null}
        </div>

        {items.length > 1 ? (
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="touch-target inline-flex h-[var(--control-h-compact)] items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-[var(--red-11)] shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--red-3)] active:scale-[0.97]"
          >
            <DeleteOutlineRoundedIcon style={{ fontSize: 15 }} aria-hidden="true" />
            <span>Kosongkan</span>
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--panel)] p-10 text-center shadow-[var(--shadow-panel)] sm:p-12">
          <span className="inline-flex size-12 items-center justify-center rounded-full bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)]">
            <ShoppingBagOutlinedIcon style={{ fontSize: 22 }} aria-hidden="true" />
          </span>
          <p className="mt-4 text-[length:var(--text-title)] text-ink-12">
            Keranjang belanja masih kosong
          </p>
          <p className="mt-1.5 max-w-[40ch] text-[length:var(--text-body)] text-ink-11">
            Pilih paket hadiah siap pesan dari katalog atau rangkai kado custom sesuai selera Anda.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/katalog"
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-container)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-ink-2 active:scale-[0.98]"
            >
              <Inventory2OutlinedIcon style={{ fontSize: 17 }} aria-hidden="true" />
              <span>Lihat katalog</span>
            </Link>
            <Link
              href="/custom-gift"
              className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.98]"
            >
              <AutoAwesomeOutlinedIcon style={{ fontSize: 17 }} aria-hidden="true" />
              <span>Rangkai kado custom</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-start">
          {/* Cart Items */}
          <ul className="surface-raised divide-y-[0.5px] divide-[var(--line)] rounded-[var(--radius-feature)] border-[0.5px] border-[var(--line)] bg-[var(--raised)] shadow-[var(--shadow-card)] lg:col-span-8">
            {items.map((item) => {
              const issue = stockIssues[item.cartItemId];
              const lineTotal = item.unitPrice * item.quantity;

              return (
                <li key={item.cartItemId} className="p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 flex-1 gap-3.5 sm:gap-4">
                      {item.type === "ready_made" ? (
                        <Link
                          href={`/produk/${encodeURIComponent(item.slug)}`}
                          className="shrink-0 rounded-[var(--radius-container)] transition-opacity duration-[var(--dur-hover)] hover:opacity-90"
                        >
                          <ResilientImage
                            src={item.imageUrl}
                            alt={item.name}
                            className="size-[72px] rounded-[var(--radius-container)] border-[0.5px] border-ink-6 sm:size-20"
                          />
                        </Link>
                      ) : (
                        <div className="relative flex size-[72px] shrink-0 flex-col items-center justify-center rounded-[var(--radius-container)] border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)] sm:size-20">
                          <CardGiftcardOutlinedIcon
                            style={{ fontSize: 26 }}
                            aria-hidden="true"
                          />
                          <span
                            title={`Warna: ${item.customization.selectedColor.name}`}
                            className="absolute right-1.5 bottom-1.5 size-3.5 rounded-full border border-white/80 shadow-xs"
                            style={{
                              backgroundColor: item.customization.selectedColor.hex,
                            }}
                            aria-hidden="true"
                          />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {item.type === "custom_gift" ? (
                            <PillBadge tone="plum">Kado Custom</PillBadge>
                          ) : (
                            <PillBadge tone="neutral">Siap Pesan</PillBadge>
                          )}
                        </div>

                        {item.type === "ready_made" ? (
                          <Link
                            href={`/produk/${encodeURIComponent(item.slug)}`}
                            className="mt-1.5 inline-block text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)] text-ink-12 underline-offset-4 hover:underline"
                          >
                            {item.name}
                          </Link>
                        ) : (
                          <h2 className="mt-1.5 text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)] text-ink-12">
                            {item.name}
                          </h2>
                        )}

                        {item.type === "ready_made" ? (
                          <p className="tabular-nums mt-0.5 text-[length:var(--text-meta)] text-ink-11">
                            {formatRupiah(item.unitPrice)} / paket
                          </p>
                        ) : (
                          <div className="mt-2 space-y-1 text-[length:var(--text-meta)] text-ink-11">
                            <p>
                              <span className="text-ink-10">Kemasan: </span>
                              <span className="text-ink-12">
                                <span
                                  className="mr-1.5 inline-block size-2.5 align-[-1px] rounded-full border border-ink-6"
                                  style={{
                                    backgroundColor:
                                      item.customization.selectedColor.hex,
                                  }}
                                  aria-hidden="true"
                                />
                                {item.customization.packagingName} ·{" "}
                                {item.customization.selectedColor.name},{" "}
                                {item.customization.selectedDesign}
                              </span>
                            </p>

                            <p>
                              <span className="text-ink-10">Isi: </span>
                              {item.customization.components
                                .map((c) =>
                                  c.quantity > 1
                                    ? `${c.quantity}× ${c.name}`
                                    : c.name
                                )
                                .join(", ")}
                            </p>

                            <p className="break-words">
                              <span className="text-ink-10">
                                Kartu ({item.customization.cardDesignName}):{" "}
                              </span>
                              {item.customization.greetingMessage
                                ? `"${item.customization.greetingMessage}"`
                                : "Tanpa pesan"}
                            </p>
                          </div>
                        )}

                        {/* Controls Row */}
                        <div className="mt-3.5 flex flex-wrap items-center gap-2">
                          <QuantityStepper
                            size="pill"
                            value={item.quantity}
                            onChange={(qty) => updateQuantity(item.cartItemId, qty)}
                          />

                          {item.type === "custom_gift" ? (
                            <Link
                              href={`/custom-gift?edit=${encodeURIComponent(item.cartItemId)}`}
                              className="touch-target inline-flex h-[var(--control-h-pill)] items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-ink-2 active:scale-[0.97]"
                            >
                              <EditOutlinedIcon
                                style={{ fontSize: 14 }}
                                aria-hidden="true"
                              />
                              <span>Ubah</span>
                            </Link>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => setPendingDeleteItem(item)}
                            aria-label={`Hapus ${item.name} dari keranjang`}
                            className="touch-target inline-flex h-[var(--control-h-pill)] items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-[var(--red-11)] shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--red-3)] active:scale-[0.97]"
                          >
                            <DeleteOutlineRoundedIcon
                              style={{ fontSize: 15 }}
                              aria-hidden="true"
                            />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Price Column */}
                    <div className="flex items-baseline justify-between border-t-[0.5px] border-[var(--line)] pt-3 sm:block sm:border-0 sm:pt-0 sm:text-right">
                      <span className="text-[length:var(--text-meta)] text-ink-10 sm:hidden">
                        Subtotal
                      </span>
                      <div>
                        <p className="tabular-nums text-[length:var(--text-title)] font-semibold text-ink-12">
                          {formatRupiah(lineTotal)}
                        </p>
                        {item.quantity > 1 ? (
                          <p className="tabular-nums mt-0.5 text-[length:var(--text-meta)] text-ink-10">
                            {item.quantity} × {formatRupiah(item.unitPrice)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  {issue ? (
                    <div
                      role="alert"
                      className="mt-3 flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--red-3)] px-3 py-2 text-[length:var(--text-meta)] text-[var(--red-11)]"
                    >
                      <WarningAmberOutlinedIcon
                        className="mt-0.5 shrink-0"
                        style={{ fontSize: 15 }}
                        aria-hidden="true"
                      />
                      <span>{issue}</span>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Sticky Summary Sidebar */}
          <aside className="lg:col-span-4">
            <div className="surface-raised sticky top-20 rounded-[var(--radius-feature)] border-[0.5px] border-[var(--line)] bg-[var(--raised)] p-5 shadow-[var(--shadow-card)] sm:p-6">
              <h2 className="text-[length:var(--text-title)] font-semibold text-ink-12">
                Ringkasan keranjang
              </h2>

              <dl className="mt-4 space-y-2.5 text-[length:var(--text-body)]">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-ink-11">Jumlah paket</dt>
                  <dd className="tabular-nums font-medium text-ink-12">{totalItems} paket</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="inline-flex items-center gap-1.5 text-ink-11">
                    <AccessTimeOutlinedIcon
                      style={{ fontSize: 15 }}
                      className="text-ink-10"
                      aria-hidden="true"
                    />
                    <span>Penyiapan</span>
                  </dt>
                  <dd className="text-[length:var(--text-meta)] text-ink-11">
                    Min. {MAKE_TO_ORDER_LEAD_DAYS} hari
                  </dd>
                </div>
              </dl>

              <div className="hairline-t mt-4 flex items-baseline justify-between gap-4 pt-4">
                <span className="text-[length:var(--text-body)] font-medium text-ink-11">
                  Total harga
                </span>
                <span className="tabular-nums text-[length:var(--text-figure)] font-semibold leading-[var(--leading-figure)] text-[var(--fg-rose-text)]">
                  {formatRupiah(totalPrice)}
                </span>
              </div>

              {hasIssues ? (
                <p className="mt-3 rounded-[var(--radius-control)] bg-[var(--red-3)] px-3 py-2 text-[length:var(--text-meta)] text-[var(--red-11)]">
                  Sesuaikan atau hapus hadiah yang stoknya sedang kosong sebelum lanjut ke data pengiriman.
                </p>
              ) : null}

              <div className="mt-5 space-y-2.5">
                {hasIssues || validating ? (
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-5 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] opacity-45"
                  >
                    <span>
                      {validating ? "Mengecek ketersediaan…" : "Lanjut isi data kirim"}
                    </span>
                    {!validating ? (
                      <ArrowForwardRoundedIcon
                        style={{ fontSize: 17 }}
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                ) : (
                  <Link
                    href="/checkout"
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-5 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.98]"
                  >
                    <span>Lanjut isi data kirim</span>
                    <ArrowForwardRoundedIcon
                      style={{ fontSize: 17 }}
                      aria-hidden="true"
                    />
                  </Link>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/katalog"
                    className="touch-target inline-flex h-[var(--control-h)] items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-ink-2 active:scale-[0.97]"
                  >
                    <Inventory2OutlinedIcon
                      style={{ fontSize: 15 }}
                      aria-hidden="true"
                    />
                    <span>Katalog</span>
                  </Link>
                  <Link
                    href="/custom-gift"
                    className="touch-target inline-flex h-[var(--control-h)] items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-ink-2 active:scale-[0.97]"
                  >
                    <AutoAwesomeOutlinedIcon
                      style={{ fontSize: 15 }}
                      aria-hidden="true"
                    />
                    <span>Rangkai lagi</span>
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Confirm Remove Single Item */}
      <ModalSheet
        open={Boolean(pendingDeleteItem)}
        onClose={() => setPendingDeleteItem(null)}
        title="Hapus hadiah dari keranjang?"
        size="confirm"
        footer={
          <div className="mobile-stack-reverse flex w-full items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setPendingDeleteItem(null)}
              className="inline-flex h-[var(--control-h)] items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-ink-2"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="inline-flex h-[var(--control-h)] items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--red-9)] px-4 text-[length:var(--text-body)] text-[var(--red-contrast)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--red-10)] active:scale-[0.97]"
            >
              <DeleteOutlineRoundedIcon style={{ fontSize: 16 }} aria-hidden="true" />
              <span>Hapus hadiah</span>
            </button>
          </div>
        }
      >
        <p className="text-[length:var(--text-body)] text-ink-11">
          Hadiah{" "}
          <span className="text-ink-12">{pendingDeleteItem?.name}</span> akan dihapus dari keranjang belanja Anda.
        </p>
      </ModalSheet>

      {/* Confirm Clear Entire Cart */}
      <ModalSheet
        open={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        title="Kosongkan keranjang belanja?"
        size="confirm"
        footer={
          <div className="mobile-stack-reverse flex w-full items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmClearOpen(false)}
              className="inline-flex h-[var(--control-h)] items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] transition-colors duration-[var(--dur-hover)] hover:bg-ink-2"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmClear}
              className="inline-flex h-[var(--control-h)] items-center justify-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--red-9)] px-4 text-[length:var(--text-body)] text-[var(--red-contrast)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--red-10)] active:scale-[0.97]"
            >
              <DeleteOutlineRoundedIcon style={{ fontSize: 16 }} aria-hidden="true" />
              <span>Kosongkan semua</span>
            </button>
          </div>
        }
      >
        <p className="text-[length:var(--text-body)] text-ink-11">
          Semua {items.length} jenis hadiah ({totalItems} paket) di keranjang akan dihapus.
        </p>
      </ModalSheet>
    </div>
  );
}
