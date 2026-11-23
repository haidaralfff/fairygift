import { NextResponse } from "next/server";
import { isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { isFirebaseClientConfigured } from "@/lib/firebase/client";
import { isCloudinaryConfigured } from "@/lib/storage";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "fairygift-api",
    integrations: {
      firebaseClient: isFirebaseClientConfigured(),
      firebaseAdmin: isFirebaseAdminConfigured(),
      cloudinary: isCloudinaryConfigured(),
    },
    timestamp: new Date().toISOString(),
  });
}
