"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { StatusDot } from "@/components/ui/status-dot";
import { ORDER_STATUS_META, PAYMENT_STATUS_META } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
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
    dist.Completed
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 p-4 md:p-6">
      {/* 1. Metrik Utama */}
      <section aria-label="Ringkasan metrik">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
            <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
              {loading ? <span className="text-ink-10">-</span> : metrics.totalOrders}
            </p>
            <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
              Total pesanan
            </p>
          </div>

          <div className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
            <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
              {loading ? <span className="text-ink-10">-</span> : metrics.pendingPayments}
            </p>
            <div className="mt-1">
              <StatusDot
                tone={metrics.pendingPayments > 0 ? "amber" : "neutral"}
                label="Pembayaran belum diverifikasi"
                muted
              />
            </div>
          </div>

          <div className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
            <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
              {loading ? <span className="text-ink-10">-</span> : metrics.processingOrders}
            </p>
            <div className="mt-1">
              <StatusDot
                tone="blue"
                label="Pesanan sedang diproses"
                ping={metrics.processingOrders > 0}
                muted
              />
            </div>
          </div>

          <div className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
            <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
              {loading ? (
                <span className="text-ink-10">-</span>
              ) : (
                formatRupiah(metrics.verifiedRevenue)
              )}
            </p>
            <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
              Pendapatan terverifikasi
            </p>
          </div>
        </div>
      </section>

      {/* 2. Pesanan Terbaru */}
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
            className="inline-flex h-[var(--control-h-compact)] items-center gap-1.5 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
          >
            <span>Lihat semua</span>
            <ArrowRight className="size-3.5 text-ink-10" aria-hidden="true" />
          </Link>
        </div>

        {error ? (
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
          <div className="mt-3 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
            <table className="w-full min-w-[680px] border-collapse text-left">
              <thead>
                <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                  <th scope="col" className="px-3.5">No. Pesanan</th>
                  <th scope="col" className="px-3.5">Pelanggan</th>
                  <th scope="col" className="px-3.5">Total</th>
                  <th scope="col" className="px-3.5">Pembayaran</th>
                  <th scope="col" className="px-3.5">Status Pesanan</th>
                  <th scope="col" className="px-3.5">Aksi</th>
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
                        ord.orderStatus === "Cancelled" ? "opacity-50" : ""
                      }`}
                    >
                      <td className="tabular-nums px-3.5 text-ink-12">
                        {ord.orderNumber}
                      </td>
                      <td
                        className="max-w-[32ch] truncate px-3.5 text-ink-11"
                        title={ord.customer.buyerName}
                      >
                        {ord.customer.buyerName}
                      </td>
                      <td className="tabular-nums px-3.5 text-ink-11">
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
                      <td className="px-3.5">
                        <Link
                          href={`/admin/pesanan?open=${encodeURIComponent(ord.id)}`}
                          className="inline-flex h-[var(--control-h-inline)] items-center rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
                        >
                          Lihat
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

      {/* 3. Ringkasan Status Pesanan */}
      <section aria-labelledby="status-dist-heading">
        <h2
          id="status-dist-heading"
          className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12"
        >
          Ringkasan status pesanan
        </h2>

        <div className="surface-raised mt-3 space-y-3 rounded-[var(--radius-container)] bg-[var(--raised)] p-5 shadow-[var(--shadow-card)]">
          {(["Pending", "Processing", "Ready", "Completed"] as OrderStatus[]).map(
            (st) => {
              const count = dist[st] ?? 0;
              const pct = Math.round((count / maxStatusCount) * 100);
              const meta = ORDER_STATUS_META[st];
              return (
                <div key={st} className="grid grid-cols-12 items-center gap-3">
                  <div className="col-span-4 sm:col-span-3">
                    <StatusDot tone={meta.tone} label={meta.label} ping={meta.ping} />
                  </div>
                  <div className="col-span-6 sm:col-span-8">
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-ink-3">
                      <div
                        className="h-full rounded-full bg-ink-12 transition-[width] duration-300"
                        style={{ width: `${count > 0 ? Math.max(pct, 6) : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="tabular-nums col-span-2 text-right text-[length:var(--text-body)] text-ink-12 sm:col-span-1">
                    {count}
                  </div>
                </div>
              );
            }
          )}
        </div>
      </section>
    </div>
  );
}
