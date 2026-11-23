import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { buildWhatsAppOrderUrl } from "@/lib/format";
import { checkoutPayloadSchema } from "@/lib/validators";
import type { Order, OrderItem } from "@/types/domain";

export async function POST(request: Request) {
  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Server database belum dikonfigurasi. Periksa file .env.local." },
      { status: 503 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Payload JSON tidak valid." }, { status: 400 });
  }

  const parsed = checkoutPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Periksa kembali data pesanan Anda.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { idempotencyKey, customer, items } = parsed.data;
  const db = getAdminDb();

  try {
    const createdOrder = await db.runTransaction(async (tx) => {
      // 1. Idempotency guard (PRD 7.4: no duplicate orders on double-click/retry)
      const idemRef = db.collection(COLLECTIONS.idempotencyKeys).doc(idempotencyKey);
      const idemSnap = await tx.get(idemRef);
      if (idemSnap.exists) {
        const existingOrderId = String(idemSnap.data()?.orderId || "");
        const existingOrderSnap = await tx
          .get(db.collection(COLLECTIONS.orders).doc(existingOrderId));
        if (existingOrderSnap.exists) {
          return existingOrderSnap.data() as Order;
        }
      }

      // 2. Resolve authoritative prices & stock from Firestore inside transaction
      const resolvedItems: OrderItem[] = [];
      let totalPrice = 0;

      // Track total requested stock per componentId across all custom items
      const componentUsage = new Map<string, number>();
      for (const item of items) {
        if (item.type === "custom_gift") {
          for (const comp of item.components) {
            const qty = comp.quantity * item.quantity;
            componentUsage.set(
              comp.componentId,
              (componentUsage.get(comp.componentId) || 0) + qty
            );
          }
        }
      }

      const componentSnaps = new Map<
        string,
        FirebaseFirestore.DocumentSnapshot
      >();
      for (const compId of componentUsage.keys()) {
        const snap = await tx.get(
          db.collection(COLLECTIONS.giftComponents).doc(compId)
        );
        componentSnaps.set(compId, snap);
      }

      for (const [compId, neededQty] of componentUsage.entries()) {
        const snap = componentSnaps.get(compId);
        if (!snap?.exists) {
          throw new Error(`Komponen hadiah (${compId}) tidak ditemukan.`);
        }
        const data = snap.data()!;
        if (!data.isAvailable || Number(data.stock || 0) < neededQty) {
          throw new Error(
            `Stok "${data.name}" tidak mencukupi (tersedia ${Number(data.stock || 0)}).`
          );
        }
      }

      for (const item of items) {
        if (item.type === "ready_made") {
          const prodSnap = await tx.get(
            db.collection(COLLECTIONS.products).doc(item.productId)
          );
          if (!prodSnap.exists || !prodSnap.data()?.isAvailable) {
            throw new Error("Salah satu produk di keranjang sudah tidak tersedia.");
          }
          const prod = prodSnap.data()!;
          const unitPrice = Number(prod.price);
          const subtotal = unitPrice * item.quantity;
          totalPrice += subtotal;

          resolvedItems.push({
            type: "ready_made",
            productId: item.productId,
            name: String(prod.name),
            imageUrl: String(prod.imageUrl || ""),
            unitPrice,
            quantity: item.quantity,
            subtotal,
          });
        } else {
          const [packSnap, cardSnap] = await Promise.all([
            tx.get(db.collection(COLLECTIONS.packagings).doc(item.packagingId)),
            tx.get(db.collection(COLLECTIONS.cardDesigns).doc(item.cardDesignId)),
          ]);

          if (!packSnap.exists || !packSnap.data()?.isAvailable) {
            throw new Error("Kemasan yang dipilih sudah tidak tersedia.");
          }
          if (!cardSnap.exists || !cardSnap.data()?.isAvailable) {
            throw new Error("Desain kartu ucapan sudah tidak tersedia.");
          }

          const pack = packSnap.data()!;
          const card = cardSnap.data()!;
          const packagingPrice = Number(pack.price || 0);
          const cardDesignPrice = Number(card.price || 0);

          let componentsSum = 0;
          const componentsSnapshot = item.components.map((comp) => {
            const compData = componentSnaps.get(comp.componentId)!.data()!;
            const compPrice = Number(compData.price || 0);
            componentsSum += compPrice * comp.quantity;
            return {
              componentId: comp.componentId,
              name: String(compData.name),
              price: compPrice,
              quantity: comp.quantity,
            };
          });

          const unitPrice = packagingPrice + componentsSum + cardDesignPrice;
          const subtotal = unitPrice * item.quantity;
          totalPrice += subtotal;

          resolvedItems.push({
            type: "custom_gift",
            name: `Custom Gift (${String(pack.name)})`,
            unitPrice,
            quantity: item.quantity,
            subtotal,
            customization: {
              packagingId: item.packagingId,
              packagingName: String(pack.name),
              packagingPrice,
              selectedColor: item.selectedColor,
              components: componentsSnapshot,
              cardDesignId: item.cardDesignId,
              cardDesignName: String(card.name),
              cardDesignPrice,
              greetingMessage: item.greetingMessage,
            },
          });
        }
      }

      // 3. Decrement component stock atomically
      for (const [compId, usedQty] of componentUsage.entries()) {
        const snap = componentSnaps.get(compId)!;
        const currentStock = Number(snap.data()!.stock || 0);
        const nextStock = currentStock - usedQty;
        tx.update(snap.ref, {
          stock: nextStock,
          isAvailable: nextStock > 0 ? Boolean(snap.data()!.isAvailable) : false,
        });
      }

      // 4. Generate sequential order number FG-YYYY-XXXX
      const year = new Date().getFullYear();
      const counterRef = db.collection(COLLECTIONS.counters).doc("orders");
      const counterSnap = await tx.get(counterRef);
      const prevSeq =
        counterSnap.exists && counterSnap.data()?.year === year
          ? Number(counterSnap.data()?.seq || 0)
          : 0;
      const nextSeq = prevSeq + 1;
      const orderNumber = `FG-${year}-${String(nextSeq).padStart(4, "0")}`;

      tx.set(counterRef, { year, seq: nextSeq }, { merge: true });

      const nowIso = new Date().toISOString();
      const orderRef = db.collection(COLLECTIONS.orders).doc();
      const newOrder: Order = {
        id: orderRef.id,
        orderNumber,
        idempotencyKey,
        customer,
        items: resolvedItems,
        totalPrice,
        orderStatus: "Pending",
        paymentStatus: "Pending",
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      tx.set(orderRef, newOrder);
      tx.set(idemRef, { orderId: orderRef.id, createdAt: nowIso });

      return newOrder;
    });

    const whatsappUrl = buildWhatsAppOrderUrl(createdOrder);

    return NextResponse.json(
      {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        order: createdOrder,
        whatsappUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Terjadi kesalahan saat memproses pesanan.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
