"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import { CopyPill } from "@/components/ui/copy-pill";
import { PillBadge } from "@/components/ui/pill-badge";
import { StatusDot } from "@/components/ui/status-dot";
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from "@/lib/constants";
import { formatDateId, formatRupiah } from "@/lib/format";
import type { Order } from "@/types/domain";

interface OrderLookupResponse {
  order: Omit<Order, "accessToken" | "idempotencyKey">;
  whatsappUrl: string;
  whatsappMessage: string;
}

export default function OrderConfirmationPage() {
  const params = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const orderNumber = params.orderNumber;
  const token = searchParams.get("t") || "";

  const [data, setData] = useState<OrderLookupResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      `/api/orders/${encodeURIComponent(orderNumber)}?t=${encodeURIComponent(token)}`
    )
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Gagal memuat detail pesanan.");
        }
        if (!cancelled) setData(json);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat detail pesanan."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderNumber, token]);

  if (loading) {
    return (
      <div className="mx-auto max-w-[440px] px-4 py-10 md:px-6">
        <div className="h-64 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-[440px] px-4 py-12 md:px-6">
        <div className="rounded-[var(--radius-container)] bg-ink-2 p-11 text-center">
          <p className="text-[length:var(--text-body)] text-ink-12">
            {error || "Pesanan tidak ditemukan."}
          </p>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
            Pastikan Anda membuka tautan lengkap dari halaman konfirmasi pemesanan.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    );
  }

  const { order, whatsappUrl, whatsappMessage } = data;
  const orderMeta = ORDER_STATUS_META[order.orderStatus] ?? ORDER_STATUS_META.Pending;
  const paymentMeta =
    PAYMENT_STATUS_META[order.paymentStatus] ?? PAYMENT_STATUS_META.Pending;

  const topBadge: {
    tone: "plum" | "amber" | "blue" | "green" | "red" | "neutral";
    text: string;
  } =
    order.orderStatus === "Cancelled"
      ? { tone: "red", text: "Pesanan dibatalkan" }
      : order.paymentStatus === "Rejected"
        ? { tone: "red", text: "Pembayaran ditolak" }
        : order.paymentStatus === "Refunded"
          ? { tone: "neutral", text: "Dana dikembalikan" }
          : order.orderStatus === "Completed"
            ? { tone: "green", text: "Pesanan selesai" }
            : order.orderStatus === "Ready"
              ? { tone: "plum", text: "Pesanan siap diambil/dikirim" }
              : order.orderStatus === "Processing"
                ? { tone: "blue", text: "Pesanan sedang disiapkan" }
                : order.paymentStatus === "Paid"
                  ? { tone: "green", text: "Pembayaran lunas" }
                  : { tone: "amber", text: "Menunggu konfirmasi pembayaran" };

  const statusGuidance =
    order.orderStatus === "Cancelled"
      ? "Pesanan ini telah dibatalkan. Hubungi admin melalui WhatsApp jika Anda membutuhkan bantuan atau ingin memesan ulang."
      : order.paymentStatus === "Rejected"
        ? "Pembayaran belum dapat kami terima. Silakan hubungi admin melalui WhatsApp untuk mengecek ulang bukti transfer Anda."
        : order.paymentStatus === "Refunded"
          ? "Dana pembayaran untuk pesanan ini telah dikembalikan. Hubungi admin via WhatsApp jika ada pertanyaan."
          : order.orderStatus === "Completed"
            ? "Pesanan Anda sudah selesai. Terima kasih telah mempercayai FairyGift."
            : order.orderStatus === "Ready"
              ? "Pesanan Anda sudah siap! Hubungi admin melalui WhatsApp untuk koordinasi pengambilan atau pengiriman."
              : order.paymentStatus === "Paid"
                ? "Pembayaran Anda sudah kami terima. Tim kami sedang menyiapkan kado Anda."
                : "Pesanan Anda sudah tercatat. Klik tombol di bawah lalu tekan Kirim di WhatsApp agar admin dapat mengirim instruksi pembayaran.";

  return (
    <div className="mx-auto max-w-[500px] px-4 py-8 md:px-6 md:py-12">
      <div className="surface-raised rounded-[20px] border-[0.5px] border-[var(--line)] bg-[var(--raised)] p-6 shadow-[var(--shadow-card)]">
        <PillBadge tone={topBadge.tone} size="md">
          {topBadge.text}
        </PillBadge>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[length:var(--text-meta)] text-ink-11">
              Nomor pesanan
            </p>
            <h1 className="tabular-nums font-mono text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12">
              {order.orderNumber}
            </h1>
          </div>

          <CopyPill
            text={order.orderNumber}
            label="Salin"
            copiedLabel="Disalin"
            ariaLabel="Salin nomor pesanan"
          />
        </div>

        {/* Ringkasan Tersimpan */}
        <div className="hairline-frame mt-5 divide-y-[0.5px] divide-[var(--line)] rounded-[var(--radius-container)] bg-ink-2">
          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[length:var(--text-body)]">
            <span className="text-ink-11">Pemesan</span>
            <span className="text-ink-12">{order.customer.buyerName}</span>
          </div>

          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[length:var(--text-body)]">
            <span className="text-ink-11">Jadwal kirim/ambil</span>
            <span className="tabular-nums text-ink-12">
              {formatDateId(order.customer.deliveryDate)}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[length:var(--text-body)]">
            <span className="text-ink-11">Status pesanan</span>
            <StatusDot
              tone={orderMeta.tone}
              ping={orderMeta.ping}
              muted={order.orderStatus === "Cancelled"}
              label={orderMeta.label}
            />
          </div>

          <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-[length:var(--text-body)]">
            <span className="text-ink-11">Status pembayaran</span>
            <StatusDot
              tone={paymentMeta.tone}
              muted={order.paymentStatus === "Refunded"}
              label={paymentMeta.label}
            />
          </div>

          <div className="px-3.5 py-2.5 text-[length:var(--text-body)]">
            <p className="text-[length:var(--text-meta)] text-ink-11">
              Rincian pesanan
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {order.items.map((item, idx) => (
                <li key={idx} className="text-ink-12">
                  <div className="flex items-start justify-between gap-2">
                    <span>
                      {item.name} ({item.quantity}x)
                    </span>
                    <span className="tabular-nums shrink-0">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>
                  {item.type === "custom_gift" ? (
                    <p className="mt-0.5 break-words text-[length:var(--text-meta)] text-ink-11">
                      {item.customization.selectedColor.name}
                      {item.customization.selectedDesign
                        ? ` (${item.customization.selectedDesign})`
                        : ""}{" "}
                      · {item.customization.components.map((c) => c.name).join(", ")}
                      {item.customization.greetingMessage
                        ? ` · Kartu: "${item.customization.greetingMessage}"`
                        : ""}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-baseline justify-between gap-3 px-3.5 py-3">
            <span className="text-[length:var(--text-body)] text-ink-11">
              Total harga
            </span>
            <span className="tabular-nums text-[length:var(--text-title)] text-[var(--fg-rose-text)]">
              {formatRupiah(order.totalPrice)}
            </span>
          </div>
        </div>

        <p className="mt-4 text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-11">
          {statusGuidance}
        </p>

        {/* Satu-satunya Primary CTA */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.98]"
        >
          <ChatOutlinedIcon style={{ fontSize: 17 }} aria-hidden="true" />
          <span>
            {order.paymentStatus === "Pending" && order.orderStatus !== "Cancelled"
              ? "Konfirmasi pesanan via WhatsApp"
              : "Hubungi admin via WhatsApp"}
          </span>
        </a>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <CopyPill
            text={whatsappMessage}
            label="Salin pesan WhatsApp"
            copiedLabel="Pesan disalin"
          />

          <Link
            href="/"
            className="inline-flex h-[var(--control-h-compact)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
          >
            Kembali ke beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
