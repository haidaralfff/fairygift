export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-[440px] px-4 py-8 md:px-6">
      <h1 className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12">
        Checkout pesanan
      </h1>
      <p className="mt-2 text-[length:var(--text-body)] text-ink-11">
        Form data pemesan, penerima, pengiriman/ambil sendiri, dan submit ke{" "}
        <code className="font-mono text-ink-12">POST /api/checkout</code>.
      </p>
    </div>
  );
}
