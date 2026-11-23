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

export const ORDER_STATUS_META: Record<
  OrderStatus,
  {
    label: string;
    tone: "amber" | "blue" | "green" | "neutral";
    ping?: boolean;
  }
> = {
  Pending: { label: "Pending", tone: "amber" },
  Processing: { label: "Processing", tone: "blue", ping: true },
  Ready: { label: "Ready", tone: "green", ping: true },
  Completed: { label: "Completed", tone: "green" },
  Cancelled: { label: "Cancelled", tone: "neutral" },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  {
    label: string;
    tone: "amber" | "green" | "red" | "neutral";
  }
> = {
  Pending: { label: "Pending", tone: "amber" },
  Paid: { label: "Paid", tone: "green" },
  Rejected: { label: "Rejected", tone: "red" },
  Refunded: { label: "Refunded", tone: "neutral" },
};

export const MAKE_TO_ORDER_LEAD_DAYS = 2;
export const CUSTOM_GIFT_CARD_MAX_CHARS = 250;
