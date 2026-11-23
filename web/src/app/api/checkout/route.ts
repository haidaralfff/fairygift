import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { COLLECTIONS } from "@/lib/constants";
import { getBuilderCatalog, getStorefrontProducts } from "@/lib/data/catalog-service";
import {
  findDevOrderByIdempotencyKey,
  nextDevOrderNumber,
  saveDevOrder,
} from "@/lib/data/dev-order-store";
import { getAdminDb, isFirebaseAdminConfigured } from "@/lib/firebase/admin";
import { buildWhatsAppOrderUrl } from "@/lib/format";
import { checkoutPayloadSchema } from "@/lib/validators";
import type { Order, OrderItem } from "@/types/domain";

function resolvePackagingVariants(
  pack: { name?: unknown; colors?: unknown; designs?: unknown },
  requestedColor: { name: string; hex: string },
  requestedDesign: string
) {
  const colors = Array.isArray(pack.colors)
    ? (pack.colors as Array<{ name?: unknown; hex?: unknown }>)
    : [];
  const designs = Array.isArray(pack.designs)
    ? pack.designs.map((d) => String(d).trim()).filter(Boolean)
    : [];

  const matchedColor = colors.find(
    (c) =>
      String(c.name || "").trim().toLowerCase() ===
        requestedColor.name.trim().toLowerCase() &&
      String(c.hex || "").trim().toLowerCase() ===
        requestedColor.hex.trim().toLowerCase()
  );
  if (!matchedColor) {
    throw new Error(
      `Warna kemasan "${requestedColor.name}" tidak tersedia untuk ${String(pack.name || "kemasan ini")}.`
    );
  }

  const matchedDesign = designs.find(
    (d) => d.toLowerCase() === requestedDesign.trim().toLowerCase()
  );
  if (!matchedDesign) {
    throw new Error(
      `Desain kemasan "${requestedDesign}" tidak tersedia untuk ${String(pack.name || "kemasan ini")}.`
    );
  }

  return {
    selectedColor: {
      name: String(matchedColor.name).trim(),
      hex: String(matchedColor.hex).trim(),
    },
    selectedDesign: matchedDesign,
  };
}

