export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Ready"
  | "Completed"
  | "Cancelled";

export type PaymentStatus =
  | "Pending"
  | "Paid"
  | "Rejected"
  | "Refunded";

export type DeliveryMethod = "delivery" | "pickup";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: "admin";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PackagingColor {
  name: string;
  hex: string;
}

export interface Packaging {
  id: string;
  name: string;
  description?: string;
  colors: PackagingColor[];
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface GiftComponent {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CardDesign {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CustomGiftSelection {
  packagingId: string;
  packagingName: string;
  packagingPrice: number;
  selectedColor: PackagingColor;
  components: Array<{
    componentId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  cardDesignId: string;
  cardDesignName: string;
  cardDesignPrice: number;
  greetingMessage: string;
}

export interface ReadyMadeOrderItem {
  type: "ready_made";
  productId: string;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CustomGiftOrderItem {
  type: "custom_gift";
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  customization: CustomGiftSelection;
}

export type OrderItem = ReadyMadeOrderItem | CustomGiftOrderItem;

export interface CustomerCheckoutInfo {
  buyerName: string;
  recipientName: string;
  whatsapp: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  deliveryDate: string; // YYYY-MM-DD
  notes: string;
}

export interface PaymentLog {
  id: string;
  fromStatus: PaymentStatus;
  toStatus: PaymentStatus;
  note: string;
  verifiedBy: string;
  verifiedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // FG-2026-0001
  idempotencyKey: string;
  customer: CustomerCheckoutInfo;
  items: OrderItem[];
  totalPrice: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  verifiedAt?: string;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}
