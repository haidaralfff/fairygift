"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "@/components/cart/cart-provider";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { MAKE_TO_ORDER_LEAD_DAYS } from "@/lib/constants";
import { formatRupiah, getMinDeliveryDate } from "@/lib/format";
import { checkoutCustomerSchema } from "@/lib/validators";
import type { DeliveryMethod } from "@/types/domain";

type FieldName =
  | "buyerName"
  | "recipientName"
  | "whatsapp"
  | "address"
  | "deliveryDate"
  | "notes";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, hydrated, totalPrice, clearCart } = useCart();

  const minDate = getMinDeliveryDate(MAKE_TO_ORDER_LEAD_DAYS);

  const [buyerName, setBuyerName] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("delivery");
  const [address, setAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(minDate);
  const [notes, setNotes] = useState("");

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [submittedWithErrors, setSubmittedWithErrors] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errorSummaryRef = useRef<HTMLDivElement | null>(null);

  // One stable idempotency token per checkout session
  const idempotencyKeyRef = useRef<string>("");
  useEffect(() => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `fg-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
  }, []);

  function validateSingleField(field: FieldName) {
    const result = checkoutCustomerSchema.safeParse({
      buyerName,
      recipientName,
      whatsapp,
      deliveryMethod,
      address,
      deliveryDate,
      notes,
    });

    if (result.success) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
      return;
    }

    const flattened = result.error.flatten().fieldErrors;
    const errMsg = flattened[field]?.[0];
    setFieldErrors((prev) => ({ ...prev, [field]: errMsg }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError(null);

    const parsed = checkoutCustomerSchema.safeParse({
      buyerName,
      recipientName,
      whatsapp,
      deliveryMethod,
      address,
      deliveryDate,
      notes,
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      const nextErrors: Partial<Record<FieldName, string>> = {
        buyerName: flattened.buyerName?.[0],
        recipientName: flattened.recipientName?.[0],
        whatsapp: flattened.whatsapp?.[0],
        address: flattened.address?.[0],
        deliveryDate: flattened.deliveryDate?.[0],
        notes: flattened.notes?.[0],
      };
      setFieldErrors(nextErrors);
      setSubmittedWithErrors(true);

      requestAnimationFrame(() => {
        errorSummaryRef.current?.focus();
      });
      return;
    }

    setSubmittedWithErrors(false);
    setFieldErrors({});
    setSubmitting(true);

    try {
      const payloadItems = items.map((item) => {
        if (item.type === "ready_made") {
          return {
            type: "ready_made" as const,
            productId: item.productId,
            quantity: item.quantity,
          };
        }
        return {
          type: "custom_gift" as const,
          quantity: item.quantity,
          packagingId: item.customization.packagingId,
          selectedColor: item.customization.selectedColor,
          selectedDesign: item.customization.selectedDesign,
          components: item.customization.components.map((c) => ({
            componentId: c.componentId,
            quantity: c.quantity,
          })),
          cardDesignId: item.customization.cardDesignId,
          greetingMessage: item.customization.greetingMessage,
        };
      });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idempotencyKey: idempotencyKeyRef.current,
          customer: parsed.data,
          items: payloadItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error || "Gagal membuat pesanan. Silakan coba lagi.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(
        `/pesanan/${encodeURIComponent(data.orderNumber)}?t=${encodeURIComponent(
          data.accessToken
        )}`
      );
    } catch {
      setServerError("Koneksi terganggu. Data Anda tetap aman, silakan coba lagi.");
      setSubmitting(false);
    }
  }

  const activeErrorEntries = (
    [
      ["buyerName", "Nama pemesan", fieldErrors.buyerName],
      ["recipientName", "Nama penerima", fieldErrors.recipientName],
      ["whatsapp", "Nomor WhatsApp", fieldErrors.whatsapp],
      ["address", "Alamat pengiriman", fieldErrors.address],
      ["deliveryDate", "Tanggal kirim/ambil", fieldErrors.deliveryDate],
      ["notes", "Catatan tambahan", fieldErrors.notes],
    ] as Array<[FieldName, string, string | undefined]>
  ).filter((entry): entry is [FieldName, string, string] => Boolean(entry[2]));

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-[800px] px-4 py-8 md:px-6">
        <div className="h-7 w-40 animate-pulse rounded-[var(--radius-control)] bg-ink-4" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[440px] px-4 py-12 md:px-6">
        <div className="rounded-[var(--radius-container)] bg-ink-2 p-11 text-center">
          <p className="text-[length:var(--text-body)] text-ink-12">
            Keranjang Anda masih kosong.
          </p>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
            Pilih paket hadiah atau rangkai kado custom terlebih dahulu sebelum mengisi data pengiriman.
          </p>
          <Link
            href="/katalog"
            className="mt-5 inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
          >
            Lihat katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[920px] px-4 py-8 md:px-6">
      <h1 className="font-display text-[26px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-12 md:text-[30px]">
        Data pemesanan &amp; pengiriman
      </h1>
      <p className="mt-1.5 text-[length:var(--text-body)] font-normal text-ink-11">
        Lengkapi data di bawah ini agar tim kami dapat menyiapkan kado dan mengirimkan rincian pembayaran melalui WhatsApp.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-12">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="surface-panel space-y-5 rounded-[var(--radius-feature)] border-[0.5px] border-[var(--line)] bg-[var(--panel)] p-5 shadow-[var(--shadow-panel)] md:col-span-7 md:p-6"
        >
          {submittedWithErrors && activeErrorEntries.length > 0 ? (
            <div
              ref={errorSummaryRef}
              tabIndex={-1}
              role="alert"
              aria-labelledby="checkout-error-summary-title"
              className="rounded-[var(--radius-control)] bg-[var(--red-3)] p-3.5 text-[length:var(--text-body)] text-[var(--red-11)] focus:outline-none focus:ring-2 focus:ring-[var(--red-9)]"
            >
              <p id="checkout-error-summary-title">
                Mohon periksa kembali {activeErrorEntries.length} data yang perlu dilengkapi:
              </p>
              <ul className="mt-1.5 space-y-1.5 text-[length:var(--text-meta)]">
                {activeErrorEntries.map(([field, label, message]) => (
                  <li key={field} className="flex items-start gap-2">
                    <span aria-hidden="true" className="shrink-0">
                      •
                    </span>
                    <button
                      type="button"
                      onClick={() => document.getElementById(`field-${field}`)?.focus()}
                      className="text-left underline underline-offset-2 hover:text-ink-12"
                    >
                      {label}: {message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {serverError ? (
            <div
              role="alert"
              className="rounded-[var(--radius-control)] bg-[var(--red-3)] p-3.5 text-[length:var(--text-body)] text-[var(--red-11)]"
            >
              <p>{serverError}</p>
            </div>
          ) : null}

          {/* 1. Nama pemesan */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-buyerName" className="text-[length:var(--text-body)] font-medium text-ink-12">
              Nama lengkap pemesan
            </label>
            <input
              id="field-buyerName"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.buyerName)}
              aria-describedby={fieldErrors.buyerName ? "hint-buyerName err-buyerName" : "hint-buyerName"}
              readOnly={submitting}
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              onBlur={() => validateSingleField("buyerName")}
              placeholder="Contoh: Nadia Putri"
              className={`h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none ${
                fieldErrors.buyerName ? "shadow-[0_0_0_1px_var(--red-11)]" : ""
              }`}
            />
            <p id="hint-buyerName" className="text-[length:var(--text-meta)] text-ink-11">
              Nama pengirim kado atau pihak yang memesan dan melakukan konfirmasi.
            </p>
            {fieldErrors.buyerName ? (
              <p id="err-buyerName" role="alert" className="text-[length:var(--text-meta)] text-[var(--red-11)]">
                {fieldErrors.buyerName}
              </p>
            ) : null}
          </div>

          {/* 2. Nama penerima (opsional) */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-recipientName" className="text-[length:var(--text-body)] font-medium text-ink-12">
              Nama penerima kado <span className="font-normal text-ink-10">(opsional)</span>
            </label>
            <input
              id="field-recipientName"
              type="text"
              aria-describedby="hint-recipientName"
              readOnly={submitting}
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Kosongkan jika pesanan diterima sendiri"
              className="h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none"
            />
            <p id="hint-recipientName" className="text-[length:var(--text-meta)] text-ink-11">
              Diisi apabila kado dikirim langsung untuk orang lain agar tercantum pada label paket.
            </p>
          </div>

          {/* 3. Nomor WhatsApp */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-whatsapp" className="text-[length:var(--text-body)] font-medium text-ink-12">
              Nomor WhatsApp aktif
            </label>
            <input
              id="field-whatsapp"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.whatsapp)}
              aria-describedby={
                fieldErrors.whatsapp ? "hint-whatsapp err-whatsapp" : "hint-whatsapp"
              }
              readOnly={submitting}
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              onBlur={() => validateSingleField("whatsapp")}
              placeholder="Contoh: 081234567890"
              className={`h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none ${
                fieldErrors.whatsapp ? "shadow-[0_0_0_1px_var(--red-11)]" : ""
              }`}
            />
            <p id="hint-whatsapp" className="text-[length:var(--text-meta)] text-ink-11">
              Gunakan nomor diawali 08 atau 62. Admin mengirim info rekening bayar dan kabar pengiriman ke nomor ini.
            </p>
            {fieldErrors.whatsapp ? (
              <p id="err-whatsapp" role="alert" className="text-[length:var(--text-meta)] text-[var(--red-11)]">
                {fieldErrors.whatsapp}
              </p>
            ) : null}
          </div>

          {/* 4. Metode penerimaan */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[length:var(--text-body)] font-medium text-ink-12">
              Cara terima pesanan
            </span>
            <div className="pt-0.5">
              <SegmentedToggle
                ariaLabel="Cara terima pesanan"
                value={deliveryMethod}
                onChange={(val) => {
                  setDeliveryMethod(val);
                  if (val === "pickup") {
                    setFieldErrors((prev) => ({ ...prev, address: undefined }));
                  }
                }}
                options={[
                  { value: "delivery", label: "Diantar ke alamat" },
                  { value: "pickup", label: "Ambil di toko" },
                ]}
              />
            </div>
            <p className="text-[length:var(--text-meta)] text-ink-11">
              {deliveryMethod === "delivery"
                ? "Kado diantar kurir ke alamat tujuan. Estimasi ongkos kirim akan dikonfirmasi admin via WhatsApp."
                : "Ambil kado langsung di studio FairyGift tanpa ongkos kirim. Alamat dan jam ambil diinfokan via WhatsApp."}
            </p>
          </div>

          {/* 5. Alamat pengiriman (conditional) */}
          <AnimatePresence initial={false}>
            {deliveryMethod === "delivery" ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <label htmlFor="field-address" className="text-[length:var(--text-body)] font-medium text-ink-12">
                    Alamat lengkap pengiriman
                  </label>
                  <textarea
                    id="field-address"
                    rows={3}
                    required
                    aria-required="true"
                    aria-invalid={Boolean(fieldErrors.address)}
                    aria-describedby={fieldErrors.address ? "hint-address err-address" : "hint-address"}
                    readOnly={submitting}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onBlur={() => validateSingleField("address")}
                    placeholder="Contoh: Jl. Melati No. 12, Kec. Coblong, Kota Bandung (pagar putih, sebelah apotek)"
                    className={`min-h-21 rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none [overflow-wrap:break-word] ${
                      fieldErrors.address ? "shadow-[0_0_0_1px_var(--red-11)]" : ""
                    }`}
                  />
                  <p id="hint-address" className="text-[length:var(--text-meta)] text-ink-11">
                    Cantumkan nama jalan, nomor rumah, kecamatan, kota, dan patokan agar kurir cepat menemukan lokasi.
                  </p>
                  {fieldErrors.address ? (
                    <p id="err-address" role="alert" className="text-[length:var(--text-meta)] text-[var(--red-11)]">
                      {fieldErrors.address}
                    </p>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* 6. Tanggal kirim/ambil */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="field-deliveryDate" className="text-[length:var(--text-body)] font-medium text-ink-12">
              {deliveryMethod === "delivery"
                ? "Tanggal pengiriman yang diinginkan"
                : "Tanggal pengambilan di toko"}
            </label>
            <input
              id="field-deliveryDate"
              type="date"
              min={minDate}
              required
              aria-required="true"
              aria-invalid={Boolean(fieldErrors.deliveryDate)}
              aria-describedby={
                fieldErrors.deliveryDate
                  ? "hint-deliveryDate err-deliveryDate"
                  : "hint-deliveryDate"
              }
              readOnly={submitting}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              onBlur={() => validateSingleField("deliveryDate")}
              className={`tabular-nums h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 focus:bg-ink-4 focus:outline-none ${
                fieldErrors.deliveryDate ? "shadow-[0_0_0_1px_var(--red-11)]" : ""
              }`}
            />
            <p id="hint-deliveryDate" className="text-[length:var(--text-meta)] text-ink-11">
              {deliveryMethod === "delivery"
                ? `Pilih tanggal minimal ${MAKE_TO_ORDER_LEAD_DAYS} hari dari hari ini agar tim kami sempat merangkai dan menjadwalkan pengantaran.`
                : `Pilih tanggal minimal ${MAKE_TO_ORDER_LEAD_DAYS} hari dari hari ini agar pesanan sudah siap saat Anda ambil di toko.`}
            </p>
            {fieldErrors.deliveryDate ? (
              <p id="err-deliveryDate" role="alert" className="text-[length:var(--text-meta)] text-[var(--red-11)]">
                {fieldErrors.deliveryDate}
              </p>
            ) : null}
          </div>

          {/* 7. Catatan tambahan (opsional) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="field-notes" className="text-[length:var(--text-body)] font-medium text-ink-12">
                Catatan untuk tim atau kurir <span className="font-normal text-ink-10">(opsional)</span>
              </label>
              <span className="tabular-nums text-[length:var(--text-meta)] text-ink-10">
                {notes.length}/300
              </span>
            </div>
            <textarea
              id="field-notes"
              rows={2}
              maxLength={300}
              aria-describedby="hint-notes"
              readOnly={submitting}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Kirim siang pukul 13.00-15.00, atau titipkan ke resepsionis/satpam"
              className="min-h-18 rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none [overflow-wrap:break-word]"
            />
            <p id="hint-notes" className="text-[length:var(--text-meta)] text-ink-11">
              Tulis preferensi jam pengiriman, instruksi serah terima, atau permintaan khusus lainnya.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] font-medium text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.98] disabled:opacity-60"
            >
              {submitting ? "Menyimpan pesanan…" : "Buat pesanan & lanjut ke WhatsApp"}
            </button>
            <p className="text-center text-[length:var(--text-meta)] text-ink-11">
              Belum langsung membayar. Setelah pesanan tercatat, Anda akan diarahkan ke nota untuk konfirmasi via WhatsApp.
            </p>
          </div>
        </form>

        {/* Order Summary Column */}
        <aside className="md:col-span-5">
          <div className="surface-raised sticky top-20 rounded-[var(--radius-feature)] border-[0.5px] border-[var(--line)] bg-[var(--raised)] p-5 shadow-[var(--shadow-card)]">
            <h2 className="text-[length:var(--text-title)] text-ink-12">
              Ringkasan pesanan
            </h2>

            <ul className="mt-4 divide-y-[0.5px] divide-[var(--line)]">
              {items.map((item) => (
                <li key={item.cartItemId} className="py-2.5 text-[length:var(--text-body)]">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-ink-12">
                      {item.name} ({item.quantity}x)
                    </span>
                    <span className="tabular-nums shrink-0 text-ink-12">
                      {formatRupiah(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                  {item.type === "custom_gift" ? (
                    <p className="mt-0.5 text-[length:var(--text-meta)] text-ink-11">
                      {item.customization.selectedColor.name} ·{" "}
                      {item.customization.components.map((c) => c.name).join(", ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>

            <div className="hairline-t mt-3 flex items-baseline justify-between pt-3">
              <span className="text-[length:var(--text-body)] text-ink-11">
                Total pembayaran
              </span>
              <span className="tabular-nums text-[length:var(--text-figure)] font-semibold leading-[var(--leading-figure)] text-[var(--fg-rose-text)]">
                {formatRupiah(totalPrice)}
              </span>
            </div>

            <p className="mt-3 rounded-[var(--radius-control)] bg-[var(--fg-rose-soft)] px-3 py-2 text-[length:var(--text-meta)] text-[var(--fg-rose-text)]">
              Setelah membuat pesanan, Anda langsung menerima nomor pesanan beserta tombol kirim ke WhatsApp FairyGift.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
