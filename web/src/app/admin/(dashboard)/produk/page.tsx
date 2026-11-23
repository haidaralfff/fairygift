"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Search, Trash2, Upload } from "lucide-react";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { PillBadge } from "@/components/ui/pill-badge";
import { ResilientImage } from "@/components/ui/resilient-image";
import { TactileSwitch } from "@/components/ui/tactile-switch";
import { useToast } from "@/components/ui/toast";
import { DEMO_CATEGORIES } from "@/lib/data/demo-seed";
import { formatRupiah } from "@/lib/format";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validators";
import type { Category, Product } from "@/types/domain";

interface ProductFormState {
  name: string;
  categoryId: string;
  price: string;
  description: string;
  contentsText: string;
  imageUrl: string;
  isAvailable: boolean;
  isFeatured: boolean;
}

function emptyProductForm(defaultCategoryId: string): ProductFormState {
  return {
    name: "",
    categoryId: defaultCategoryId,
    price: "",
    description: "",
    contentsText: "",
    imageUrl: "",
    isAvailable: true,
    isFeatured: false,
  };
}

export default function AdminProductsPage() {
  const { user, configured, adminFetch } = useAdminAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [serverNote, setServerNote] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "available" | "inactive" | "featured"
  >("all");

  // Add / Edit Modal state
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormState>(() =>
    emptyProductForm(DEMO_CATEGORIES[0]?.id || "cat-box-gift")
  );
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Delete Confirmation Modal state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setServerNote(null);
    try {
      const res = await adminFetch("/api/admin/products");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerNote(data.error || "Gagal memuat daftar produk.");
        return;
      }
      setProducts(Array.isArray(data.products) ? data.products : []);
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(data.categories);
      }
    } catch {
      setServerNote("Terjadi gangguan jaringan saat memuat produk.");
    } finally {
      setLoading(false);
    }
  }, [user, adminFetch]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== "all" && p.categoryId !== categoryFilter) {
        return false;
      }
      if (statusFilter === "available" && !p.isAvailable) return false;
      if (statusFilter === "inactive" && p.isAvailable) return false;
      if (statusFilter === "featured" && !p.isFeatured) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        p.categoryName.toLowerCase().includes(needle) ||
        p.description.toLowerCase().includes(needle)
      );
    });
  }, [products, query, categoryFilter, statusFilter]);

  function openCreateModal() {
    const defaultCat = categories[0]?.id || DEMO_CATEGORIES[0]?.id || "cat-box-gift";
    setEditingProduct(null);
    setForm(emptyProductForm(defaultCat));
    setFormError(null);
    setDirty(false);
    setFormOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      price: String(product.price),
      description: product.description,
      contentsText: (product.contents || []).join(", "),
      imageUrl: product.imageUrl,
      isAvailable: product.isAvailable,
      isFeatured: Boolean(product.isFeatured),
    });
    setFormError(null);
    setDirty(false);
    setFormOpen(true);
  }

  function updateField<K extends keyof ProductFormState>(key: K, value: ProductFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setFormError(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      setFormError("Format gambar harus JPG, PNG, atau WebP.");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setFormError("Ukuran gambar maksimal 2 MB.");
      return;
    }

    setUploading(true);
    setFormError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "fairygift/products");
      const res = await adminFetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Gagal mengunggah gambar.");
      }
      updateField("imageUrl", String(data.url));
      showToast("Gambar berhasil diunggah.", "green");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Gagal mengunggah gambar.";
      setFormError(msg);
      showToast(msg, "red");
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    const numericPrice = Number(form.price.replace(/[^\d]/g, ""));
    if (form.name.trim().length < 2) {
      setFormError("Nama produk wajib diisi minimal 2 karakter.");
      return;
    }
    if (!form.categoryId) {
      setFormError("Kategori produk wajib dipilih.");
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 1000) {
      setFormError("Harga minimal Rp1.000.");
      return;
    }
    if (form.description.trim().length < 5) {
      setFormError("Deskripsi minimal 5 karakter.");
      return;
    }
    if (!form.imageUrl.trim()) {
      setFormError("Foto produk wajib diunggah atau diisi tautan gambarnya.");
      return;
    }

    const contents = form.contentsText
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name: form.name.trim(),
      categoryId: form.categoryId,
      price: Math.round(numericPrice),
      description: form.description.trim(),
      contents,
      imageUrl: form.imageUrl.trim(),
      isAvailable: form.isAvailable,
      isFeatured: form.isFeatured,
    };

    setSaving(true);
    setFormError(null);
    try {
      const endpoint = editingProduct
        ? `/api/admin/products/${encodeURIComponent(editingProduct.id)}`
        : "/api/admin/products";
      const method = editingProduct ? "PATCH" : "POST";

      const res = await adminFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan produk.");
      }

      if (editingProduct && data.product) {
        setProducts((prev) =>
          prev.map((item) => (item.id === editingProduct.id ? data.product : item))
        );
        showToast("Produk berhasil diperbarui.", "green");
      } else if (data.product) {
        setProducts((prev) => [data.product, ...prev]);
        showToast("Produk baru berhasil ditambahkan.", "green");
      } else {
        await loadProducts();
      }
      setFormOpen(false);
      setDirty(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleAvailability(product: Product, nextValue: boolean) {
    const previousValue = product.isAvailable;
    setTogglingId(product.id);
    // Optimistic update
    setProducts((prev) =>
      prev.map((item) =>
        item.id === product.id ? { ...item, isAvailable: nextValue } : item
      )
    );

    try {
      const res = await adminFetch(`/api/admin/products/${encodeURIComponent(product.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextValue }),
      });
      if (!res.ok) {
        throw new Error("Gagal mengubah status ketersediaan.");
      }
      showToast(
        `${product.name} ${nextValue ? "diaktifkan" : "dinonaktifkan"}.`,
        "green"
      );
    } catch {
      // Revert optimistic state on failure
      setProducts((prev) =>
        prev.map((item) =>
          item.id === product.id ? { ...item, isAvailable: previousValue } : item
        )
      );
      showToast("Gagal memperbarui ketersediaan produk.", "red");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDeleteProduct() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await adminFetch(
        `/api/admin/products/${encodeURIComponent(deleteTarget.id)}`,
        { method: "DELETE" }
      );
      if (!res.ok) {
        throw new Error("Gagal menghapus produk.");
      }
      setProducts((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      showToast(`${deleteTarget.name} berhasil dihapus.`, "green");
      setDeleteTarget(null);
    } catch {
      showToast("Gagal menghapus produk.", "red");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-6">
      {/* Toolbar & Primary Action */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] flex-1 sm:max-w-[280px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-9"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama atau deskripsi produk…"
              aria-label="Cari produk"
              className="h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 pr-3 pl-9 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter kategori produk"
            className="h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 focus:bg-ink-4 focus:outline-none"
          >
            <option value="all">Semua kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "all" | "available" | "inactive" | "featured"
              )
            }
            aria-label="Filter status produk"
            className="h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 focus:bg-ink-4 focus:outline-none"
          >
            <option value="all">Semua status</option>
            <option value="available">Tersedia</option>
            <option value="inactive">Nonaktif</option>
            <option value="featured">Unggulan</option>
          </select>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          disabled={!configured || !user}
          className="touch-target inline-flex h-[var(--control-h)] items-center gap-2 rounded-[var(--radius-control)] bg-[var(--primary-bg)] px-4 text-[length:var(--text-body)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          Tambah produk
        </button>
      </div>

      {!configured ? (
        <div className="mt-4 rounded-[var(--radius-container)] bg-[var(--amber-3)] p-4 text-[length:var(--text-body)] text-[var(--amber-11)]">
          Mode uji coba aktif. Sambungkan layanan database terlebih dahulu untuk menyimpan dan mengubah katalog produk.
        </div>
      ) : null}

      {serverNote ? (
        <div className="mt-4 rounded-[var(--radius-container)] bg-[var(--red-3)] p-4 text-[length:var(--text-body)] text-[var(--red-11)]">
          {serverNote}
        </div>
      ) : null}

      {/* Table */}
      {loading ? (
        <div className="mt-4 h-64 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
      ) : filteredProducts.length === 0 ? (
        <div className="mt-6 rounded-[var(--radius-container)] bg-ink-2 p-11 text-center">
          <p className="text-[length:var(--text-body)] text-ink-12">
            {products.length === 0
              ? "Belum ada produk di katalog."
              : "Tidak ada produk yang cocok dengan pencarian."}
          </p>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
            {products.length === 0
              ? "Klik tombol \"Tambah produk\" di kanan atas untuk mulai menambahkan produk ke toko."
              : "Coba ubah kata kunci atau pilih kategori lain."}
          </p>
        </div>
      ) : (
        <div className="no-scrollbar mt-4 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                <th scope="col" className="px-3.5">Produk</th>
                <th scope="col" className="px-3.5">Kategori</th>
                <th scope="col" className="px-3.5">Harga</th>
                <th scope="col" className="px-3.5">Status</th>
                <th scope="col" className="px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-[var(--line)] text-[length:var(--text-body)]">
              {filteredProducts.map((product, idx) => (
                <tr
                  key={product.id}
                  className={`min-h-[var(--row-h)] ${
                    idx % 2 === 0 ? "bg-[var(--raised)]" : "bg-ink-2"
                  }`}
                >
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-3">
                      <ResilientImage
                        src={product.imageUrl}
                        alt={product.name}
                        className="size-8 shrink-0 rounded-[var(--radius-control)]"
                      />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="max-w-[26ch] truncate text-ink-12">
                            {product.name}
                          </p>
                          {product.isFeatured ? (
                            <PillBadge tone="plum">Unggulan</PillBadge>
                          ) : null}
                        </div>
                        <p className="max-w-[36ch] truncate text-[length:var(--text-meta)] text-ink-10">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 text-ink-11">{product.categoryName}</td>
                  <td className="tabular-nums px-3.5 text-ink-12">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="px-3.5">
                    <div className="flex items-center gap-2.5">
                      <TactileSwitch
                        checked={product.isAvailable}
                        disabled={togglingId === product.id}
                        onCheckedChange={(next) => handleToggleAvailability(product, next)}
                        ariaLabel={`Ubah ketersediaan ${product.name}`}
                      />
                      <span className="text-[length:var(--text-meta)] text-ink-11">
                        {product.isAvailable ? "Tersedia" : "Nonaktif"}
                      </span>
                    </div>
                  </td>
                  <td className="px-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {product.slug ? (
                        <Link
                          href={`/produk/${encodeURIComponent(product.slug)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Lihat ${product.name} di toko`}
                          className="touch-target inline-flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] text-ink-10 shadow-[var(--shadow-button)] hover:bg-ink-3 hover:text-ink-12"
                        >
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        aria-label={`Ubah ${product.name}`}
                        className="touch-target inline-flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] text-ink-11 shadow-[var(--shadow-button)] hover:bg-ink-3 hover:text-ink-12"
                      >
                        <Pencil className="size-4" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(product)}
                        aria-label={`Hapus ${product.name}`}
                        className="touch-target inline-flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] text-[var(--red-11)] shadow-[var(--shadow-button)] hover:bg-[var(--red-3)]"
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <ModalSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingProduct ? "Ubah produk" : "Tambah produk baru"}
        size="form"
        dirty={dirty}
        footer={
          <>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="touch-target inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
            >
              Batal
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={saving || uploading}
              className="touch-target inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--primary-bg)] px-4 text-[length:var(--text-body)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)] disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Simpan produk"}
            </button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSaveProduct} className="space-y-4">
          {formError ? (
            <p
              role="alert"
              className="rounded-[var(--radius-control)] bg-[var(--red-3)] px-3 py-2 text-[length:var(--text-body)] text-[var(--red-11)]"
            >
              {formError}
            </p>
          ) : null}

          <div>
            <label htmlFor="prod-name" className="block text-[length:var(--text-body)] text-ink-12">
              Nama produk
            </label>
            <input
              id="prod-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Contoh: Box Gift Blossom"
              className="mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="prod-category"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                Kategori
              </label>
              <select
                id="prod-category"
                value={form.categoryId}
                onChange={(e) => updateField("categoryId", e.target.value)}
                className="mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="prod-price"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                Harga (Rp)
              </label>
              <input
                id="prod-price"
                type="number"
                min={1000}
                step={500}
                required
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                placeholder="165000"
                className="tabular-nums mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
              />
            </div>
          </div>

          {/* Image Upload & URL Fallback */}
          <div>
            <span className="block text-[length:var(--text-body)] text-ink-12">
              Foto produk
            </span>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <ResilientImage
                src={form.imageUrl}
                alt={form.name || "Pratinjau foto produk"}
                className="size-16 shrink-0 rounded-[var(--radius-control)]"
              />
              <div className="flex-1 space-y-2">
                <label className="touch-target inline-flex h-[var(--control-h)] cursor-pointer items-center gap-2 rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-3">
                  <Upload className="size-4" aria-hidden="true" />
                  <span>{uploading ? "Mengunggah…" : "Unggah JPG/PNG/WebP"}</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
                <p className="text-[length:var(--text-meta)] text-ink-10">
                  Maksimal 2 MB. Atau masukkan tautan gambar langsung di bawah ini.
                </p>
              </div>
            </div>
            <input
              id="prod-image-url"
              type="text"
              value={form.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
              placeholder="Tempel tautan foto produk (contoh: /images/catalog/box-gift.svg)"
              aria-label="Tautan gambar produk"
              className="mt-2 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
            />
          </div>

          <div>
            <label
              htmlFor="prod-desc"
              className="block text-[length:var(--text-body)] text-ink-12"
            >
              Deskripsi produk
            </label>
            <textarea
              id="prod-desc"
              rows={3}
              required
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Jelaskan isi, nuansa warna, dan cocok untuk momen apa…"
              className="mt-1.5 min-h-20 w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
            />
          </div>

          <div>
            <label
              htmlFor="prod-contents"
              className="block text-[length:var(--text-body)] text-ink-12"
            >
              Daftar isi paket <span className="text-ink-10">(opsional, pisahkan dengan koma)</span>
            </label>
            <textarea
              id="prod-contents"
              rows={2}
              value={form.contentsText}
              onChange={(e) => updateField("contentsText", e.target.value)}
              placeholder="Mini dried flower, Cokelat praline 6 pcs, Kartu ucapan custom"
              className="mt-1.5 min-h-16 w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
            />
          </div>

          <div className="space-y-3 rounded-[var(--radius-control)] bg-ink-2 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[length:var(--text-body)] text-ink-12">
                  Tersedia untuk dipesan
                </p>
                <p className="text-[length:var(--text-meta)] text-ink-10">
                  Produk nonaktif tetap tersimpan namun tidak bisa dibeli pelanggan.
                </p>
              </div>
              <TactileSwitch
                checked={form.isAvailable}
                onCheckedChange={(v) => updateField("isAvailable", v)}
                ariaLabel="Tersedia untuk dipesan"
              />
            </div>

            <div className="hairline-t flex items-center justify-between gap-3 pt-3">
              <div>
                <p className="text-[length:var(--text-body)] text-ink-12">
                  Tampilkan di Produk Unggulan
                </p>
                <p className="text-[length:var(--text-meta)] text-ink-10">
                  Muncul pada bagian unggulan di beranda toko.
                </p>
              </div>
              <TactileSwitch
                checked={form.isFeatured}
                onCheckedChange={(v) => updateField("isFeatured", v)}
                ariaLabel="Tampilkan di Produk Unggulan"
              />
            </div>
          </div>
        </form>
      </ModalSheet>

      {/* Delete Confirmation Modal */}
      <ModalSheet
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus produk ini?"
        size="confirm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="touch-target inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={handleDeleteProduct}
              className="touch-target inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--red-9)] px-4 text-[length:var(--text-body)] text-[var(--red-contrast)] disabled:opacity-50"
            >
              {deleting ? "Menghapus…" : "Ya, hapus produk"}
            </button>
          </>
        }
      >
        <p className="text-[length:var(--text-body)] text-ink-11">
          Produk{" "}
          <span className="text-ink-12">{deleteTarget?.name}</span> akan dihapus permanen dari katalog. Tindakan ini tidak dapat dibatalkan.
        </p>
      </ModalSheet>
    </div>
  );
}
