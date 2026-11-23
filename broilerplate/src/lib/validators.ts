import { z } from "zod";
import { CUSTOM_GIFT_CARD_MAX_CHARS } from "@/lib/constants";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export const checkoutCustomerSchema = z
  .object({
    buyerName: z.string().trim().min(2, "Nama pemesan minimal 2 karakter."),
    recipientName: z.string().trim().min(2, "Nama penerima minimal 2 karakter."),
    whatsapp: z
      .string()
      .trim()
      .regex(/^(?:\+?62|0)8\d{7,12}$/, "Nomor WhatsApp tidak valid. Contoh: 081234567890."),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    address: z.string().trim().optional().default(""),
    deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal kirim atau ambil."),
    notes: z.string().trim().max(300, "Catatan maksimal 300 karakter.").optional().default(""),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "delivery" && data.address.trim().length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message: "Alamat lengkap pengiriman wajib diisi minimal 8 karakter.",
      });
    }
  });

export const readyMadeCheckoutItemSchema = z.object({
  type: z.literal("ready_made"),
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(50),
});

export const customGiftCheckoutItemSchema = z.object({
  type: z.literal("custom_gift"),
  quantity: z.number().int().min(1).max(20),
  packagingId: z.string().min(1),
  selectedColor: z.object({
    name: z.string().min(1),
    hex: z.string().min(4),
  }),
  components: z
    .array(
      z.object({
        componentId: z.string().min(1),
        quantity: z.number().int().min(1).max(20).default(1),
      })
    )
    .min(1, "Pilih minimal 1 isi hadiah."),
  cardDesignId: z.string().min(1),
  greetingMessage: z
    .string()
    .trim()
    .max(CUSTOM_GIFT_CARD_MAX_CHARS, `Pesan kartu maksimal ${CUSTOM_GIFT_CARD_MAX_CHARS} karakter.`)
    .optional()
    .default(""),
});

export const checkoutPayloadSchema = z.object({
  idempotencyKey: z.string().min(8, "Token transaksi tidak valid."),
  customer: checkoutCustomerSchema,
  items: z
    .array(z.discriminatedUnion("type", [readyMadeCheckoutItemSchema, customGiftCheckoutItemSchema]))
    .min(1, "Keranjang tidak boleh kosong."),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Nama produk wajib diisi."),
  categoryId: z.string().min(1, "Pilih kategori produk."),
  price: z.number().int().min(1000, "Harga minimal Rp1.000."),
  description: z.string().trim().min(5, "Deskripsi minimal 5 karakter."),
  imageUrl: z.string().url("URL gambar tidak valid."),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export const orderStatusUpdateSchema = z.object({
  orderStatus: z.enum(["Pending", "Processing", "Ready", "Completed", "Cancelled"]),
});

export const paymentVerificationSchema = z.object({
  paymentStatus: z.enum(["Pending", "Paid", "Rejected", "Refunded"]),
  note: z.string().trim().max(250).optional().default(""),
});
