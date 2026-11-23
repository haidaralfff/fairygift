import { NextResponse } from "next/server";
import { getBuilderCatalog, getStorefrontProducts } from "@/lib/data/catalog-service";
import type { CartItem } from "@/types/domain";

export async function POST(request: Request) {
  let body: { items?: CartItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Data keranjang belum terbaca. Muat ulang halaman lalu coba lagi." },
      { status: 400 }
    );
  }

  const items = Array.isArray(body.items) ? body.items : [];
  const [products, builderCatalog] = await Promise.all([
    getStorefrontProducts(),
    getBuilderCatalog(),
  ]);

  const productMap = new Map(products.map((p) => [p.id, p]));
  const packagingMap = new Map(builderCatalog.packagings.map((p) => [p.id, p]));
  const componentMap = new Map(builderCatalog.components.map((c) => [c.id, c]));
  const cardMap = new Map(builderCatalog.cardDesigns.map((d) => [d.id, d]));

  const issues: Record<string, string> = {};

  for (const item of items) {
    if (item.type === "ready_made") {
      const prod = productMap.get(item.productId);
      if (!prod || !prod.isAvailable) {
        issues[item.cartItemId] =
          "Maaf, paket kado ini baru saja habis atau sedang tidak tersedia. Hapus item ini untuk melanjutkan.";
      }
    } else {
      const pack = packagingMap.get(item.customization.packagingId);
      const card = cardMap.get(item.customization.cardDesignId);
      if (!pack || !pack.isAvailable) {
        issues[item.cartItemId] =
          "Kemasan pada kado custom ini sedang tidak tersedia. Silakan ubah pilihan kemasan atau hapus item ini.";
        continue;
      }
      if (!card || !card.isAvailable) {
        issues[item.cartItemId] =
          "Desain kartu ucapan pada kado custom ini sedang tidak tersedia. Silakan ubah pilihan atau hapus item ini.";
        continue;
      }

      const unavailableComp = item.customization.components.find((comp) => {
        const live = componentMap.get(comp.componentId);
        return !live || !live.isAvailable || live.stock < comp.quantity * item.quantity;
      });

      if (unavailableComp) {
        issues[item.cartItemId] =
          `Maaf, stok "${unavailableComp.name}" baru saja habis atau kurang dari jumlah pesanan. Ubah isi kado atau hapus item ini untuk melanjutkan.`;
      }
    }
  }

  return NextResponse.json({
    valid: Object.keys(issues).length === 0,
    issues,
  });
}
