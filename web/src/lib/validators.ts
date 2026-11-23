import { z } from "zod";
import { CUSTOM_GIFT_CARD_MAX_CHARS, MAKE_TO_ORDER_LEAD_DAYS } from "@/lib/constants";
import { getMinDeliveryDate } from "@/lib/format";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export const checkoutCustomerSchema = z
  .object({
    buyerName: z.string().trim().min(2, "Masukkan nama pemesan minimal 2 huruf."),
    recipientName: z.string().trim().optional().default(""),
    whatsapp: z
      .string()
      .trim()
      .regex(
        /^(?:\+?62|0)8\d{7,12}$/,
        "Nomor WhatsApp belum sesuai. Gunakan nomor aktif yang diawali 08 atau 62, contoh: 081234567890."
      ),
    deliveryMethod: z.enum(["delivery", "pickup"]),
    address: z.string().trim().optional().default(""),
    deliveryDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal pengiriman atau pengambilan pesanan."),
    notes: z
      .string()
      .trim()
      .max(300, "Catatan maksimal 300 karakter agar mudah terbaca oleh tim kami.")
      .optional()
      .default(""),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "delivery" && data.address.trim().length < 8) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["address"],
        message:
          "Tuliskan alamat lengkap pengiriman minimal 8 karakter (jalan, nomor rumah, dan patokan).",
      });
    }
    const minDate = getMinDeliveryDate(MAKE_TO_ORDER_LEAD_DAYS);
    if (data.deliveryDate < minDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["deliveryDate"],
        message: `Pilih tanggal minimal ${MAKE_TO_ORDER_LEAD_DAYS} hari dari hari ini agar tim kami punya waktu merangkai kado Anda.`,
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
  selectedDesign: z.string().min(1),
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
  idempotencyKey: z
    .string()
    .min(8, "Sesi pemesanan kedaluwarsa. Muat ulang halaman lalu coba kembali."),
  customer: checkoutCustomerSchema,
  items: z
    .array(z.discriminatedUnion("type", [readyMadeCheckoutItemSchema, customGiftCheckoutItemSchema]))
    .min(1, "Keranjang Anda masih kosong."),
});

export const productInputSchema = z.object({
  name: z.string().trim().min(2, "Nama produk wajib diisi minimal 2 huruf."),
  categoryId: z.string().min(1, "Pilih kategori produk terlebih dahulu."),
  price: z.number().int().min(1000, "Harga produk minimal Rp1.000."),
  description: z.string().trim().min(5, "Tuliskan deskripsi produk minimal 5 karakter."),
  contents: z.array(z.string().trim().min(1)).optional().default([]),
  imageUrl: z.string().min(1, "Foto produk wajib diunggah atau diisi tautannya."),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().optional().default(false),
});

export const packagingInputSchema = z.object({
  name: z.string().trim().min(2, "Nama kemasan wajib diisi minimal 2 huruf."),
  description: z.string().trim().optional().default(""),
  price: z.number().int().min(0, "Harga tidak boleh kurang dari Rp0."),
  colors: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        hex: z.string().trim().min(4),
      })
    )
    .min(1, "Tambahkan minimal 1 pilihan warna kemasan."),
  designs: z.array(z.string().trim().min(1)).min(1, "Tambahkan minimal 1 varian desain kemasan."),
  imageUrl: z.string().min(1, "Foto kemasan wajib diunggah atau diisi tautannya."),
  isAvailable: z.boolean().default(true),
});

export const giftComponentInputSchema = z.object({
  name: z.string().trim().min(2, "Nama isi hadiah wajib diisi minimal 2 huruf."),
  category: z.string().trim().min(1, "Pilih kategori isi hadiah terlebih dahulu."),
  description: z.string().trim().optional().default(""),
  price: z.number().int().min(1000, "Harga isi hadiah minimal Rp1.000."),
  stock: z.number().int().min(0, "Jumlah stok tidak boleh kurang dari 0."),
  imageUrl: z.string().min(1, "Foto isi hadiah wajib diunggah atau diisi tautannya."),
  isAvailable: z.boolean().default(true),
});

export const cardDesignInputSchema = z.object({
  name: z.string().trim().min(2, "Nama desain kartu ucapan wajib diisi minimal 2 huruf."),
  description: z.string().trim().optional().default(""),
  price: z.number().int().min(0, "Biaya tambahan tidak boleh kurang dari Rp0."),
  imageUrl: z.string().min(1, "Foto kartu ucapan wajib diunggah atau diisi tautannya."),
  isAvailable: z.boolean().default(true),
});

export const orderStatusUpdateSchema = z.object({
  orderStatus: z.enum(["Pending", "Processing", "Ready", "Completed", "Cancelled"]),
});

export const paymentVerificationSchema = z.object({
  paymentStatus: z.enum(["Pending", "Paid", "Rejected", "Refunded"]),
  note: z.string().trim().max(250).optional().default(""),
});
