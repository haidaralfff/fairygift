import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import {
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyAdminRequest,
} from "@/lib/firebase/admin";
import type { Order } from "@/types/domain";

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

  const { searchParams } = new URL(request.url);
  const orderStatus = searchParams.get("orderStatus") || "Semua";
  const paymentStatus = searchParams.get("paymentStatus") || "Semua";
  const sort = searchParams.get("sort") || "newest";
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const snap = await getAdminDb()
    .collection(COLLECTIONS.orders)
    .orderBy("createdAt", "desc")
    .get();

  let orders: Order[] = snap.docs.map((doc) => ({
    ...(doc.data() as Omit<Order, "id">),
    id: doc.id,
  }));

  if (orderStatus !== "Semua") {
    orders = orders.filter((o) => o.orderStatus === orderStatus);
  }
  if (paymentStatus !== "Semua") {
    orders = orders.filter((o) => o.paymentStatus === paymentStatus);
  }
  if (q) {
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customer.buyerName.toLowerCase().includes(q) ||
        o.customer.recipientName.toLowerCase().includes(q) ||
        o.customer.whatsapp.toLowerCase().includes(q)
    );
  }

  if (sort === "deadline") {
    orders.sort((a, b) =>
      a.customer.deliveryDate.localeCompare(b.customer.deliveryDate)
    );
  }

  return NextResponse.json({ orders });
}
