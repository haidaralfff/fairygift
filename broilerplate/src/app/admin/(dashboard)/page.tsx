import { StatusDot } from "@/components/ui/status-dot";

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto max-w-[1200px] p-5 md:p-6">
      <div className="hairline-b pb-4">
        <h1 className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12">
          Ringkasan operasional
        </h1>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
          <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
            0
          </p>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">Total pesanan</p>
        </div>

        <div className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
          <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
            0
          </p>
          <div className="mt-1">
            <StatusDot tone="amber" label="Pembayaran belum diverifikasi" />
          </div>
        </div>

        <div className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
          <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
            0
          </p>
          <div className="mt-1">
            <StatusDot tone="blue" label="Sedang diproses" ping />
          </div>
        </div>

        <div className="surface-raised rounded-[var(--radius-container)] bg-[var(--raised)] p-4 shadow-[var(--shadow-card)]">
          <p className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-ink-12">
            Rp0
          </p>
          <div className="mt-1">
            <StatusDot tone="green" label="Pendapatan terverifikasi" />
          </div>
        </div>
      </div>
    </div>
  );
}
