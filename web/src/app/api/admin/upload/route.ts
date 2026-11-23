import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured, verifyAdminRequest } from "@/lib/firebase/admin";
import { uploadImageToCloudinary, validateImageFile } from "@/lib/storage";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Konfigurasi server Firebase Admin belum lengkap." },
      { status: 503 }
    );
  }

  const admin = await verifyAdminRequest(request);
  if (!admin) {
    return NextResponse.json({ error: "Akses ditolak. Khusus admin." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "fairygift/catalog");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File gambar wajib dilampirkan." }, { status: 400 });
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
