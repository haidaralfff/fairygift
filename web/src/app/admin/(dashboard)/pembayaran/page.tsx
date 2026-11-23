"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { CopyPill } from "@/components/ui/copy-pill";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { PillBadge } from "@/components/ui/pill-badge";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { StatusDot } from "@/components/ui/status-dot";
import { useToast } from "@/components/ui/toast";
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from "@/lib/constants";
import {
  formatDateId,
  formatDateTimeId,
  formatRupiah,
  normalizeWhatsAppNumber,
} from "@/lib/format";
import type { Order, PaymentStatus } from "@/types/domain";

type PaymentFilter = "Pending" | "Paid" | "Rejected" | "Refunded" | "Semua";

const QUICK_NOTES = [
  "Transfer BCA via WA sudah diterima",
  "Pembayaran QRIS sudah masuk",
  "Bukti transfer belum sesuai",
  "Dana sudah dikembalikan ke pembeli",
];

export default function AdminPaymentsPage() {
  const { user, adminFetch } = useAdminAuth();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<PaymentFilter>("Pending");
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [targetOrder, setTargetOrder] = useState<Order | null>(null);
  const [nextStatus, setNextStatus] = useState<PaymentStatus>("Paid");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const loadPayments = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      paymentStatus: filter,
      q: query,
    });
    adminFetch(`/api/admin/orders?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal memuat antrean pembayaran.");
        return res.json();
      })
      .then((data) => {
        const rawList: Order[] = Array.isArray(data.orders) ? data.orders : [];
        // Keep queue count consistent with Overview badge by excluding Cancelled orders from "Belum diverifikasi"
        const filtered =
          filter === "Pending"
            ? rawList.filter((o) => o.orderStatus !== "Cancelled")
            : rawList;
        setOrders(filtered);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Gagal memuat antrean pembayaran.")
      )
      .finally(() => setLoading(false));
  }, [user, filter, query, adminFetch]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  async function handleConfirmVerification() {
    if (!targetOrder) return;
    setSaving(true);
    try {
      const res = await adminFetch(
        `/api/admin/orders/${encodeURIComponent(targetOrder.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentStatus: nextStatus, note: note.trim() }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan verifikasi.");
      setTargetOrder(null);
      setNote("");
      showToast(
        `Pembayaran ${targetOrder.orderNumber} diubah menjadi ${PAYMENT_STATUS_META[nextStatus].label}.`,
        "green"
      );
      window.dispatchEvent(new Event("fairygift:admin-refresh-overview"));
      loadPayments();
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memperbarui status pembayaran.",
        "red"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedToggle
          ariaLabel="Filter status pembayaran"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "Pending", label: "Belum Dicek" },
            { value: "Paid", label: "Lunas" },
            { value: "Rejected", label: "Ditolak" },
            { value: "Refunded", label: "Dana Dikembalikan" },
            { value: "Semua", label: "Semua" },
          ]}
        />

        <div className="relative w-full lg:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-10"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari no. pesanan / nama / WA…"
            aria-label="Cari pembayaran"
            className="h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 pr-3 pl-8 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="mt-4 h-56 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
      ) : error ? (
        <div className="mt-6 rounded-[var(--radius-container)] bg-ink-2 p-10 text-center">
          <p className="text-[length:var(--text-body)] text-ink-12">{error}</p>
          <button
            type="button"
            onClick={loadPayments}
            className="mt-4 inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
          >
            Coba lagi
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-container)] bg-ink-2 p-11 text-center">
          <p className="text-[length:var(--text-body)] text-ink-12">
            {filter === "Pending" && !query.trim()
              ? "Semua pembayaran aktif sudah diperiksa."
              : "Tidak ada data pembayaran yang cocok."}
          </p>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
            {query.trim()
              ? "Coba ubah kata kunci pencarian atau pilih filter status lain."
              : "Pesanan baru akan berstatus Belum Dibayar sampai admin mengonfirmasi transfer pembeli lewat WhatsApp."}
          </p>
        </div>
      ) : (
        <div className="no-scrollbar mt-4 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                <th scope="col" className="px-3.5">No. Pesanan</th>
                <th scope="col" className="px-3.5">Pelanggan</th>
                <th scope="col" className="px-3.5">Jadwal</th>
                <th scope="col" className="px-3.5">Total</th>
                <th scope="col" className="px-3.5">Pembayaran</th>
                <th scope="col" className="px-3.5">Pesanan</th>
                <th scope="col" className="px-3.5">Terakhir diperiksa</th>
                <th scope="col" className="px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-[var(--line)] text-[length:var(--text-body)]">
              {orders.map((ord, idx) => {
                const payMeta = PAYMENT_STATUS_META[ord.paymentStatus];
                const ordMeta = ORDER_STATUS_META[ord.orderStatus];
                return (
                  <tr
                    key={ord.id}
                    className={`h-[var(--row-h)] ${
                      idx % 2 === 0 ? "bg-[var(--raised)]" : "bg-ink-2"
                    } ${ord.orderStatus === "Cancelled" ? "opacity-55" : ""}`}
                  >
                    <td className="tabular-nums px-3.5 font-mono text-ink-12">
                      {ord.orderNumber}
                    </td>
                    <td
                      className="max-w-[26ch] truncate px-3.5 text-ink-11"
                      title={`${ord.customer.buyerName} (${ord.customer.whatsapp})`}
                    >
                      {ord.customer.buyerName}
                    </td>
                    <td className="tabular-nums px-3.5 text-ink-11">
                      {formatDateId(ord.customer.deliveryDate)}
                    </td>
                    <td className="tabular-nums px-3.5 text-ink-12">
                      {formatRupiah(ord.totalPrice)}
                    </td>
                    <td className="px-3.5">
                      <StatusDot tone={payMeta.tone} label={payMeta.label} />
                    </td>
                    <td className="px-3.5">
                      <StatusDot
                        tone={ordMeta.tone}
                        label={ordMeta.label}
                        ping={ordMeta.ping}
                      />
                    </td>
                    <td className="tabular-nums px-3.5 text-[length:var(--text-meta)] text-ink-11">
                      {ord.verifiedAt
                        ? `${ord.verifiedBy || "Admin"} · ${formatDateTimeId(ord.verifiedAt)}`
                        : "Belum diperiksa"}
                    </td>
                    <td className="px-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/pesanan?open=${encodeURIComponent(ord.id)}`}
                          className="inline-flex h-[var(--control-h-inline)] items-center rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-11 shadow-[var(--shadow-button)] hover:bg-ink-3 hover:text-ink-12"
                        >
                          Detail
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setTargetOrder(ord);
                            setNextStatus(
                              ord.paymentStatus === "Pending" ? "Paid" : ord.paymentStatus
                            );
                            setNote("");
                          }}
                          className="inline-flex h-[var(--control-h-inline)] items-center rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-3"
                        >
                          Konfirmasi bayar
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ModalSheet
        open={Boolean(targetOrder)}
        onClose={() => setTargetOrder(null)}
        title={
          targetOrder
            ? `Konfirmasi pembayaran ${targetOrder.orderNumber}`
            : "Konfirmasi pembayaran"
        }
        size="confirm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setTargetOrder(null)}
              className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleConfirmVerification}
              className={`inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] px-4 text-[length:var(--text-body)] ${
                nextStatus === "Rejected"
                  ? "bg-[var(--red-9)] text-[var(--red-contrast)]"
                  : "bg-[var(--primary-bg)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)]"
              }`}
            >
              {saving
                ? "Menyimpan…"
                : nextStatus === "Paid"
                  ? "Tandai Lunas"
                  : nextStatus === "Rejected"
                    ? "Tolak Pembayaran"
                    : nextStatus === "Refunded"
                      ? "Simpan Pengembalian Dana"
                      : "Simpan Belum Dibayar"}
            </button>
          </>
        }
      >
        {targetOrder ? (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-control)] bg-ink-2 p-3.5 text-[length:var(--text-body)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-ink-12">{targetOrder.customer.buyerName}</p>
                <PillBadge tone={ORDER_STATUS_META[targetOrder.orderStatus].tone}>
                  Pesanan: {ORDER_STATUS_META[targetOrder.orderStatus].label}
                </PillBadge>
              </div>
              <p className="tabular-nums mt-1 text-[length:var(--text-title)] text-ink-12">
                {formatRupiah(targetOrder.totalPrice)}
              </p>
              <p className="mt-1 text-[length:var(--text-meta)] text-ink-11">
                {targetOrder.items.map((it) => `${it.name} (${it.quantity}x)`).join(", ")} ·{" "}
                {formatDateId(targetOrder.customer.deliveryDate)}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[length:var(--text-meta)] text-ink-11">
                  {targetOrder.customer.whatsapp}
                </span>
                <CopyPill text={targetOrder.customer.whatsapp} label="Salin" />
                <a
                  href={`https://wa.me/${normalizeWhatsAppNumber(
                    targetOrder.customer.whatsapp
                  )}?text=${encodeURIComponent(
                    `Halo ${targetOrder.customer.buyerName}, kami dari FairyGift mengonfirmasi pembayaran pesanan ${targetOrder.orderNumber} sebesar ${formatRupiah(targetOrder.totalPrice)}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-[var(--control-h-pill)] items-center gap-1 rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-toggle)] hover:bg-ink-3"
                >
                  <MessageCircle className="size-3.5" aria-hidden="true" />
                  <span>Chat WhatsApp</span>
                </a>
              </div>
            </div>

            {targetOrder.orderStatus === "Cancelled" ? (
              <p className="rounded-[var(--radius-control)] bg-[var(--amber-3)] px-3 py-2 text-[length:var(--text-meta)] text-[var(--amber-11)]">
                Pesanan ini sudah dibatalkan. Anda dapat menandai pembayaran sebagai Ditolak atau Dana Dikembalikan; hindari menandai Lunas sebelum pesanan diaktifkan kembali.
              </p>
            ) : null}

            <div>
              <label
                htmlFor="pay-status-select"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                Pilih status pembayaran
              </label>
              <select
                id="pay-status-select"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as PaymentStatus)}
                className="mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-body)] text-ink-12"
              >
                <option value="Paid">Lunas (Pembayaran sudah diterima)</option>
                <option value="Rejected">Ditolak (Bukti tidak sesuai / batal)</option>
                <option value="Refunded">Dana Dikembalikan (Sudah transfer balik)</option>
                <option value="Pending">Belum Dibayar (Menunggu transfer)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pay-note"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                Catatan verifikasi <span className="text-ink-10">(opsional)</span>
              </label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {QUICK_NOTES.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setNote(preset)}
                    className="inline-flex h-[var(--control-h-inline)] items-center rounded-full border-[0.5px] border-[var(--line)] bg-ink-2 px-2.5 text-[length:var(--text-meta)] text-ink-11 transition-colors hover:bg-ink-3 hover:text-ink-12"
                  >
                    {preset}
                  </button>
                ))}
              </div>
              <textarea
                id="pay-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bukti transfer BCA via WA diterima"
                className="mt-2 min-h-20 w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
              />
            </div>
          </div>
        ) : null}
      </ModalSheet>
    </div>
  );
}
