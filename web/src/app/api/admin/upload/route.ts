import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured, verifyAdminRequest } from "@/lib/firebase/admin";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/storage";

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

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "fairygift/catalog");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Pilih file foto terlebih dahulu." }, { status: 400 });
    }

    const validationError = validateImageFile(file);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const uploaded = await uploadImageToCloudinary(file, folder);
    return NextResponse.json(uploaded, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Gagal mengunggah gambar.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
