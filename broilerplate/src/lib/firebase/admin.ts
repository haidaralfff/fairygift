import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { COLLECTIONS } from "@/lib/constants";

function getAdminConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  return { projectId, clientEmail, privateKey };
}

export function isFirebaseAdminConfigured(): boolean {
  const { projectId, clientEmail, privateKey } = getAdminConfig();
  return Boolean(projectId && clientEmail && privateKey && !privateKey.includes("..."));
}

export function getFirebaseAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }
  const { projectId, clientEmail, privateKey } = getAdminConfig();
  if (!projectId || !clientEmail || !privateKey || privateKey.includes("...")) {
    throw new Error(
      "Firebase Admin belum dikonfigurasi. Isi FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, dan FIREBASE_PRIVATE_KEY di .env.local."
    );
  }
  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export function getAdminDb(): Firestore {
  return getFirestore(getFirebaseAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getFirebaseAdminApp());
}

export interface VerifiedAdmin {
  uid: string;
  email: string;
  name: string;
}

export async function verifyAdminRequest(
  request: Request
): Promise<VerifiedAdmin | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const decoded = await getAdminAuth().verifyIdToken(token);
    const userDoc = await getAdminDb()
      .collection(COLLECTIONS.users)
      .doc(decoded.uid)
      .get();

    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return null;
    }

    return {
      uid: decoded.uid,
      email: decoded.email || String(userDoc.data()?.email || ""),
      name: String(userDoc.data()?.name || "Admin"),
    };
  } catch {
    return null;
  }
}
