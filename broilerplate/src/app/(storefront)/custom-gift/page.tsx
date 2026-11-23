export default function CustomGiftPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <h1 className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12">
        Custom gift builder
      </h1>
      <p className="mt-2 text-[length:var(--text-body)] text-ink-11">
        Area kerja 3 tahap (kemasan & warna, isi hadiah, kartu ucapan) dengan perhitungan
        total langsung dan penyimpanan draft di <code className="font-mono text-ink-12">localStorage</code>.
      </p>
    </div>
  );
}
