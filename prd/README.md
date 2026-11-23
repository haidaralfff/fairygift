# FairyGift – Custom Gift E-Commerce Platform (PRD v1.2)

- **Versi:** 1.2
- **Status:** Draft
- **Produk:** FairyGift
- **Jenis Produk:** Website E-Commerce
- **Model Bisnis:** B2C (Business-to-Consumer)
- **Model Pemesanan:** Make-to-Order
- **Metode Pembayaran:** Manual melalui WhatsApp

---

## Struktur Folder PRD

Folder ini memecah dokumen PRD **FairyGift** ke dalam file modular agar mudah dibaca dan dieksekusi secara bertahap oleh *agent skills*.

| No | File / Folder | Cakupan Bagian PRD |
|---|---|---|
| 1 | [01-product-overview.md](./01-product-overview.md) | 1. Product Overview, 2. Target Users, 3. Product Scope (In/Out of Scope) |
| 2 | [02-functional-requirements/](./02-functional-requirements/) | 4. Functional Requirements (4.1 – 4.9 per fitur) |
| 3 | [03-user-flows.md](./03-user-flows.md) | 5. User Flow (Customer Flow & Admin Flow) |
| 4 | [04-business-rules.md](./04-business-rules.md) | 6. Business Rules (17 aturan bisnis wajib) |
| 5 | [05-non-functional-requirements.md](./05-non-functional-requirements.md) | 7. Non-Functional Requirements (Performance, Security, Usability, Reliability) |
| 6 | [06-data-requirements-and-statuses.md](./06-data-requirements-and-statuses.md) | 8. Data Requirements & 9. Order and Payment Status |
| 7 | [07-mvp-and-success-metrics.md](./07-mvp-and-success-metrics.md) | 10. MVP Prioritization & 11. Success Metrics |
| 8 | [08-assumptions-and-open-questions.md](./08-assumptions-and-open-questions.md) | 12. Assumptions & Open Questions, 13. Conclusion |

### Daftar Functional Requirements (`02-functional-requirements/`)

- [01-homepage.md](./02-functional-requirements/01-homepage.md) — 4.1 Homepage
- [02-product-catalog.md](./02-functional-requirements/02-product-catalog.md) — 4.2 Product Catalog
- [03-custom-gift-builder.md](./02-functional-requirements/03-custom-gift-builder.md) — 4.3 Custom Gift Builder
- [04-dynamic-price-calculation.md](./02-functional-requirements/04-dynamic-price-calculation.md) — 4.4 Dynamic Price Calculation
- [05-shopping-cart.md](./02-functional-requirements/05-shopping-cart.md) — 4.5 Shopping Cart
- [06-checkout.md](./02-functional-requirements/06-checkout.md) — 4.6 Checkout
- [07-whatsapp-integration.md](./02-functional-requirements/07-whatsapp-integration.md) — 4.7 WhatsApp Integration
- [08-manual-payment-management.md](./02-functional-requirements/08-manual-payment-management.md) — 4.8 Manual Payment Management
- [09-admin-dashboard.md](./02-functional-requirements/09-admin-dashboard.md) — 4.9 Admin Dashboard

---

## Panduan Eksekusi untuk Skills

Urutan yang disarankan saat membuat atau menjalankan *skill* untuk mengeksekusi PRD ini:

1. **Clarify Open Questions:** Tinjau [08-assumptions-and-open-questions.md](./08-assumptions-and-open-questions.md) sebelum finalisasi arsitektur (guest checkout, stok komponen, upload bukti, dll.).
2. **Database & Domain Model:** Gunakan [06-data-requirements-and-statuses.md](./06-data-requirements-and-statuses.md) dan [04-business-rules.md](./04-business-rules.md) untuk merancang skema database (termasuk snapshot harga dan pemisahan `order_status` vs `payment_status`).
3. **Backend API & Security:** Implementasikan validasi server-side, kalkulasi harga ulang di server, pembuatan nomor pesanan unik (`FG-YYYY-XXXX`), autentikasi/otorisasi admin sesuai [05-non-functional-requirements.md](./05-non-functional-requirements.md).
4. **Customer Storefront:** Bangun fitur `01-homepage` hingga `07-whatsapp-integration` mengikuti [03-user-flows.md](./03-user-flows.md).
5. **Admin Dashboard:** Bangun fitur `08-manual-payment-management` dan `09-admin-dashboard`.
6. **Verification & Acceptance:** Uji setiap fitur terhadap Acceptance Criteria di `02-functional-requirements/` dan target di [07-mvp-and-success-metrics.md](./07-mvp-and-success-metrics.md).
