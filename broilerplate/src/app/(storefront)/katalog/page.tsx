export default function KatalogPage() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 md:px-6">
      <h1 className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12">
        Katalog hadiah
      </h1>
      <p className="mt-2 text-[length:var(--text-body)] text-ink-11">
        Halaman ini menampilkan paket hadiah siap pesan dari koleksi{" "}
        <code className="font-mono text-ink-12">products</code> dan{" "}
        <code className="font-mono text-ink-12">categories</code> di Firestore.
      </p>
    </div>
  );
}
