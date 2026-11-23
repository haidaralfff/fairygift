import Link from "next/link";
import { ProductDetailClient } from "@/components/storefront/product-detail-client";
import { getProductBySlug } from "@/lib/data/catalog-service";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-12 md:px-6">
        <div className="rounded-[var(--radius-container)] bg-ink-2 p-11 text-center">
          <p className="text-[length:var(--text-body)] text-ink-12">
            Produk tidak ditemukan.
          </p>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
            Paket hadiah mungkin sudah dihapus atau tautan tidak valid.
          </p>
          <Link
            href="/katalog"
            className="mt-4 inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
          >
            Kembali ke katalog
          </Link>
        </div>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
