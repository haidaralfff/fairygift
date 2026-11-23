interface OrderConfirmationPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { orderNumber } = await params;

  return (
    <div className="mx-auto max-w-[800px] px-4 py-8 md:px-6">
      <h1 className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12">
        Pesanan <span className="font-mono tabular-nums">{orderNumber}</span>
      </h1>
      <p className="mt-2 text-[length:var(--text-body)] text-ink-11">
        Halaman konfirmasi pesanan yang dapat di-bookmark, lengkap dengan tombol WhatsApp Admin
        dan fallback salin pesan.
      </p>
    </div>
  );
}
