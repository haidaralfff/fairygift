"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { StatusDot } from "@/components/ui/status-dot";
import {
  ORDER_STATUS_LIST,
  ORDER_STATUS_META,
  PAYMENT_STATUS_META,
} from "@/lib/constants";
import { formatDateId, formatRupiah } from "@/lib/format";
import type { Order, OrderStatus } from "@/types/domain";

interface OverviewResponse {
  metrics: {
    totalOrders: number;
    pendingPayments: number;
    processingOrders: number;
    verifiedRevenue: number;
  };
  statusDistribution: Record<OrderStatus, number>;
  recentOrders: Order[];
  upcomingOrders?: Order[];
}

export default function AdminOverviewPage() {
  const { user, adminFetch } = useAdminAuth();
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function loadOverview() {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    adminFetch("/api/admin/overview")
      .then(async (res) => {
        if (!res.ok) throw new Error("Gagal memuat ringkasan.");
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err instanceof Error ? err.message : "Gagal memuat."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const metrics = data?.metrics ?? {
    totalOrders: 0,
    pendingPayments: 0,
    processingOrders: 0,
    verifiedRevenue: 0,
  };

  const dist = data?.statusDistribution ?? {
    Pending: 0,
    Processing: 0,
    Ready: 0,
    Completed: 0,
    Cancelled: 0,
  };

  const maxStatusCount = Math.max(
    1,
    dist.Pending,
    dist.Processing,
    dist.Ready,
    dist.Completed,
    dist.Cancelled
  );

  const upcomingOrders = data?.upcomingOrders ?? [];

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 p-4 md:p-6">
      {/* 1. Metrik Utama (Clickable operational shortcuts) */}
      <section aria-label="Ringkasan metrik">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/pesanan"
            className="surface-raised group rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-ink-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
                {loading ? <span className="text-ink-10">-</span> : metrics.totalOrders}
              </p>
              <ArrowForwardRoundedIcon
                style={{ fontSize: 16 }}
                className="text-ink-8 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-12"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
              Total pesanan
            </p>
          </Link>

          <Link
            href="/admin/pembayaran"
            className="surface-raised group rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-ink-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
                {loading ? <span className="text-ink-10">-</span> : metrics.pendingPayments}
              </p>
              <ArrowForwardRoundedIcon
                style={{ fontSize: 16 }}
                className="text-ink-8 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-12"
                aria-hidden="true"
              />
            </div>
            <div className="mt-1">
              <StatusDot
                tone={metrics.pendingPayments > 0 ? "amber" : "neutral"}
                label="Menunggu cek pembayaran"
                muted
              />
            </div>
          </Link>

          <Link
            href="/admin/pesanan?orderStatus=Processing"
            className="surface-raised group rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-ink-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
                {loading ? <span className="text-ink-10">-</span> : metrics.processingOrders}
              </p>
              <ArrowForwardRoundedIcon
                style={{ fontSize: 16 }}
                className="text-ink-8 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-12"
                aria-hidden="true"
              />
            </div>
            <div className="mt-1">
              <StatusDot
                tone="blue"
                label="Pesanan sedang disiapkan"
                ping={metrics.processingOrders > 0}
                muted
              />
            </div>
          </Link>

          <Link
            href="/admin/pesanan?paymentStatus=Paid"
            className="surface-raised group rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)] transition-colors hover:bg-ink-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
                {loading ? (
                  <span className="text-ink-10">-</span>
                ) : (
                  formatRupiah(metrics.verifiedRevenue)
                )}
              </p>
              <ArrowForwardRoundedIcon
                style={{ fontSize: 16 }}
                className="text-ink-8 transition-transform group-hover:translate-x-0.5 group-hover:text-ink-12"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
              Pemasukan terkonfirmasi
            </p>
          </Link>
        </div>
      </section>

      {/* 2. Prioritas Operasional: Jadwal Kirim Terdekat + Distribusi Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section aria-labelledby="upcoming-heading" className="lg:col-span-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              <EventAvailableOutlinedIcon style={{ fontSize: 17 }} className="shrink-0 text-ink-10" aria-hidden="true" />
              <h2
                id="upcoming-heading"
                className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12"
              >
                Jadwal kirim terdekat
              </h2>
            </div>
            <Link
              href="/admin/pesanan?sort=deadline"
              className="inline-flex h-[var(--control-h-compact)] shrink-0 whitespace-nowrap items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
            >
              <span>Urutkan paling dekat</span>
              <ArrowForwardRoundedIcon style={{ fontSize: 14 }} className="shrink-0 text-ink-10" aria-hidden="true" />
            </Link>
          </div>

          {loading ? (
            <div className="mt-3 h-52 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
          ) : upcomingOrders.length === 0 ? (
            <div className="mt-3 rounded-[var(--radius-container)] bg-ink-2 p-8 text-center">
              <p className="text-[length:var(--text-body)] text-ink-12">
                Tidak ada pesanan aktif yang menunggu pengiriman.
              </p>
              <p className="mt-1 text-[length:var(--text-meta)] text-ink-11">
                Pesanan yang sedang menunggu, disiapkan, atau siap kirim akan muncul otomatis sesuai tanggal kirim terdekat.
              </p>
            </div>
          ) : (
            <div className="surface-raised mt-3 divide-y-[0.5px] divide-[var(--line)] overflow-hidden rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] bg-[var(--raised)] shadow-[var(--shadow-card)]">
              {upcomingOrders.map((ord) => {
                const ordMeta = ORDER_STATUS_META[ord.orderStatus];
                const payMeta = PAYMENT_STATUS_META[ord.paymentStatus];
                return (
                  <div
                    key={ord.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="tabular-nums font-mono text-[length:var(--text-body)] text-ink-12">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[length:var(--text-meta)] text-ink-10">
                          · {ord.customer.buyerName}
                        </span>
                      </div>
                      <p className="tabular-nums mt-0.5 text-[length:var(--text-meta)] text-ink-11">
                        {formatDateId(ord.customer.deliveryDate)} ·{" "}
                        {ord.customer.deliveryMethod === "delivery"
                          ? "Pengiriman"
                          : "Ambil sendiri"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-3">
                        <StatusDot tone={payMeta.tone} label={payMeta.label} />
                        <StatusDot
                          tone={ordMeta.tone}
                          label={ordMeta.label}
                          ping={ordMeta.ping}
                        />
                      </div>
                      <Link
                        href={`/admin/pesanan?open=${encodeURIComponent(ord.id)}`}
                        className="inline-flex h-[var(--control-h-inline)] items-center rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
                      >
                        Kelola
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section aria-labelledby="status-dist-heading" className="lg:col-span-5">
          <h2
            id="status-dist-heading"
            className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12"
          >
            Ringkasan status pesanan
          </h2>

          {loading ? (
            <div className="mt-3 h-52 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
          ) : (
            <div className="surface-raised mt-3 space-y-2.5 rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
              {ORDER_STATUS_LIST.map((st) => {
                const count = dist[st] ?? 0;
                const pct = Math.round((count / maxStatusCount) * 100);
                const meta = ORDER_STATUS_META[st];
                return (
                  <Link
                    key={st}
                    href={`/admin/pesanan?orderStatus=${encodeURIComponent(st)}`}
                    className="grid grid-cols-12 items-center gap-2 rounded-[var(--radius-control)] px-1.5 py-1 transition-colors hover:bg-ink-2"
                  >
                    <div className="col-span-5">
                      <StatusDot tone={meta.tone} label={meta.label} ping={meta.ping} />
                    </div>
                    <div className="col-span-5">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-ink-3">
                        <div
                          className={`h-full rounded-full transition-[width] duration-300 ${meta.barColor}`}
                          style={{ width: `${count > 0 ? Math.max(pct, 6) : 0}%` }}
                        />
                      </div>
                    </div>
                    <div className="tabular-nums col-span-2 text-right text-[length:var(--text-body)] text-ink-12">
                      {count}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* 3. Pesanan Terbaru */}
      <section aria-labelledby="recent-orders-heading">
        <div className="flex items-center justify-between gap-4">
          <h2
            id="recent-orders-heading"
            className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12"
          >
            Pesanan terbaru
          </h2>

          <Link
            href="/admin/pesanan"
            className="inline-flex h-[var(--control-h-compact)] shrink-0 whitespace-nowrap items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
          >
            <span>Lihat semua</span>
            <ArrowForwardRoundedIcon style={{ fontSize: 14 }} className="shrink-0 text-ink-10" aria-hidden="true" />
          </Link>
        </div>

        {loading ? (
          <div className="mt-3 h-56 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
        ) : error ? (
          <div className="mt-4 rounded-[var(--radius-container)] bg-ink-2 p-10 text-center">
            <p className="text-[length:var(--text-body)] text-ink-12">{error}</p>
            <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
              Periksa koneksi Anda lalu coba lagi.
            </p>
            <button
              type="button"
              onClick={loadOverview}
              className="mt-4 inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
            >
              Coba lagi
            </button>
          </div>
        ) : !data || data.recentOrders.length === 0 ? (
          <div className="mt-4 rounded-[var(--radius-container)] bg-ink-2 p-10 text-center">
            <p className="text-[length:var(--text-body)] text-ink-12">
              Belum ada pesanan masuk.
            </p>
            <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
              Pesanan baru dari pelanggan akan muncul di sini secara otomatis.
            </p>
          </div>
        ) : (
          <div className="no-scrollbar mt-3 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
            <table className="w-full min-w-[740px] border-collapse text-left">
              <thead>
                <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                  <th scope="col" className="px-3.5">No. Pesanan</th>
                  <th scope="col" className="px-3.5">Pelanggan</th>
                  <th scope="col" className="px-3.5">Jadwal</th>
                  <th scope="col" className="px-3.5">Total</th>
                  <th scope="col" className="px-3.5">Pembayaran</th>
                  <th scope="col" className="px-3.5">Status Pesanan</th>
                  <th scope="col" className="px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-[var(--line)] text-[length:var(--text-body)]">
                {data.recentOrders.map((ord) => {
                  const payMeta = PAYMENT_STATUS_META[ord.paymentStatus];
                  const ordMeta = ORDER_STATUS_META[ord.orderStatus];
                  return (
                    <tr
                      key={ord.id}
                      className={`h-[var(--row-h)] bg-[var(--raised)] ${
                        ord.orderStatus === "Cancelled" ? "opacity-55" : ""
                      }`}
                    >
                      <td className="tabular-nums px-3.5 font-mono text-ink-12">
                        {ord.orderNumber}
                      </td>
                      <td
                        className="max-w-[28ch] truncate px-3.5 text-ink-11"
                        title={ord.customer.buyerName}
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
                        <Link
                          href={`/admin/pesanan?open=${encodeURIComponent(ord.id)}`}
                          className="inline-flex h-[var(--control-h-inline)] items-center rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
