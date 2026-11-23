import { Suspense } from "react";
import { CustomGiftBuilder } from "@/components/storefront/custom-gift-builder";
import { getBuilderCatalog } from "@/lib/data/catalog-service";

export const dynamic = "force-dynamic";

export default async function CustomGiftPage() {
  const { packagings, components, cardDesigns } = await getBuilderCatalog();

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1200px] px-4 py-8 text-[length:var(--text-body)] text-ink-11 md:px-6">
          Memuat layanan kado custom…
        </div>
      }
    >
      <CustomGiftBuilder
        packagings={packagings}
        components={components}
        cardDesigns={cardDesigns}
      />
    </Suspense>
  );
}
