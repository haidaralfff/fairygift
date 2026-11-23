import { COLLECTIONS } from "@/lib/constants";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import {
  DEMO_CARD_DESIGNS,
  DEMO_CATEGORIES,
  DEMO_GIFT_COMPONENTS,
  DEMO_PACKAGINGS,
  DEMO_PRODUCTS,
} from "@/lib/data/demo-seed";
import type {
  CardDesign,
  Category,
  GiftComponent,
  Packaging,
  Product,
} from "@/types/domain";

const FIRESTORE_READ_TIMEOUT_MS = 2500;
const FIRESTORE_RETRY_COOLDOWN_MS = 30_000;
let firestoreUnreachableUntil = 0;

async function withReadTimeout<T>(promise: Promise<T>): Promise<T> {
  if (Date.now() < firestoreUnreachableUntil) {
    throw new Error("Firestore cooldown active");
  }
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          firestoreUnreachableUntil = Date.now() + FIRESTORE_RETRY_COOLDOWN_MS;
          reject(new Error("Firestore read timeout"));
        }, FIRESTORE_READ_TIMEOUT_MS);
      }),
    ]);
  } catch (err) {
    firestoreUnreachableUntil = Date.now() + FIRESTORE_RETRY_COOLDOWN_MS;
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function readCollectionOrFallback<T extends { id: string }>(
  collectionName: string,
  fallback: T[]
): Promise<T[]> {
  if (!isFirebaseAdminConfigured()) {
    return fallback;
  }
  try {
    const snap = await withReadTimeout(
      getAdminDb().collection(collectionName).get()
    );
    if (snap.empty) {
      return fallback;
    }
    return snap.docs.map((doc) => ({
      ...(doc.data() as Omit<T, "id">),
      id: doc.id,
    })) as T[];
  } catch {
    return fallback;
  }
}

export async function getStorefrontCategories(): Promise<Category[]> {
  return readCollectionOrFallback<Category>(COLLECTIONS.categories, DEMO_CATEGORIES);
}

export async function getStorefrontProducts(): Promise<Product[]> {
  const list = await readCollectionOrFallback<Product>(
    COLLECTIONS.products,
    DEMO_PRODUCTS
  );
  return list.sort((a, b) => Number(b.isAvailable) - Number(a.isAvailable));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isFirebaseAdminConfigured()) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
  try {
    const snap = await withReadTimeout(
      getAdminDb()
        .collection(COLLECTIONS.products)
        .where("slug", "==", slug)
        .limit(1)
        .get()
    );

    if (!snap.empty) {
      const doc = snap.docs[0]!;
      return { ...(doc.data() as Omit<Product, "id">), id: doc.id };
    }
  } catch {
    // Fallback below
  }
  return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

export async function getBuilderCatalog(): Promise<{
  packagings: Packaging[];
  components: GiftComponent[];
  cardDesigns: CardDesign[];
}> {
  const [packagings, components, cardDesigns] = await Promise.all([
    readCollectionOrFallback<Packaging>(COLLECTIONS.packagings, DEMO_PACKAGINGS),
    readCollectionOrFallback<GiftComponent>(
      COLLECTIONS.giftComponents,
      DEMO_GIFT_COMPONENTS
    ),
    readCollectionOrFallback<CardDesign>(COLLECTIONS.cardDesigns, DEMO_CARD_DESIGNS),
  ]);

  return {
    packagings: packagings.filter((p) => p.isAvailable),
    components: components.filter((c) => c.isAvailable && c.stock > 0),
    cardDesigns: cardDesigns.filter((d) => d.isAvailable),
  };
}
