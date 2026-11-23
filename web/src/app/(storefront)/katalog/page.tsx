import { CatalogClient } from "@/components/storefront/catalog-client";
import {
  getStorefrontCategories,
  getStorefrontProducts,
} from "@/lib/data/catalog-service";

export const dynamic = "force-dynamic";

interface KatalogPageProps {
  searchParams: Promise<{ kategori?: string }>;
}

export default async function KatalogPage({ searchParams }: KatalogPageProps) {
  const { kategori } = await searchParams;
  const [categories, products] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts(),
  ]);

  return (
    <CatalogClient
      categories={categories}
      products={products}
      initialCategorySlug={kategori || "semua"}
    />
  );
}
