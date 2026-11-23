import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import {
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyAdminRequest,
} from "@/lib/firebase/admin";
import { productInputSchema } from "@/lib/validators";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Koneksi penyimpanan data toko belum aktif." },
      { status: 503 }
    );
  }

  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Sesi admin tidak valid. Silakan masuk kembali." }, { status: 401 });
  }

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Data perubahan belum terbaca. Muat ulang halaman lalu coba lagi." },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const ref = db.collection(COLLECTIONS.products).doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });
  }

  const nowIso = new Date().toISOString();

  // Quick availability switch toggle
  if (
    Object.keys(body).length === 1 &&
    typeof body.isAvailable === "boolean"
  ) {
    await ref.update({
      isAvailable: body.isAvailable,
      updatedAt: nowIso,
    });
    return NextResponse.json({ ok: true, isAvailable: body.isAvailable });
  }

  const parsed = productInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Periksa kembali rincian produk yang diisi.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const catSnap = await db
    .collection(COLLECTIONS.categories)
    .doc(parsed.data.categoryId)
    .get();
  const categoryName = catSnap.exists
    ? String(catSnap.data()?.name || snap.data()?.categoryName || "Special Occasion Gift")
    : String(snap.data()?.categoryName || "Special Occasion Gift");

  await ref.update({
    ...parsed.data,
    categoryName,
    updatedAt: nowIso,
  });

  const updated = await ref.get();
  return NextResponse.json({
    product: { ...updated.data(), id: updated.id },
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Koneksi penyimpanan data toko belum aktif." },
      { status: 503 }
    );
  }

  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Sesi admin tidak valid. Silakan masuk kembali." }, { status: 401 });
  }

  const { id } = await context.params;
  await getAdminDb().collection(COLLECTIONS.products).doc(id).delete();
  return NextResponse.json({ ok: true });
}