export async function POST(request: Request) {
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
  const normalizedCustomer = {
    ...customer,
    recipientName: customer.recipientName?.trim() || customer.buyerName,
    address: customer.deliveryMethod === "delivery" ? customer.address.trim() : "",
  };

  // Dev fallback when Firebase Admin env vars are not yet populated
  if (!isFirebaseAdminConfigured()) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "Konfigurasi Firebase Admin belum lengkap di server." },
        { status: 503 }
      );
    }

    const existing = findDevOrderByIdempotencyKey(idempotencyKey);
    if (existing) {
      return NextResponse.json(
        {
          orderId: existing.id,
          orderNumber: existing.orderNumber,
          accessToken: existing.accessToken,
          order: existing,
          whatsappUrl: buildWhatsAppOrderUrl(existing),
        },
        { status: 201 }
      );
    }

    const [products, builder] = await Promise.all([
      getStorefrontProducts(),
      getBuilderCatalog(),
    ]);
    const prodMap = new Map(products.map((p) => [p.id, p]));
    const packMap = new Map(builder.packagings.map((p) => [p.id, p]));
    const compMap = new Map(builder.components.map((c) => [c.id, c]));
    const cardMap = new Map(builder.cardDesigns.map((d) => [d.id, d]));

    const resolvedItems: OrderItem[] = [];
    let totalPrice = 0;

    try {
      for (const item of items) {
        if (item.type === "ready_made") {
          const prod = prodMap.get(item.productId);
          if (!prod || !prod.isAvailable) {
            return NextResponse.json(
              { error: "Salah satu produk di keranjang sudah tidak tersedia." },
              { status: 400 }
            );
          }
          const subtotal = prod.price * item.quantity;
          totalPrice += subtotal;
          resolvedItems.push({
            type: "ready_made",
            productId: prod.id,
            name: prod.name,
            imageUrl: prod.imageUrl,
            unitPrice: prod.price,
            quantity: item.quantity,
            subtotal,
          });
        } else {
          const pack = packMap.get(item.packagingId);
          const card = cardMap.get(item.cardDesignId);
          if (!pack || !pack.isAvailable) {
            return NextResponse.json(
              { error: "Kemasan yang dipilih sudah tidak tersedia." },
              { status: 400 }
            );
          }
          if (!card || !card.isAvailable) {
            return NextResponse.json(
              { error: "Desain kartu ucapan sudah tidak tersedia." },
              { status: 400 }
            );
          }

          const { selectedColor, selectedDesign } = resolvePackagingVariants(
            pack,
            item.selectedColor,
            item.selectedDesign
          );

          let compsSum = 0;
          const comps = item.components.map((c) => {
            const found = compMap.get(c.componentId);
            if (!found || !found.isAvailable || found.stock < c.quantity * item.quantity) {
              throw new Error(
                found
                  ? `Stok "${found.name}" tidak mencukupi (tersedia ${found.stock}).`
                  : "Komponen hadiah tidak tersedia."
              );
            }
            compsSum += found.price * c.quantity;
            return {
              componentId: found.id,
              name: found.name,
              price: found.price,
              quantity: c.quantity,
            };
          });

          const unitPrice = pack.price + compsSum + card.price;
          const subtotal = unitPrice * item.quantity;
          totalPrice += subtotal;
          resolvedItems.push({
            type: "custom_gift",
            name: `Custom Gift (${pack.name})`,
            unitPrice,
            quantity: item.quantity,
            subtotal,
            customization: {
              packagingId: pack.id,
              packagingName: pack.name,
              packagingPrice: pack.price,
              selectedColor,
              selectedDesign,
              components: comps,
              cardDesignId: card.id,
              cardDesignName: card.name,
              cardDesignPrice: card.price,
              greetingMessage: item.greetingMessage,
            },
          });
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Data pesanan tidak valid.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const orderNumber = nextDevOrderNumber();
    const accessToken = crypto.randomBytes(12).toString("hex");
    const nowIso = new Date().toISOString();
    const devOrder: Order = {
      id: `dev-${Date.now()}`,
      orderNumber,
      accessToken,
      idempotencyKey,
      customer: normalizedCustomer,
      items: resolvedItems,
      totalPrice,
      orderStatus: "Pending",
      paymentStatus: "Pending",
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    saveDevOrder(devOrder);

    return NextResponse.json(
      {
        orderId: devOrder.id,
        orderNumber: devOrder.orderNumber,
        accessToken: devOrder.accessToken,
        order: devOrder,
        whatsappUrl: buildWhatsAppOrderUrl(devOrder),
      },
      { status: 201 }
    );
  }

  // Authoritative Firestore transaction
  const db = getAdminDb();

  try {
    const createdOrder = await db.runTransaction(async (tx) => {
      const idemRef = db.collection(COLLECTIONS.idempotencyKeys).doc(idempotencyKey);
      const idemSnap = await tx.get(idemRef);
      if (idemSnap.exists) {
        const existingOrderId = String(idemSnap.data()?.orderId || "");
        const existingSnap = await tx.get(
          db.collection(COLLECTIONS.orders).doc(existingOrderId)
        );
        if (existingSnap.exists) {
          return existingSnap.data() as Order;
        }
      }

      const resolvedItems: OrderItem[] = [];
      let totalPrice = 0;

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

      const componentSnaps = new Map<string, FirebaseFirestore.DocumentSnapshot>();
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
          const { selectedColor, selectedDesign } = resolvePackagingVariants(
            pack,
            item.selectedColor,
            item.selectedDesign
          );
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
              selectedColor,
              selectedDesign,
              components: componentsSnapshot,
              cardDesignId: item.cardDesignId,
              cardDesignName: String(card.name),
              cardDesignPrice,
              greetingMessage: item.greetingMessage,
            },
          });
        }
      }

      const year = new Date().getFullYear();
      const counterRef = db.collection(COLLECTIONS.counters).doc("orders");
      const counterSnap = await tx.get(counterRef);

      for (const [compId, usedQty] of componentUsage.entries()) {
        const snap = componentSnaps.get(compId)!;
        const currentStock = Number(snap.data()!.stock || 0);
        const nextStock = currentStock - usedQty;
        tx.update(snap.ref, {
          stock: nextStock,
          isAvailable: nextStock > 0 ? Boolean(snap.data()!.isAvailable) : false,
        });
      }

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
        accessToken: crypto.randomBytes(12).toString("hex"),
        idempotencyKey,
        customer: normalizedCustomer,
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

    return NextResponse.json(
      {
        orderId: createdOrder.id,
        orderNumber: createdOrder.orderNumber,
        accessToken: createdOrder.accessToken,
        order: createdOrder,
        whatsappUrl: buildWhatsAppOrderUrl(createdOrder),
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
