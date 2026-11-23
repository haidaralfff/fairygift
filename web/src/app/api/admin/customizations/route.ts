import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import {
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyAdminRequest,
} from "@/lib/firebase/admin";
import {
  cardDesignInputSchema,
  giftComponentInputSchema,
  packagingInputSchema,
} from "@/lib/validators";

type CustomizationResource = "packagings" | "giftComponents" | "cardDesigns";

function isValidResource(value: string): value is CustomizationResource {
  return (
    value === "packagings" ||
    value === "giftComponents" ||
    value === "cardDesigns"
  );
}

export async function GET(request: Request) {
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

  const db = getAdminDb();
  const [packSnap, compSnap, cardSnap] = await Promise.all([
    db.collection(COLLECTIONS.packagings).get(),
    db.collection(COLLECTIONS.giftComponents).get(),
    db.collection(COLLECTIONS.cardDesigns).get(),
  ]);

  return NextResponse.json({
    packagings: packSnap.docs.map((d) => ({ ...d.data(), id: d.id })),
    giftComponents: compSnap.docs.map((d) => ({ ...d.data(), id: d.id })),
    cardDesigns: cardSnap.docs.map((d) => ({ ...d.data(), id: d.id })),
  });
}

export async function POST(request: Request) {
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

  let body: { resource?: string; data?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Data yang dikirim belum terbaca. Muat ulang halaman lalu coba lagi." },
      { status: 400 }
    );
  }

  if (!body.resource || !isValidResource(body.resource)) {
    return NextResponse.json({ error: "Jenis item tidak sesuai." }, { status: 400 });
  }

  const schema =
    body.resource === "packagings"
      ? packagingInputSchema
      : body.resource === "giftComponents"
        ? giftComponentInputSchema
        : cardDesignInputSchema;

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Periksa kembali rincian item yang diisi.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const ref = getAdminDb().collection(body.resource).doc();
  const item = { id: ref.id, ...parsed.data };
  await ref.set(item);

  return NextResponse.json({ item }, { status: 201 });
}

export async function PATCH(request: Request) {
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

  let body: { resource?: string; id?: string; data?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Data perubahan belum terbaca. Muat ulang halaman lalu coba lagi." },
      { status: 400 }
    );
  }

  if (!body.resource || !isValidResource(body.resource) || !body.id || !body.data) {
    return NextResponse.json({ error: "Data perubahan belum lengkap." }, { status: 400 });
  }

  const ref = getAdminDb().collection(body.resource).doc(body.id);
  const snap = await ref.get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Item tidak ditemukan." }, { status: 404 });
  }

  if (
    Object.keys(body.data).length === 1 &&
    typeof body.data.isAvailable === "boolean"
  ) {
    await ref.update({ isAvailable: body.data.isAvailable });
    return NextResponse.json({ ok: true, isAvailable: body.data.isAvailable });
  }

  const schema =
    body.resource === "packagings"
      ? packagingInputSchema
      : body.resource === "giftComponents"
        ? giftComponentInputSchema
        : cardDesignInputSchema;

  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Periksa kembali rincian item yang diisi.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  await ref.update(parsed.data);
  return NextResponse.json({ item: { id: body.id, ...parsed.data } });
}

export async function DELETE(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get("resource") || "";
  const id = searchParams.get("id") || "";

  if (!isValidResource(resource) || !id) {
    return NextResponse.json({ error: "Item yang ingin dihapus tidak ditemukan." }, { status: 400 });
  }

  await getAdminDb().collection(resource).doc(id).delete();
  return NextResponse.json({ ok: true });
}
