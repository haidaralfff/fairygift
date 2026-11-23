"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ChatOutlinedIcon from "@mui/icons-material/ChatOutlined";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { CopyPill } from "@/components/ui/copy-pill";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { PillBadge } from "@/components/ui/pill-badge";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { StatusDot } from "@/components/ui/status-dot";
import { useToast } from "@/components/ui/toast";
import {
  ORDER_STATUS_LIST,
  ORDER_STATUS_META,
  PAYMENT_STATUS_LIST,
  PAYMENT_STATUS_META,
} from "@/lib/constants";
import {
  formatDateId,
  formatDateTimeId,
  formatRupiah,
  normalizeWhatsAppNumber,
} from "@/lib/format";
import type { Order, OrderStatus, PaymentLog, PaymentStatus } from "@/types/domain";

const PAGE_SIZE = 20;

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialOpenId = searchParams.get("open") || "";
  const initialOrderStatus = searchParams.get("orderStatus") || "Semua";
  const initialPaymentStatus = searchParams.get("paymentStatus") || "Semua";
  const initialSort = searchParams.get("sort") === "deadline" ? "deadline" : "newest";
  const handledOpenIdRef = useRef<string | null>(null);

  const { user, adminFetch } = useAdminAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(initialOrderStatus);
  const [paymentFilter, setPaymentFilter] = useState<string>(initialPaymentStatus);
  const [sortBy, setSortBy] = useState<"newest" | "deadline">(initialSort);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [paymentLogs, setPaymentLogs] = useState<PaymentLog[]>([]);
  const [draftOrderStatus, setDraftOrderStatus] = useState<OrderStatus>("Pending");
  const [savingStatus, setSavingStatus] = useState(false);

  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [draftPaymentStatus, setDraftPaymentStatus] = useState<PaymentStatus>("Paid");
  const [verifyNote, setVerifyNote] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (
      initialOrderStatus === "Semua" ||
      ORDER_STATUS_LIST.includes(initialOrderStatus as OrderStatus)
    ) {
      setStatusFilter(initialOrderStatus);
    }
  }, [initialOrderStatus]);

  useEffect(() => {
    if (
      initialPaymentStatus === "Semua" ||
      PAYMENT_STATUS_LIST.includes(initialPaymentStatus as PaymentStatus)
    ) {
      setPaymentFilter(initialPaymentStatus);
    }
  }, [initialPaymentStatus]);

  useEffect(() => {
    setSortBy(initialSort);
  }, [initialSort]);

  useEffect(() => {
    handledOpenIdRef.current = null;
  }, [initialOpenId]);

  const loadOrders = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      orderStatus: statusFilter,
      paymentStatus: paymentFilter,
      sort: sortBy,
      q: query,
    });
    adminFetch(`/api/admin/orders?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal memuat daftar pesanan.");
        return res.json();
      })
      .then((data) => {
        const list: Order[] = Array.isArray(data.orders) ? data.orders : [];
        setOrders(list);
        setPage(1);
        if (initialOpenId && handledOpenIdRef.current !== initialOpenId) {
          const found = list.find((o) => o.id === initialOpenId);
          if (found) {
            handledOpenIdRef.current = initialOpenId;
            openOrderDetail(found);
          }
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat daftar pesanan."))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, statusFilter, paymentFilter, sortBy, query]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function openOrderDetail(order: Order) {
    setSelectedOrder(order);
    setDraftOrderStatus(order.orderStatus);
    setPaymentLogs([]);
    adminFetch(`/api/admin/orders/${encodeURIComponent(order.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.paymentLogs) setPaymentLogs(data.paymentLogs);
      })
      .catch(() => {});
  }

  async function handleSaveOrderStatus() {
    if (!selectedOrder) return;
    setSavingStatus(true);
    try {
      const res = await adminFetch(
        `/api/admin/orders/${encodeURIComponent(selectedOrder.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderStatus: draftOrderStatus }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal memperbarui status pesanan.");

      setOrders((prev) =>
        prev.map((o) =>
          o.id === selectedOrder.id
            ? { ...o, orderStatus: draftOrderStatus, stockRestored: data.stockRestored }
            : o
        )
      );
      setSelectedOrder((prev) =>
        prev
          ? { ...prev, orderStatus: draftOrderStatus, stockRestored: data.stockRestored }
          : null
      );
      window.dispatchEvent(new Event("fairygift:admin-refresh-overview"));
      showToast(
        `Status pesanan diubah menjadi ${ORDER_STATUS_META[draftOrderStatus].label}.`,
        "green"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memperbarui status pesanan.",
        "red"
      );
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleVerifyPayment(nextStatus: PaymentStatus) {
    if (!selectedOrder) return;
    setVerifying(true);
    try {
      const res = await adminFetch(
        `/api/admin/orders/${encodeURIComponent(selectedOrder.id)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: nextStatus,
            note: verifyNote.trim(),
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Gagal memverifikasi pembayaran.");

      const updatedOrder: Order = {
        ...selectedOrder,
        paymentStatus: nextStatus,
        stockRestored: data.stockRestored,
        verifiedAt: data.verifiedAt,
        verifiedBy: data.verifiedBy,
      };
      setOrders((prev) =>
        prev.map((o) => (o.id === selectedOrder.id ? updatedOrder : o))
      );
      setVerifyModalOpen(false);
      setVerifyNote("");
      openOrderDetail(updatedOrder);
      window.dispatchEvent(new Event("fairygift:admin-refresh-overview"));
      showToast(
        `Status pembayaran diubah menjadi ${PAYMENT_STATUS_META[nextStatus].label}.`,
        "green"
      );
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Gagal memverifikasi pembayaran.",
        "red"
      );
    } finally {
      setVerifying(false);
    }
  }

  function resetFilters() {
    setStatusFilter("Semua");
    setPaymentFilter("Semua");
    setSortBy("newest");
    setQuery("");
  }

  const hasActiveFilter =
    statusFilter !== "Semua" ||
    paymentFilter !== "Semua" ||
    sortBy !== "newest" ||
    query.trim().length > 0;

  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));
  const pagedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const showUnpaidWarning =
    selectedOrder &&
    selectedOrder.paymentStatus === "Pending" &&
    (draftOrderStatus === "Processing" ||
      draftOrderStatus === "Ready" ||
      draftOrderStatus === "Completed");

  const receiptPath = selectedOrder?.accessToken
    ? `/pesanan/${encodeURIComponent(selectedOrder.orderNumber)}?t=${encodeURIComponent(
        selectedOrder.accessToken
      )}`
    : null;
  const receiptFullUrl =
    receiptPath && typeof window !== "undefined"
      ? `${window.location.origin}${receiptPath}`
      : receiptPath;

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <SegmentedToggle
            ariaLabel="Filter status pesanan"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "Semua", label: "Semua" },
              ...ORDER_STATUS_LIST.map((st) => ({
                value: st,
                label: ORDER_STATUS_META[st].label,
              })),
            ]}
          />

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Filter status pembayaran"
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-body)] text-ink-12 focus:bg-ink-4 focus:outline-none"
            >
              <option value="Semua">Semua status bayar</option>
              {PAYMENT_STATUS_LIST.map((ps) => (
                <option key={ps} value={ps}>
                  {PAYMENT_STATUS_META[ps].label}
                </option>
              ))}
            </select>

            <select
              aria-label="Urutkan pesanan"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "newest" | "deadline")}
              className="h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-body)] text-ink-12 focus:bg-ink-4 focus:outline-none"
            >
              <option value="newest">Terbaru</option>
              <option value="deadline">Jadwal kirim terdekat</option>
            </select>

            <div className="relative flex-1 sm:w-56 sm:flex-none">
              <SearchRoundedIcon
                style={{ fontSize: 15 }}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-10"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari no. pesanan / nama…"
                aria-label="Cari pesanan"
                className="h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 pr-3 pl-8 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none"
              />
            </div>

            {hasActiveFilter ? (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-11 shadow-[var(--shadow-button)] hover:text-ink-12"
              >
                Hapus filter
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="mt-4 h-64 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
      ) : error ? (
        <div className="mt-6 rounded-[var(--radius-container)] bg-ink-2 p-10 text-center">
          <p className="text-[length:var(--text-body)] text-ink-12">{error}</p>
          <button
            type="button"
            onClick={loadOrders}
            className="mt-4 inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
          >
            Coba lagi
          </button>
        </div>
      ) : pagedOrders.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-container)] bg-ink-2 p-11 text-center">
          <p className="text-[length:var(--text-body)] text-ink-12">
            Tidak ada pesanan yang cocok.
          </p>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
            {hasActiveFilter
              ? "Coba ubah kata kunci pencarian atau hapus filter yang aktif."
              : "Pesanan pelanggan yang masuk setelah pemesanan akan tampil di tabel ini."}
          </p>
          {hasActiveFilter ? (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-4 inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
            >
              Tampilkan semua pesanan
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="no-scrollbar mt-4 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                  <th scope="col" className="sticky left-0 z-10 bg-ink-2 px-3.5">
                    No. Pesanan
                  </th>
                  <th scope="col" className="px-3.5">Pelanggan</th>
                  <th scope="col" className="px-3.5">Tanggal Kirim/Ambil</th>
                  <th scope="col" className="px-3.5">Total</th>
                  <th scope="col" className="px-3.5">Pembayaran</th>
                  <th scope="col" className="px-3.5">Pesanan</th>
                  <th scope="col" className="px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-[var(--line)] text-[length:var(--text-body)]">
                {pagedOrders.map((ord, idx) => {
                  const payMeta = PAYMENT_STATUS_META[ord.paymentStatus];
                  const ordMeta = ORDER_STATUS_META[ord.orderStatus];
                  const rowBg = idx % 2 === 0 ? "bg-[var(--raised)]" : "bg-ink-2";
                  return (
                    <tr
                      key={ord.id}
                      className={`h-[var(--row-h)] ${rowBg} ${
                        ord.orderStatus === "Cancelled" ? "opacity-55" : ""
                      }`}
                    >
                      <td
                        className={`tabular-nums sticky left-0 z-10 px-3.5 font-mono text-ink-12 ${rowBg}`}
                      >
                        {ord.orderNumber}
                      </td>
                      <td
                        className="max-w-[32ch] truncate px-3.5 text-ink-11"
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
                      <td className="px-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => openOrderDetail(ord)}
                          className="inline-flex h-[var(--control-h-inline)] items-center rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-3"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pager outside table */}
          <div className="mt-3 flex items-center justify-between gap-3 text-[length:var(--text-meta)] text-ink-11">
            <span className="tabular-nums">
              Menampilkan {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, orders.length)} dari {orders.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="inline-flex h-[var(--control-h-pill)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-ink-12 shadow-[var(--shadow-button)] disabled:opacity-45"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="inline-flex h-[var(--control-h-pill)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-ink-12 shadow-[var(--shadow-button)] disabled:opacity-45"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </>
      )}

      {/* Order Detail Side Panel (Desktop 440px / Mobile Sheet) */}
      <ModalSheet
        open={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Pesanan ${selectedOrder.orderNumber}` : "Detail pesanan"}
        size="side"
        footer={
          selectedOrder ? (
            <>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraftPaymentStatus(
                    selectedOrder.paymentStatus === "Pending"
                      ? "Paid"
                      : selectedOrder.paymentStatus
                  );
                  setVerifyModalOpen(true);
                }}
                className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--primary-bg)] px-4 text-[length:var(--text-body)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)]"
              >
                {selectedOrder.paymentStatus === "Pending"
                  ? "Konfirmasi pembayaran"
                  : "Ubah status bayar"}
              </button>
            </>
          ) : null
        }
      >
        {selectedOrder ? (
          <div className="space-y-5">
            {/* Separate Status Badges + Quick Receipt Share */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <PillBadge tone={PAYMENT_STATUS_META[selectedOrder.paymentStatus].tone}>
                  Pembayaran: {PAYMENT_STATUS_META[selectedOrder.paymentStatus].label}
                </PillBadge>
                <PillBadge tone={ORDER_STATUS_META[selectedOrder.orderStatus].tone}>
                  Pesanan: {ORDER_STATUS_META[selectedOrder.orderStatus].label}
                </PillBadge>
              </div>
              {receiptFullUrl ? (
                <CopyPill
                  text={receiptFullUrl}
                  label="Salin tautan struk"
                  copiedLabel="Tautan disalin"
                />
              ) : null}
            </div>

            {selectedOrder.stockRestored ? (
              <p className="rounded-[var(--radius-control)] bg-ink-2 px-3 py-2 text-[length:var(--text-meta)] text-ink-11">
                Stok isi kado custom untuk pesanan ini sudah dikembalikan otomatis.
              </p>
            ) : null}

            {/* Customer & Delivery */}
            <div className="hairline-frame divide-y-[0.5px] divide-[var(--line)] rounded-[var(--radius-control)] bg-ink-2 text-[length:var(--text-body)]">
              <div className="px-3.5 py-2.5">
                <p className="text-[length:var(--text-meta)] text-ink-10">Pemesan & Penerima</p>
                <p className="mt-0.5 text-ink-12">
                  {selectedOrder.customer.buyerName}
                  {selectedOrder.customer.recipientName &&
                  selectedOrder.customer.recipientName !== selectedOrder.customer.buyerName
                    ? ` (Untuk: ${selectedOrder.customer.recipientName})`
                    : ""}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[length:var(--text-meta)] text-ink-12">
                    {selectedOrder.customer.whatsapp}
                  </span>
                  <CopyPill text={selectedOrder.customer.whatsapp} label="Salin" />
                  <a
                    href={`https://wa.me/${normalizeWhatsAppNumber(
                      selectedOrder.customer.whatsapp
                    )}?text=${encodeURIComponent(
                      `Halo ${selectedOrder.customer.buyerName}, kami dari FairyGift menginformasikan pesanan ${selectedOrder.orderNumber} (${formatRupiah(selectedOrder.totalPrice)}).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-[var(--control-h-pill)] items-center gap-1 rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-toggle)] hover:bg-ink-3"
                  >
                    <ChatOutlinedIcon style={{ fontSize: 14 }} aria-hidden="true" />
                    <span>Chat WhatsApp</span>
                  </a>
                </div>
              </div>

              <div className="px-3.5 py-2.5">
                <p className="text-[length:var(--text-meta)] text-ink-10">
                  Metode & Jadwal
                </p>
                <p className="mt-0.5 text-ink-12">
                  {selectedOrder.customer.deliveryMethod === "delivery"
                    ? "Diantar ke alamat"
                    : "Ambil di toko"}{" "}
                  · {formatDateId(selectedOrder.customer.deliveryDate)}
                </p>
                {selectedOrder.customer.address ? (
                  <p className="mt-1 break-words text-[length:var(--text-meta)] text-ink-11">
                    {selectedOrder.customer.address}
                  </p>
                ) : null}
                {selectedOrder.customer.notes ? (
                  <p className="mt-1 break-words text-[length:var(--text-meta)] text-ink-11">
                    Catatan: {selectedOrder.customer.notes}
                  </p>
                ) : null}
              </div>
            </div>

            {/* Items & Full Customization Details */}
            <div className="hairline-frame divide-y-[0.5px] divide-[var(--line)] rounded-[var(--radius-control)] bg-ink-2 text-[length:var(--text-body)]">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="px-3.5 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-ink-12">
                      {item.name} ({item.quantity}x)
                    </p>
                    <span className="tabular-nums shrink-0 text-ink-12">
                      {formatRupiah(item.subtotal)}
                    </span>
                  </div>

                  {item.type === "custom_gift" ? (
                    <div className="mt-2 space-y-1 text-[length:var(--text-meta)] text-ink-11">
                      <p className="flex flex-wrap items-center gap-1.5">
                        <span>Kemasan: {item.customization.packagingName}</span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--raised)] px-2 py-0.5 text-ink-12">
                          <span
                            className="size-2 rounded-full border border-ink-6"
                            style={{
                              backgroundColor: item.customization.selectedColor.hex,
                            }}
                            aria-hidden="true"
                          />
                          {item.customization.selectedColor.name},{" "}
                          {item.customization.selectedDesign}
                        </span>
                        <span>— {formatRupiah(item.customization.packagingPrice)}</span>
                      </p>
                      <p>
                        Isi:{" "}
                        {item.customization.components
                          .map(
                            (c) =>
                              `${c.name} (${c.quantity}x · ${formatRupiah(
                                c.price * c.quantity
                              )})`
                          )
                          .join(", ")}
                      </p>
                      <p>Desain kartu: {item.customization.cardDesignName}</p>
                      <div className="mt-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] p-2.5 text-ink-12">
                        <p className="text-[length:var(--text-meta)] text-ink-10">
                          Pesan kartu ucapan lengkap:
                        </p>
                        <p className="mt-0.5 break-words">
                          {item.customization.greetingMessage || "(Tanpa pesan)"}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ))}
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-ink-11">Total tagihan</span>
                <span className="tabular-nums text-[length:var(--text-title)] text-ink-12">
                  {formatRupiah(selectedOrder.totalPrice)}
                </span>
              </div>
            </div>

            {/* Separate Order Status Control */}
            <div className="space-y-2.5">
              <label
                htmlFor="detail-order-status"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                Perbarui status pesanan
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="detail-order-status"
                  value={draftOrderStatus}
                  onChange={(e) => setDraftOrderStatus(e.target.value as OrderStatus)}
                  className="h-[var(--control-h)] flex-1 rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-body)] text-ink-12 focus:bg-ink-4 focus:outline-none"
                >
                  {ORDER_STATUS_LIST.map((st) => (
                    <option key={st} value={st}>
                      {ORDER_STATUS_META[st].label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={savingStatus || draftOrderStatus === selectedOrder.orderStatus}
                  onClick={handleSaveOrderStatus}
                  className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-3.5 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2 disabled:opacity-45"
                >
                  {savingStatus ? "Menyimpan…" : "Simpan status"}
                </button>
              </div>

              {showUnpaidWarning ? (
                <p className="rounded-[var(--radius-control)] bg-[var(--amber-3)] px-3 py-2 text-[length:var(--text-meta)] text-[var(--amber-11)]">
                  Pembayaran masih menunggu konfirmasi. Pastikan dana atau bukti transfer sudah diterima sebelum menyiapkan atau menyelesaikan pesanan.
                </p>
              ) : null}
            </div>

            {/* Payment Verification History */}
            <div>
              <p className="text-[length:var(--text-meta)] text-ink-11">
                Riwayat status pembayaran
              </p>
              {paymentLogs.length === 0 ? (
                <p className="mt-1 text-[length:var(--text-meta)] text-ink-10">
                  Belum ada riwayat perubahan pembayaran.
                </p>
              ) : (
                <ul className="mt-2 space-y-1.5 text-[length:var(--text-meta)] text-ink-11">
                  {paymentLogs.map((log) => (
                    <li
                      key={log.id}
                      className="rounded-[var(--radius-control)] bg-ink-2 px-3 py-2"
                    >
                      <span className="tabular-nums text-ink-12">
                        {PAYMENT_STATUS_META[log.fromStatus]?.label || log.fromStatus} →{" "}
                        {PAYMENT_STATUS_META[log.toStatus]?.label || log.toStatus} ·{" "}
                        {log.verifiedBy} · {formatDateTimeId(log.verifiedAt)}
                      </span>
                      {log.note ? <p className="mt-0.5">{log.note}</p> : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </ModalSheet>

      {/* Manual Payment Verification Modal */}
      <ModalSheet
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        title="Konfirmasi status pembayaran"
        size="confirm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setVerifyModalOpen(false)}
              className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={verifying}
              onClick={() => handleVerifyPayment(draftPaymentStatus)}
              className={`inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] px-4 text-[length:var(--text-body)] ${
                draftPaymentStatus === "Rejected"
                  ? "bg-[var(--red-9)] text-[var(--red-contrast)]"
                  : "bg-[var(--primary-bg)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)]"
              }`}
            >
              {verifying
                ? "Menyimpan…"
                : draftPaymentStatus === "Paid"
                  ? "Tandai sudah dibayar"
                  : draftPaymentStatus === "Rejected"
                    ? "Tolak pembayaran"
                    : draftPaymentStatus === "Refunded"
                      ? "Simpan pengembalian dana"
                      : "Kembalikan ke menunggu"}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="verify-payment-select"
              className="block text-[length:var(--text-body)] text-ink-12"
            >
              Status pembayaran
            </label>
            <select
              id="verify-payment-select"
              value={draftPaymentStatus}
              onChange={(e) => setDraftPaymentStatus(e.target.value as PaymentStatus)}
              className="mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-body)] text-ink-12"
            >
              <option value="Paid">Lunas (Sudah dibayar)</option>
              <option value="Rejected">Ditolak (Bukti tidak sesuai)</option>
              <option value="Refunded">Dana Dikembalikan</option>
              <option value="Pending">Belum Dibayar</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="verify-note"
              className="block text-[length:var(--text-body)] text-ink-12"
            >
              Catatan untuk internal <span className="text-ink-10">(opsional)</span>
            </label>
            <textarea
              id="verify-note"
              rows={2}
              value={verifyNote}
              onChange={(e) => setVerifyNote(e.target.value)}
              placeholder="Contoh: Transfer BCA sudah masuk sesuai nominal"
              className="mt-1.5 min-h-20 w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
            />
          </div>
        </div>
      </ModalSheet>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1200px] p-6 text-[length:var(--text-body)] text-ink-11">
          Memuat daftar pesanan…
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
