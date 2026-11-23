import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import {
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyAdminRequest,
} from "@/lib/firebase/admin";
import type { Order, OrderStatus } from "@/types/domain";

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

  const snap = await getAdminDb()
    .collection(COLLECTIONS.orders)
    .orderBy("createdAt", "desc")
    .get();

  const orders = snap.docs.map((doc) => ({
    ...(doc.data() as Omit<Order, "id">),
    id: doc.id,
  }));

  const statusDistribution: Record<OrderStatus, number> = {
    Pending: 0,
    Processing: 0,
    Ready: 0,
    Completed: 0,
    Cancelled: 0,
  };

  let pendingPayments = 0;
  let verifiedRevenue = 0;

  for (const ord of orders) {
    if (ord.orderStatus in statusDistribution) {
      statusDistribution[ord.orderStatus] += 1;
    }
    if (ord.paymentStatus === "Pending" && ord.orderStatus !== "Cancelled") {
      pendingPayments += 1;
    }
    if (ord.paymentStatus === "Paid" && ord.orderStatus !== "Cancelled") {
      verifiedRevenue += Number(ord.totalPrice || 0);
    }
  }

  return NextResponse.json({
    metrics: {
      totalOrders: orders.length,
      pendingPayments,
      processingOrders: statusDistribution.Processing,
      verifiedRevenue,
    },
    statusDistribution,
    recentOrders: orders.slice(0, 6),
  });
}
