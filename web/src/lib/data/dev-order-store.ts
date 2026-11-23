import type { Order } from "@/types/domain";

const globalForDevStore = globalThis as unknown as {
  __fgDevOrders?: Map<string, Order>;
  __fgDevOrderSeq?: number;
};

function getOrderMap(): Map<string, Order> {
  if (!globalForDevStore.__fgDevOrders) {
    globalForDevStore.__fgDevOrders = new Map<string, Order>();
  }
  return globalForDevStore.__fgDevOrders;
}

export function nextDevOrderNumber(): string {
  const year = new Date().getFullYear();
  globalForDevStore.__fgDevOrderSeq = (globalForDevStore.__fgDevOrderSeq || 0) + 1;
  return `FG-${year}-${String(globalForDevStore.__fgDevOrderSeq).padStart(4, "0")}`;
}

export function findDevOrderByIdempotencyKey(key: string): Order | undefined {
  for (const order of getOrderMap().values()) {
    if (order.idempotencyKey === key) return order;
  }
  return undefined;
}

export function saveDevOrder(order: Order): void {
  getOrderMap().set(order.orderNumber, order);
}

export function getDevOrderByNumber(orderNumber: string): Order | undefined {
  return getOrderMap().get(orderNumber);
}
