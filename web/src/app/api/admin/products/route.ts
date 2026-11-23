import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import {
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyAdminRequest,
} from "@/lib/firebase/admin";
import { slugify } from "@/lib/format";
import { productInputSchema } from "@/lib/validators";
import type { Category, Product } from "@/types/domain";

export async function GET(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin belum dikonfigurasi." },
      { status: 503 }
    );
  }

  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  const db = getAdminDb();
  const [prodSnap, catSnap] = await Promise.all([
    db.collection(COLLECTIONS.products).orderBy("createdAt", "desc").get(),
    db.collection(COLLECTIONS.categories).get(),
  ]);

  const products = prodSnap.docs.map((d) => ({
    ...(d.data() as Omit<Product, "id">),
    id: d.id,
  }));
  const categories = catSnap.docs.map((d) => ({
    ...(d.data() as Omit<Category, "id">),
    id: d.id,
  }));

  return NextResponse.json({ products, categories });
}

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin belum dikonfigurasi." },
      { status: 503 }
    );
  }

  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Periksa data produk.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const catSnap = await db
    .collection(COLLECTIONS.categories)
    .doc(parsed.data.categoryId)
    .get();
  const categoryName = catSnap.exists
    ? String(catSnap.data()?.name || "Special Occasion Gift")
    : "Special Occasion Gift";

  const nowIso = new Date().toISOString();
  const ref = db.collection(COLLECTIONS.products).doc();
  const newProduct: Product = {
    id: ref.id,
    name: parsed.data.name,
    slug: `${slugify(parsed.data.name)}-${ref.id.slice(0, 5)}`,
    categoryId: parsed.data.categoryId,
    categoryName,
    description: parsed.data.description,
    contents: parsed.data.contents,
    price: parsed.data.price,
    imageUrl: parsed.data.imageUrl,
    isAvailable: parsed.data.isAvailable,
    isFeatured: parsed.data.isFeatured,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await ref.set(newProduct);
  return NextResponse.json({ product: newProduct }, { status: 201 });
}
