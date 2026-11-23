import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import {
  DEMO_CARD_DESIGNS,
  DEMO_CATEGORIES,
  DEMO_GIFT_COMPONENTS,
  DEMO_PACKAGINGS,
  DEMO_PRODUCTS,
} from "@/lib/data/demo-seed";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";

export async function POST(request: Request) {
  const seedSecret = process.env.SEED_SECRET || "fairygift-dev-seed";
  const provided = request.headers.get("x-seed-secret");
  if (provided !== seedSecret) {
    return NextResponse.json({ error: "Seed secret tidak valid." }, { status: 401 });
  }

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin belum dikonfigurasi." },
      { status: 503 }
    );
  }

  const db = getAdminDb();
  const batch = db.batch();

  for (const cat of DEMO_CATEGORIES) {
    batch.set(db.collection(COLLECTIONS.categories).doc(cat.id), cat, { merge: true });
  }
  for (const prod of DEMO_PRODUCTS) {
    batch.set(db.collection(COLLECTIONS.products).doc(prod.id), prod, { merge: true });
  }
  for (const pack of DEMO_PACKAGINGS) {
    batch.set(db.collection(COLLECTIONS.packagings).doc(pack.id), pack, { merge: true });
  }
  for (const comp of DEMO_GIFT_COMPONENTS) {
    batch.set(db.collection(COLLECTIONS.giftComponents).doc(comp.id), comp, {
      merge: true,
    });
  }
  for (const card of DEMO_CARD_DESIGNS) {
    batch.set(db.collection(COLLECTIONS.cardDesigns).doc(card.id), card, { merge: true });
  }

  await batch.commit();

  return NextResponse.json({
    ok: true,
    seeded: {
      categories: DEMO_CATEGORIES.length,
      products: DEMO_PRODUCTS.length,
      packagings: DEMO_PACKAGINGS.length,
      giftComponents: DEMO_GIFT_COMPONENTS.length,
      cardDesigns: DEMO_CARD_DESIGNS.length,
    },
  });
}
