"use client";

import { useCallback, useEffect, useState } from "react";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { StatusDot } from "@/components/ui/status-dot";
import { useToast } from "@/components/ui/toast";
import { PAYMENT_STATUS_META } from "@/lib/constants";
import { formatDateTimeId, formatRupiah } from "@/lib/format";
import type { Order, PaymentStatus } from "@/types/domain";

export default function AdminPaymentsPage() {
  const { user, adminFetch } = useAdminAuth();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<"Pending" | "Semua">("Pending");
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
    const params = new URLSearchParams({ paymentStatus: filter });
    adminFetch(`/api/admin/orders?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal memuat antrean pembayaran.");
        return res.json();
      })
      .then((data) => {
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat antrean pembayaran."))
      .finally(() => setLoading(false));
  }, [user, filter, adminFetch]);

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
      showToast(`Pembayaran ${targetOrder.orderNumber} diperbarui ke ${nextStatus}.`, "green");
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedToggle
          ariaLabel="Filter pembayaran"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "Pending", label: "Belum diverifikasi" },
            { value: "Semua", label: "Semua" },
          ]}
        />
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
            {filter === "Pending"
              ? "Semua pembayaran sudah diverifikasi."
              : "Belum ada data pembayaran."}
          </p>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
            Pesanan baru akan berstatus Pending sampai admin memverifikasi transfer via WhatsApp.
          </p>
        </div>
      ) : (
        <div className="no-scrollbar mt-4 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                <th scope="col" className="px-3.5">No. Pesanan</th>
                <th scope="col" className="px-3.5">Pelanggan</th>
                <th scope="col" className="px-3.5">Total</th>
                <th scope="col" className="px-3.5">Status</th>
                <th scope="col" className="px-3.5">Terakhir diverifikasi</th>
                <th scope="col" className="px-3.5">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-[var(--line)] text-[length:var(--text-body)]">
              {orders.map((ord, idx) => {
                const meta = PAYMENT_STATUS_META[ord.paymentStatus];
                return (
                  <tr
                    key={ord.id}
                    className={`h-[var(--row-h)] ${
                      idx % 2 === 0 ? "bg-[var(--raised)]" : "bg-ink-2"
                    }`}
                  >
                    <td className="tabular-nums px-3.5 text-ink-12">
                      {ord.orderNumber}
                    </td>
                    <td className="max-w-[32ch] truncate px-3.5 text-ink-11">
                      {ord.customer.buyerName}
                    </td>
                    <td className="tabular-nums px-3.5 text-ink-11">
                      {formatRupiah(ord.totalPrice)}
                    </td>
                    <td className="px-3.5">
                      <StatusDot tone={meta.tone} label={meta.label} />
                    </td>
                    <td className="tabular-nums px-3.5 text-ink-11">
                      {ord.verifiedAt
                        ? `${ord.verifiedBy || "Admin"} · ${formatDateTimeId(ord.verifiedAt)}`
                        : "Belum diverifikasi"}
                    </td>
                    <td className="px-3.5">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetOrder(ord);
                          setNextStatus("Paid");
                          setNote("");
                        }}
                        className="inline-flex h-[var(--control-h-inline)] items-center rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-3"
                      >
                        Verifikasi
                      </button>
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
            ? `Verifikasi pembayaran ${targetOrder.orderNumber}`
            : "Verifikasi pembayaran"
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
                  ? "Verifikasi Paid"
                  : nextStatus === "Rejected"
                    ? "Tolak pembayaran"
                    : `Simpan (${nextStatus})`}
            </button>
          </>
        }
      >
        {targetOrder ? (
          <div className="space-y-4">
            <div className="rounded-[var(--radius-control)] bg-ink-2 p-3 text-[length:var(--text-body)]">
              <p className="text-ink-12">
                {targetOrder.customer.buyerName} · {targetOrder.customer.whatsapp}
              </p>
              <p className="tabular-nums mt-0.5 text-ink-11">
                Total tagihan: {formatRupiah(targetOrder.totalPrice)}
              </p>
            </div>

            <div>
              <label
                htmlFor="pay-status-select"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                Pilih status verifikasi
              </label>
              <select
                id="pay-status-select"
                value={nextStatus}
                onChange={(e) => setNextStatus(e.target.value as PaymentStatus)}
                className="mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-body)] text-ink-12"
              >
                <option value="Paid">Paid</option>
                <option value="Rejected">Rejected</option>
                <option value="Refunded">Refunded</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="pay-note"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                Catatan verifikasi <span className="text-ink-10">(opsional)</span>
              </label>
              <textarea
                id="pay-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Bukti transfer BCA via WA diterima"
                className="mt-1.5 min-h-20 w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
              />
            </div>
          </div>
        ) : null}
      </ModalSheet>
    </div>
  );
}
