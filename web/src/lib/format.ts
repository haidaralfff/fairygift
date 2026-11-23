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

export function formatDateTimeId(isoOrDate: string): string {
  const date = new Date(isoOrDate);
  if (Number.isNaN(date.getTime())) return isoOrDate;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getMinDeliveryDate(leadDays = 2): string {
  const target = new Date(Date.now() + leadDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(target);
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

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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
      ? `\n   Kartu Ucapan (${c.cardDesignName}): "${c.greetingMessage}"`
      : `\n   Kartu Ucapan: ${c.cardDesignName} (tanpa pesan)`;
    return `${idx + 1}. Custom Gift (${item.quantity}x) - ${formatRupiah(item.subtotal)}\n   Kemasan: ${c.packagingName} (${c.selectedColor.name}, ${c.selectedDesign})\n   Isi: ${componentNames}${greetingLine}`;
  });

  const deliveryLabel =
    order.customer.deliveryMethod === "delivery"
      ? `Pengiriman ke ${order.customer.address}`
      : "Ambil sendiri";

  return [
    `Halo FairyGift, saya ingin mengonfirmasi pesanan.`,
    ``,
    `Nomor Pesanan: ${order.orderNumber}`,
    `Nama Pemesan: ${order.customer.buyerName}`,
    `Nama Penerima: ${order.customer.recipientName}`,
    `Metode: ${deliveryLabel}`,
    `Tanggal Kirim/Ambil: ${formatDateId(order.customer.deliveryDate)}`,
    ``,
    `Detail Pesanan:`,
    ...itemLines,
    ``,
    `Total Harga: ${formatRupiah(order.totalPrice)}`,
    order.customer.notes ? `Catatan: ${order.customer.notes}` : null,
    ``,
    `Mohon informasi selanjutnya mengenai proses pembayaran. Terima kasih.`,
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
