import type { OrderStatus, PaymentStatus } from "@/types/domain";

export const COLLECTIONS = {
  users: "users",
  categories: "categories",
  products: "products",
  packagings: "packagings",
  giftComponents: "giftComponents",
  cardDesigns: "cardDesigns",
  orders: "orders",
  counters: "counters",
  idempotencyKeys: "idempotencyKeys",
} as const;

export const ORDER_STATUS_LIST: OrderStatus[] = [
  "Pending",
  "Processing",
  "Ready",
  "Completed",
  "Cancelled",
];

export const PAYMENT_STATUS_LIST: PaymentStatus[] = [
  "Pending",
  "Paid",
  "Rejected",
  "Refunded",
];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    tone: "plum" | "amber" | "blue" | "green" | "red" | "neutral";
    ping?: boolean;
    barColor: string;
  }
> = {
  Pending: { label: "Menunggu", tone: "amber", barColor: "bg-[var(--amber-9)]" },
  Processing: {
    label: "Disiapkan",
    tone: "blue",
    ping: true,
    barColor: "bg-[var(--blue-9)]",
  },
  Ready: {
    label: "Siap Kirim / Diambil",
    tone: "plum",
    ping: true,
    barColor: "bg-[var(--plum-9)]",
  },
  Completed: { label: "Selesai", tone: "green", barColor: "bg-[var(--green-9)]" },
  Cancelled: { label: "Dibatalkan", tone: "red", barColor: "bg-[var(--red-9)]" },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  {
    label: string;
    tone: "amber" | "green" | "red" | "neutral";
  }
> = {
  Pending: { label: "Belum Dibayar", tone: "amber" },
  Paid: { label: "Lunas", tone: "green" },
  Rejected: { label: "Ditolak", tone: "red" },
  Refunded: { label: "Dana Dikembalikan", tone: "neutral" },
};

export const MAKE_TO_ORDER_LEAD_DAYS = 2;
export const CUSTOM_GIFT_CARD_MAX_CHARS = 250;
export const COMPONENT_CATEGORIES = [
  "Semua",
  "Bunga",
  "Cokelat",
  "Boneka",
  "Parfum",
  "Tumbler",
  "Aksesori",
] as const;
