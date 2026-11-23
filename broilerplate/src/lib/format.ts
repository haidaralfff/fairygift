import type { Order } from "@/types/domain";

const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount).replace(/\s+/g, "");
}

export function formatDateId(isoOrDate: string): string {
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return isoOrDate;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getMinDeliveryDate(leadDays = 2): string {
  const target = new Date();
  target.setDate(target.getDate() + leadDays);
  return target.toISOString().slice(0, 10);
}

export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith("62")) {
    return digits;
  }
  return `62${digits}`;
}

export function buildWhatsAppOrderMessage(
  order: Pick<Order, "orderNumber" | "customer" | "items" | "totalPrice">
): string {
  const itemLines = order.items.map((item, idx) => {
    if (item.type === "ready_made") {
      return `${idx + 1}. ${item.name} (${item.quantity}x) - ${formatRupiah(item.subtotal)}`;
    }
    const c = item.customization;
    const componentNames = c.components
      .map((comp) => `${comp.name}${comp.quantity > 1 ? ` (${comp.quantity}x)` : ""}`)
      .join(", ");
    const greetingLine = c.greetingMessage
      ? `\n   Pesan kartu: "${c.greetingMessage}"`
      : "";
    return `${idx + 1}. Custom Gift (${item.quantity}x) - ${formatRupiah(item.subtotal)}\n   Kemasan: ${c.packagingName} (${c.selectedColor.name})\n   Isi: ${componentNames}\n   Kartu: ${c.cardDesignName}${greetingLine}`;
  });

  const deliveryLabel =
    order.customer.deliveryMethod === "delivery"
      ? `Pengiriman ke ${order.customer.address}`
      : "Ambil sendiri";

  return [
    `Halo Admin FairyGift, saya sudah membuat pesanan dengan detail berikut:`,
    ``,
    `No. Pesanan: ${order.orderNumber}`,
    `Nama Pemesan: ${order.customer.buyerName}`,
    `Nama Penerima: ${order.customer.recipientName}`,
    `Metode: ${deliveryLabel}`,
    `Tanggal Kirim/Ambil: ${formatDateId(order.customer.deliveryDate)}`,
    ``,
    `Daftar Pesanan:`,
    ...itemLines,
    ``,
    `Total Pembayaran: ${formatRupiah(order.totalPrice)}`,
    order.customer.notes ? `Catatan: ${order.customer.notes}` : null,
    ``,
    `Mohon informasi nomor rekening/pembayaran untuk melanjutkan pesanan ini. Terima kasih.`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

export function buildWhatsAppOrderUrl(
  order: Pick<Order, "orderNumber" | "customer" | "items" | "totalPrice">,
  adminWhatsApp = process.env.NEXT_PUBLIC_WHATSAPP_ADMIN_NUMBER || "6281234567890"
): string {
  const cleanPhone = normalizeWhatsAppNumber(adminWhatsApp);
  const message = buildWhatsAppOrderMessage(order);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
