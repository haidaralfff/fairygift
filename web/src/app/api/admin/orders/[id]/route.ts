import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import {
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyAdminRequest,
} from "@/lib/firebase/admin";
import {
  orderStatusUpdateSchema,
  paymentVerificationSchema,
} from "@/lib/validators";
import type { Order, PaymentLog } from "@/types/domain";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id } = await context.params;
  const orderRef = getAdminDb().collection(COLLECTIONS.orders).doc(id);
  const [orderSnap, logsSnap] = await Promise.all([
    orderRef.get(),
    orderRef.collection("paymentLogs").orderBy("verifiedAt", "desc").get(),
  ]);

  if (!orderSnap.exists) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan." }, { status: 404 });
  }

  const paymentLogs = logsSnap.docs.map((d) => ({
    ...(d.data() as Omit<PaymentLog, "id">),
    id: d.id,
  }));

  return NextResponse.json({
    order: { ...(orderSnap.data() as Omit<Order, "id">), id: orderSnap.id },
    paymentLogs,
  });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload tidak valid." }, { status: 400 });
  }

  const hasOrderStatus = "orderStatus" in body;
  const hasPaymentStatus = "paymentStatus" in body;
  if (!hasOrderStatus && !hasPaymentStatus) {
    return NextResponse.json(
      { error: "Tidak ada perubahan yang dikirim." },
      { status: 400 }
    );
  }

  const parsedOrderStatus = hasOrderStatus
    ? orderStatusUpdateSchema.safeParse(body)
    : null;
  if (parsedOrderStatus && !parsedOrderStatus.success) {
    return NextResponse.json(
      { error: "Status pesanan tidak valid." },
      { status: 400 }
    );
  }

  const parsedPaymentStatus = hasPaymentStatus
    ? paymentVerificationSchema.safeParse(body)
    : null;
  if (parsedPaymentStatus && !parsedPaymentStatus.success) {
    return NextResponse.json(
      { error: "Status pembayaran tidak valid." },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const orderRef = db.collection(COLLECTIONS.orders).doc(id);
  const nowIso = new Date().toISOString();

  try {
    const result = await db.runTransaction(async (tx) => {
      const orderSnap = await tx.get(orderRef);
      if (!orderSnap.exists) {
        return { notFound: true as const };
      }

      const currentOrder = orderSnap.data() as Order;
      const nextOrderStatus = parsedOrderStatus?.success
        ? parsedOrderStatus.data.orderStatus
        : currentOrder.orderStatus;
      const nextPaymentStatus = parsedPaymentStatus?.success
        ? parsedPaymentStatus.data.paymentStatus
        : currentOrder.paymentStatus;

      const wasRestored = Boolean(currentOrder.stockRestored);
      const willBeInactive =
        nextOrderStatus === "Cancelled" || nextPaymentStatus === "Rejected";
      const shouldRestoreStock = !wasRestored && willBeInactive;
      const shouldReserveStock = wasRestored && !willBeInactive;

      const componentUsage = new Map<string, number>();
      for (const item of currentOrder.items || []) {
        if (
          item.type === "custom_gift" &&
          Array.isArray(item.customization?.components)
        ) {
          for (const comp of item.customization.components) {
            const qty = Number(comp.quantity || 1) * Number(item.quantity || 1);
            if (qty > 0 && comp.componentId) {
              componentUsage.set(
                comp.componentId,
                (componentUsage.get(comp.componentId) || 0) + qty
              );
            }
          }
        }
      }

      const componentSnaps = new Map<
        string,
        FirebaseFirestore.DocumentSnapshot
      >();
      if ((shouldRestoreStock || shouldReserveStock) && componentUsage.size > 0) {
        const entries = Array.from(componentUsage.keys());
        const snaps = await Promise.all(
          entries.map((compId) =>
            tx.get(db.collection(COLLECTIONS.giftComponents).doc(compId))
          )
        );
        entries.forEach((compId, idx) => {
          componentSnaps.set(compId, snaps[idx]);
        });

        if (shouldReserveStock) {
          for (const [compId, neededQty] of componentUsage.entries()) {
            const snap = componentSnaps.get(compId);
            if (!snap?.exists) {
              throw new Error(
                `Komponen hadiah (${compId}) tidak ditemukan untuk mengaktifkan kembali pesanan.`
              );
            }
            const data = snap.data()!;
            const currentStock = Number(data.stock || 0);
            if (!data.isAvailable || currentStock < neededQty) {
              throw new Error(
                `Stok "${String(data.name || compId)}" tidak mencukupi untuk mengaktifkan kembali pesanan (tersedia ${currentStock}, butuh ${neededQty}).`
              );
            }
          }
        }
      }

      // Perform all writes after all reads
      if (shouldRestoreStock && componentUsage.size > 0) {
        for (const [compId, usedQty] of componentUsage.entries()) {
          const snap = componentSnaps.get(compId);
          if (!snap?.exists) continue;
          const data = snap.data()!;
          const currentStock = Number(data.stock || 0);
          const nextStock = currentStock + usedQty;
          tx.update(snap.ref, {
            stock: nextStock,
            isAvailable:
              currentStock === 0 && nextStock > 0
                ? true
                : Boolean(data.isAvailable),
          });
        }
      } else if (shouldReserveStock && componentUsage.size > 0) {
        for (const [compId, usedQty] of componentUsage.entries()) {
          const snap = componentSnaps.get(compId)!;
          const data = snap.data()!;
          const currentStock = Number(data.stock || 0);
          const nextStock = currentStock - usedQty;
          tx.update(snap.ref, {
            stock: nextStock,
            isAvailable: nextStock > 0 ? Boolean(data.isAvailable) : false,
          });
        }
      }

      const nextStockRestored = shouldRestoreStock
        ? true
        : shouldReserveStock
          ? false
          : wasRestored;

      const orderUpdate: Record<string, unknown> = {
        updatedAt: nowIso,
        stockRestored: nextStockRestored,
      };

      if (parsedOrderStatus?.success) {
        orderUpdate.orderStatus = nextOrderStatus;
      }

      if (parsedPaymentStatus?.success) {
        orderUpdate.paymentStatus = nextPaymentStatus;
        orderUpdate.verifiedAt = nowIso;
        orderUpdate.verifiedBy = admin.name;

        const logRef = orderRef.collection("paymentLogs").doc();
        tx.set(logRef, {
          fromStatus: currentOrder.paymentStatus,
          toStatus: nextPaymentStatus,
          note: parsedPaymentStatus.data.note || "",
          verifiedBy: admin.name,
          verifiedAt: nowIso,
        });
      }

      tx.update(orderRef, orderUpdate);

      return {
        notFound: false as const,
        orderStatus: nextOrderStatus,
        paymentStatus: nextPaymentStatus,
        stockRestored: nextStockRestored,
        stockDeltaApplied:
          componentUsage.size > 0 && (shouldRestoreStock || shouldReserveStock),
        verifiedAt: parsedPaymentStatus?.success ? nowIso : undefined,
        verifiedBy: parsedPaymentStatus?.success ? admin.name : undefined,
      };
    });

    if (result.notFound) {
      return NextResponse.json(
        { error: "Pesanan tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      orderStatus: result.orderStatus,
      paymentStatus: result.paymentStatus,
      stockRestored: result.stockRestored,
      ...(result.verifiedAt ? { verifiedAt: result.verifiedAt } : {}),
      ...(result.verifiedBy ? { verifiedBy: result.verifiedBy } : {}),
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Gagal memperbarui status pesanan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
