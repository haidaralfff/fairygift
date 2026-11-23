import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import { getDevOrderByNumber } from "@/lib/data/dev-order-store";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { buildWhatsAppOrderMessage, buildWhatsAppOrderUrl } from "@/lib/format";
import type { Order } from "@/types/domain";

export async function GET(
  request: Request,
  context: { params: Promise<{ orderNumber: string }> }
) {
  const { orderNumber } = await context.params;
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("t") || "";

  let order: Order | null = null;

  if (!isFirebaseAdminConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      order = getDevOrderByNumber(orderNumber) ?? null;
    }
  } else {
    const snap = await getAdminDb()
      .collection(COLLECTIONS.orders)
      .where("orderNumber", "==", orderNumber)
      .limit(1)
      .get();

    if (!snap.empty) {
      const doc = snap.docs[0]!;
      order = { ...(doc.data() as Omit<Order, "id">), id: doc.id };
    }
  }

  if (!order) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  // PRD 7.2 privacy guard: require matching accessToken
  if (!token || order.accessToken !== token) {
    return NextResponse.json(
      { error: "Tautan konfirmasi tidak valid atau token akses tidak cocok." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.customer,
      items: order.items,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    },
    whatsappUrl: buildWhatsAppOrderUrl(order),
    whatsappMessage: buildWhatsAppOrderMessage(order),
  });
}
