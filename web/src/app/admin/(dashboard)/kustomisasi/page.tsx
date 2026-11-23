"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useAdminAuth } from "@/components/admin/admin-auth-provider";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { ResilientImage } from "@/components/ui/resilient-image";
import { SegmentedToggle } from "@/components/ui/segmented-toggle";
import { StatusDot } from "@/components/ui/status-dot";
import { TactileSwitch } from "@/components/ui/tactile-switch";
import { useToast } from "@/components/ui/toast";
import { COMPONENT_CATEGORIES } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validators";
import type {
  CardDesign,
  GiftComponent,
  Packaging,
  PackagingColor,
} from "@/types/domain";

type TabResource = "packagings" | "giftComponents" | "cardDesigns";

interface FormState {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  isAvailable: boolean;
  // Packaging
  colors: PackagingColor[];
  designs: string[];
  designInput: string;
  // GiftComponent
  category: string;
  stock: string;
}

const DEFAULT_COMPONENT_CATEGORIES = COMPONENT_CATEGORIES.filter((c) => c !== "Semua");

function createEmptyForm(resource: TabResource): FormState {
  return {
    name: "",
    description: "",
    price: resource === "cardDesigns" ? "0" : "",
    imageUrl: "",
    isAvailable: true,
    colors: [
      { name: "Cream", hex: "#F5F0E6" },
      { name: "Dusty Plum", hex: "#AB4ABA" },
    ],
    designs: ["Minimalis", "Pita Satin"],
    designInput: "",
    category: DEFAULT_COMPONENT_CATEGORIES[0] || "Bunga",
    stock: "15",
  };
}

export default function AdminCustomizationsPage() {
  const { user, configured, adminFetch } = useAdminAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<TabResource>("packagings");
  const [packagings, setPackagings] = useState<Packaging[]>([]);
  const [giftComponents, setGiftComponents] = useState<GiftComponent[]>([]);
  const [cardDesigns, setCardDesigns] = useState<CardDesign[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverNote, setServerNote] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formResource, setFormResource] = useState<TabResource>("packagings");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() => createEmptyForm("packagings"));
  const [dirty, setDirty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingKey, setTogglingKey] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<{
    resource: TabResource;
    id: string;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setServerNote(null);
    try {
      const res = await adminFetch("/api/admin/customizations");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerNote(data.error || "Gagal memuat data kustomisasi.");
        return;
      }
      setPackagings(Array.isArray(data.packagings) ? data.packagings : []);
      setGiftComponents(Array.isArray(data.giftComponents) ? data.giftComponents : []);
      setCardDesigns(Array.isArray(data.cardDesigns) ? data.cardDesigns : []);
    } catch {
      setServerNote("Terjadi gangguan jaringan saat memuat kustomisasi.");
    } finally {
      setLoading(false);
    }
  }, [user, adminFetch]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateModal() {
    setFormResource(tab);
    setEditingId(null);
    setForm(createEmptyForm(tab));
    setFormError(null);
    setDirty(false);
    setFormOpen(true);
  }

  function openEditPackaging(item: Packaging) {
    setFormResource("packagings");
    setEditingId(item.id);
    setForm({
      ...createEmptyForm("packagings"),
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      colors: item.colors.length > 0 ? item.colors : [{ name: "Cream", hex: "#F5F0E6" }],
      designs: item.designs.length > 0 ? item.designs : ["Minimalis"],
    });
    setFormError(null);
    setDirty(false);
    setFormOpen(true);
  }

  function openEditComponent(item: GiftComponent) {
    setFormResource("giftComponents");
    setEditingId(item.id);
    setForm({
      ...createEmptyForm("giftComponents"),
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
      category: item.category,
      stock: String(item.stock),
    });
    setFormError(null);
    setDirty(false);
    setFormOpen(true);
  }

  function openEditCard(item: CardDesign) {
    setFormResource("cardDesigns");
    setEditingId(item.id);
    setForm({
      ...createEmptyForm("cardDesigns"),
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      imageUrl: item.imageUrl,
      isAvailable: item.isAvailable,
    });
    setFormError(null);
    setDirty(false);
    setFormOpen(true);
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
    setFormError(null);
  }

  function addColorRow() {
    updateField("colors", [...form.colors, { name: "Sage", hex: "#C7D3C0" }]);
  }

  function updateColorRow(idx: number, patch: Partial<PackagingColor>) {
    const next = form.colors.map((c, i) => (i === idx ? { ...c, ...patch } : c));
    updateField("colors", next);
  }

  function removeColorRow(idx: number) {
    if (form.colors.length <= 1) return;
    updateField(
      "colors",
      form.colors.filter((_, i) => i !== idx)
    );
  }

  function addDesignTag() {
    const val = form.designInput.trim();
    if (!val) return;
    if (!form.designs.includes(val)) {
      updateField("designs", [...form.designs, val]);
    }
    setForm((prev) => ({ ...prev, designInput: "" }));
  }

  function removeDesignTag(tag: string) {
    if (form.designs.length <= 1) return;
    updateField(
      "designs",
      form.designs.filter((d) => d !== tag)
    );
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
      fd.append("folder", "fairygift/customizations");
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

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const numericPrice = Number(form.price.replace(/[^\d]/g, "") || "0");

    if (form.name.trim().length < 2) {
      setFormError("Nama wajib diisi minimal 2 karakter.");
      return;
    }
    if (!form.imageUrl.trim()) {
      setFormError("Gambar wajib diunggah atau diisi URL.");
      return;
    }

    let dataPayload: Record<string, unknown>;

    if (formResource === "packagings") {
      const cleanColors = form.colors
        .map((c) => ({ name: c.name.trim(), hex: c.hex.trim() }))
        .filter((c) => c.name.length > 0 && c.hex.length >= 4);
      if (cleanColors.length === 0) {
        setFormError("Minimal harus ada 1 warna kemasan yang valid.");
        return;
      }
      const pendingDesign = form.designInput.trim();
      const designs = pendingDesign && !form.designs.includes(pendingDesign)
        ? [...form.designs, pendingDesign]
        : form.designs;
      if (designs.length === 0) {
        setFormError("Minimal 1 varian desain kemasan.");
        return;
      }
      dataPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Math.max(0, Math.round(numericPrice)),
        colors: cleanColors,
        designs,
        imageUrl: form.imageUrl.trim(),
        isAvailable: form.isAvailable,
      };
    } else if (formResource === "giftComponents") {
      if (numericPrice < 1000) {
        setFormError("Harga komponen minimal Rp1.000.");
        return;
      }
      const numericStock = Number(form.stock.replace(/[^\d]/g, ""));
      if (!Number.isFinite(numericStock) || numericStock < 0) {
        setFormError("Stok minimal 0.");
        return;
      }
      dataPayload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        price: Math.round(numericPrice),
        stock: Math.round(numericStock),
        imageUrl: form.imageUrl.trim(),
        isAvailable: form.isAvailable,
      };
    } else {
      dataPayload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Math.max(0, Math.round(numericPrice)),
        imageUrl: form.imageUrl.trim(),
        isAvailable: form.isAvailable,
      };
    }

    setSaving(true);
    setFormError(null);
    try {
      const res = await adminFetch("/api/admin/customizations", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          editingId
            ? { resource: formResource, id: editingId, data: dataPayload }
            : { resource: formResource, data: dataPayload }
        ),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan data kustomisasi.");
      }

      if (json.item) {
        if (formResource === "packagings") {
          setPackagings((prev) =>
            editingId
              ? prev.map((x) => (x.id === editingId ? json.item : x))
              : [...prev, json.item]
          );
        } else if (formResource === "giftComponents") {
          setGiftComponents((prev) =>
            editingId
              ? prev.map((x) => (x.id === editingId ? json.item : x))
              : [...prev, json.item]
          );
        } else {
          setCardDesigns((prev) =>
            editingId
              ? prev.map((x) => (x.id === editingId ? json.item : x))
              : [...prev, json.item]
          );
        }
      } else {
        await loadData();
      }

      showToast(
        editingId ? "Perubahan kustomisasi disimpan." : "Item kustomisasi ditambahkan.",
        "green"
      );
      setFormOpen(false);
      setDirty(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(
    resource: TabResource,
    id: string,
    name: string,
    previousValue: boolean,
    nextValue: boolean
  ) {
    const key = `${resource}:${id}`;
    setTogglingKey(key);

    const patchList = (val: boolean) => {
      if (resource === "packagings") {
        setPackagings((prev) =>
          prev.map((x) => (x.id === id ? { ...x, isAvailable: val } : x))
        );
      } else if (resource === "giftComponents") {
        setGiftComponents((prev) =>
          prev.map((x) => (x.id === id ? { ...x, isAvailable: val } : x))
        );
      } else {
        setCardDesigns((prev) =>
          prev.map((x) => (x.id === id ? { ...x, isAvailable: val } : x))
        );
      }
    };

    patchList(nextValue);

    try {
      const res = await adminFetch("/api/admin/customizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource,
          id,
          data: { isAvailable: nextValue },
        }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status.");
      showToast(`${name} ${nextValue ? "diaktifkan" : "dinonaktifkan"}.`, "green");
    } catch {
      patchList(previousValue);
      showToast("Gagal memperbarui ketersediaan.", "red");
    } finally {
      setTogglingKey(null);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const params = new URLSearchParams({
        resource: deleteTarget.resource,
        id: deleteTarget.id,
      });
      const res = await adminFetch(`/api/admin/customizations?${params.toString()}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Gagal menghapus.");

      if (deleteTarget.resource === "packagings") {
        setPackagings((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      } else if (deleteTarget.resource === "giftComponents") {
        setGiftComponents((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      } else {
        setCardDesigns((prev) => prev.filter((x) => x.id !== deleteTarget.id));
      }
      showToast(`${deleteTarget.name} berhasil dihapus.`, "green");
      setDeleteTarget(null);
    } catch {
      showToast("Gagal menghapus item kustomisasi.", "red");
    } finally {
      setDeleting(false);
    }
  }

  const addButtonLabel =
    tab === "packagings"
      ? "Tambah kemasan"
      : tab === "giftComponents"
        ? "Tambah komponen"
        : "Tambah kartu";

  const modalTitle = editingId
    ? formResource === "packagings"
      ? "Ubah kemasan"
      : formResource === "giftComponents"
        ? "Ubah komponen isi hadiah"
        : "Ubah desain kartu ucapan"
    : formResource === "packagings"
      ? "Tambah kemasan baru"
      : formResource === "giftComponents"
        ? "Tambah komponen isi hadiah"
        : "Tambah desain kartu ucapan";

  return (
    <div className="mx-auto max-w-[1200px] p-4 md:p-6">
      {/* Header Segmented Control + Primary Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedToggle
          ariaLabel="Jenis opsi kustomisasi"
          value={tab}
          onChange={setTab}
          options={[
            { value: "packagings", label: "Kemasan", count: packagings.length },
            { value: "giftComponents", label: "Isi Hadiah", count: giftComponents.length },
            { value: "cardDesigns", label: "Kartu Ucapan", count: cardDesigns.length },
          ]}
        />

        <button
          type="button"
          onClick={openCreateModal}
          disabled={!configured || !user}
          className="touch-target inline-flex h-[var(--control-h)] items-center gap-2 rounded-[var(--radius-control)] bg-[var(--primary-bg)] px-4 text-[length:var(--text-body)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" aria-hidden="true" />
          {addButtonLabel}
        </button>
      </div>

      {!configured ? (
        <div className="mt-4 rounded-[var(--radius-container)] bg-[var(--amber-3)] p-4 text-[length:var(--text-body)] text-[var(--amber-11)]">
          Konfigurasi Firebase belum diisi pada `.env.local`. Lengkapi kredensial Firebase Admin dan Client untuk mengelola opsi Custom Gift.
        </div>
      ) : null}

      {serverNote ? (
        <div className="mt-4 rounded-[var(--radius-container)] bg-[var(--red-3)] p-4 text-[length:var(--text-body)] text-[var(--red-11)]">
          {serverNote}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-4 h-64 animate-pulse rounded-[var(--radius-container)] bg-ink-3" />
      ) : tab === "packagings" ? (
        packagings.length === 0 ? (
          <EmptyBox
            title="Belum ada pilihan kemasan."
            description="Tambahkan kemasan seperti Box Eksklusif atau Bouquet Wrapping untuk Custom Gift Builder."
          />
        ) : (
          <div className="no-scrollbar mt-4 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
            <table className="w-full min-w-[780px] border-collapse text-left">
              <thead>
                <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                  <th scope="col" className="px-3.5">Kemasan</th>
                  <th scope="col" className="px-3.5">Warna</th>
                  <th scope="col" className="px-3.5">Varian desain</th>
                  <th scope="col" className="px-3.5">Harga</th>
                  <th scope="col" className="px-3.5">Status</th>
                  <th scope="col" className="px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-[var(--line)] text-[length:var(--text-body)]">
                {packagings.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`min-h-[var(--row-h)] ${
                      idx % 2 === 0 ? "bg-[var(--raised)]" : "bg-ink-2"
                    }`}
                  >
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-3">
                        <ResilientImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-8 shrink-0 rounded-[var(--radius-control)]"
                        />
                        <div className="min-w-0">
                          <p className="max-w-[26ch] truncate text-ink-12">{item.name}</p>
                          {item.description ? (
                            <p className="max-w-[30ch] truncate text-[length:var(--text-meta)] text-ink-10">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {item.colors.map((col, ci) => (
                          <span
                            key={`${col.name}-${ci}`}
                            className="inline-flex items-center gap-1.5 rounded-full bg-ink-3 px-2 py-0.5 text-[length:var(--text-meta)] text-ink-12"
                          >
                            <span
                              className="size-2.5 rounded-full border border-ink-6"
                              style={{ backgroundColor: col.hex }}
                              aria-hidden="true"
                            />
                            {col.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="max-w-[26ch] truncate px-3.5 text-ink-11">
                      {item.designs.join(", ")}
                    </td>
                    <td className="tabular-nums px-3.5 text-ink-12">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-3.5">
                      <TactileSwitch
                        checked={item.isAvailable}
                        disabled={togglingKey === `packagings:${item.id}`}
                        onCheckedChange={(next) =>
                          handleToggle("packagings", item.id, item.name, item.isAvailable, next)
                        }
                        ariaLabel={`Aktifkan kemasan ${item.name}`}
                      />
                    </td>
                    <td className="px-3.5">
                      <RowActions
                        name={item.name}
                        onEdit={() => openEditPackaging(item)}
                        onDelete={() =>
                          setDeleteTarget({
                            resource: "packagings",
                            id: item.id,
                            name: item.name,
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : tab === "giftComponents" ? (
        giftComponents.length === 0 ? (
          <EmptyBox
            title="Belum ada komponen isi hadiah."
            description="Tambahkan item seperti bunga, cokelat, boneka, atau parfum untuk dirangkai pelanggan."
          />
        ) : (
          <div className="no-scrollbar mt-4 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
            <table className="w-full min-w-[760px] border-collapse text-left">
              <thead>
                <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                  <th scope="col" className="px-3.5">Komponen</th>
                  <th scope="col" className="px-3.5">Kategori</th>
                  <th scope="col" className="px-3.5">Harga</th>
                  <th scope="col" className="px-3.5">Stok</th>
                  <th scope="col" className="px-3.5">Status</th>
                  <th scope="col" className="px-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-[var(--line)] text-[length:var(--text-body)]">
                {giftComponents.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`min-h-[var(--row-h)] ${
                      idx % 2 === 0 ? "bg-[var(--raised)]" : "bg-ink-2"
                    }`}
                  >
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-3">
                        <ResilientImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="size-8 shrink-0 rounded-[var(--radius-control)]"
                        />
                        <div className="min-w-0">
                          <p className="max-w-[28ch] truncate text-ink-12">{item.name}</p>
                          {item.description ? (
                            <p className="max-w-[32ch] truncate text-[length:var(--text-meta)] text-ink-10">
                              {item.description}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3.5 text-ink-11">{item.category}</td>
                    <td className="tabular-nums px-3.5 text-ink-12">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="tabular-nums px-3.5">
                      <StatusDot
                        tone={item.stock === 0 ? "red" : item.stock <= 5 ? "amber" : "green"}
                        label={`${item.stock} unit`}
                      />
                    </td>
                    <td className="px-3.5">
                      <TactileSwitch
                        checked={item.isAvailable}
                        disabled={togglingKey === `giftComponents:${item.id}`}
                        onCheckedChange={(next) =>
                          handleToggle(
                            "giftComponents",
                            item.id,
                            item.name,
                            item.isAvailable,
                            next
                          )
                        }
                        ariaLabel={`Aktifkan komponen ${item.name}`}
                      />
                    </td>
                    <td className="px-3.5">
                      <RowActions
                        name={item.name}
                        onEdit={() => openEditComponent(item)}
                        onDelete={() =>
                          setDeleteTarget({
                            resource: "giftComponents",
                            id: item.id,
                            name: item.name,
                          })
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : cardDesigns.length === 0 ? (
        <EmptyBox
          title="Belum ada desain kartu ucapan."
          description="Tambahkan pilihan kartu ucapan gratis atau premium untuk langkah akhir Custom Gift Builder."
        />
      ) : (
        <div className="no-scrollbar mt-4 overflow-x-auto rounded-[var(--radius-container)] border-[0.5px] border-[var(--line)] shadow-[var(--shadow-table)]">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="hairline-b h-[var(--row-h)] bg-ink-2 text-[length:var(--text-meta)] text-ink-12">
                <th scope="col" className="px-3.5">Desain kartu</th>
                <th scope="col" className="px-3.5">Biaya tambahan</th>
                <th scope="col" className="px-3.5">Status</th>
                <th scope="col" className="px-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-[var(--line)] text-[length:var(--text-body)]">
              {cardDesigns.map((item, idx) => (
                <tr
                  key={item.id}
                  className={`min-h-[var(--row-h)] ${
                    idx % 2 === 0 ? "bg-[var(--raised)]" : "bg-ink-2"
                  }`}
                >
                  <td className="px-3.5 py-2.5">
                    <div className="flex items-center gap-3">
                      <ResilientImage
                        src={item.imageUrl}
                        alt={item.name}
                        className="size-8 shrink-0 rounded-[var(--radius-control)]"
                      />
                      <div className="min-w-0">
                        <p className="max-w-[30ch] truncate text-ink-12">{item.name}</p>
                        {item.description ? (
                          <p className="max-w-[38ch] truncate text-[length:var(--text-meta)] text-ink-10">
                            {item.description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="tabular-nums px-3.5 text-ink-12">
                    {item.price === 0 ? "Gratis" : formatRupiah(item.price)}
                  </td>
                  <td className="px-3.5">
                    <TactileSwitch
                      checked={item.isAvailable}
                      disabled={togglingKey === `cardDesigns:${item.id}`}
                      onCheckedChange={(next) =>
                        handleToggle("cardDesigns", item.id, item.name, item.isAvailable, next)
                      }
                      ariaLabel={`Aktifkan kartu ${item.name}`}
                    />
                  </td>
                  <td className="px-3.5">
                    <RowActions
                      name={item.name}
                      onEdit={() => openEditCard(item)}
                      onDelete={() =>
                        setDeleteTarget({
                          resource: "cardDesigns",
                          id: item.id,
                          name: item.name,
                        })
                      }
                    />
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
        title={modalTitle}
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
              form="custom-item-form"
              disabled={saving || uploading}
              className="touch-target inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--primary-bg)] px-4 text-[length:var(--text-body)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)] disabled:opacity-50"
            >
              {saving ? "Menyimpan…" : "Simpan"}
            </button>
          </>
        }
      >
        <form id="custom-item-form" onSubmit={handleSave} className="space-y-4">
          {formError ? (
            <p
              role="alert"
              className="rounded-[var(--radius-control)] bg-[var(--red-3)] px-3 py-2 text-[length:var(--text-body)] text-[var(--red-11)]"
            >
              {formError}
            </p>
          ) : null}

          <div>
            <label htmlFor="cust-name" className="block text-[length:var(--text-body)] text-ink-12">
              Nama
            </label>
            <input
              id="cust-name"
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={
                formResource === "packagings"
                  ? "Box Eksklusif"
                  : formResource === "giftComponents"
                    ? "Ferrero Rocher 3 pcs"
                    : "Minimalist Warm Wishes"
              }
              className="mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="cust-price"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                {formResource === "cardDesigns" ? "Biaya tambahan (Rp)" : "Harga (Rp)"}
              </label>
              <input
                id="cust-price"
                type="number"
                min={formResource === "giftComponents" ? 1000 : 0}
                step={500}
                required
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="tabular-nums mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12"
              />
            </div>

            {formResource === "giftComponents" ? (
              <div>
                <label
                  htmlFor="cust-stock"
                  className="block text-[length:var(--text-body)] text-ink-12"
                >
                  Stok tersedia
                </label>
                <input
                  id="cust-stock"
                  type="number"
                  min={0}
                  step={1}
                  required
                  value={form.stock}
                  onChange={(e) => updateField("stock", e.target.value)}
                  className="tabular-nums mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12"
                />
              </div>
            ) : null}
          </div>

          {formResource === "giftComponents" ? (
            <div>
              <label
                htmlFor="cust-category"
                className="block text-[length:var(--text-body)] text-ink-12"
              >
                Kategori komponen
              </label>
              <select
                id="cust-category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
                className="mt-1.5 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12"
              >
                {DEFAULT_COMPONENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {formResource === "packagings" ? (
            <>
              {/* Dynamic Colors */}
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[length:var(--text-body)] text-ink-12">
                    Pilihan warna
                  </span>
                  <button
                    type="button"
                    onClick={addColorRow}
                    className="inline-flex h-[var(--control-h-inline)] items-center gap-1 rounded-full bg-[var(--raised)] px-2.5 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-3"
                  >
                    <Plus className="size-3.5" aria-hidden="true" />
                    Tambah warna
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {form.colors.map((col, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={col.hex.startsWith("#") && col.hex.length === 7 ? col.hex : "#F5F0E6"}
                        onChange={(e) => updateColorRow(idx, { hex: e.target.value })}
                        aria-label={`Pilih warna ${idx + 1}`}
                        className="h-[var(--control-h)] w-11 shrink-0 cursor-pointer rounded-[var(--radius-control)] border-0 bg-ink-3 p-1"
                      />
                      <input
                        type="text"
                        value={col.name}
                        onChange={(e) => updateColorRow(idx, { name: e.target.value })}
                        placeholder="Nama warna"
                        aria-label={`Nama warna ${idx + 1}`}
                        className="h-[var(--control-h)] flex-1 rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12"
                      />
                      <input
                        type="text"
                        value={col.hex}
                        onChange={(e) => updateColorRow(idx, { hex: e.target.value })}
                        placeholder="#F5F0E6"
                        aria-label={`Kode hex warna ${idx + 1}`}
                        className="font-mono h-[var(--control-h)] w-24 rounded-[var(--radius-control)] border-0 bg-ink-3 px-2.5 text-[length:var(--text-meta)] text-ink-12"
                      />
                      <button
                        type="button"
                        disabled={form.colors.length <= 1}
                        onClick={() => removeColorRow(idx)}
                        aria-label={`Hapus warna ${col.name}`}
                        className="touch-target inline-flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-ink-3 text-ink-10 hover:text-[var(--red-11)] disabled:opacity-40"
                      >
                        <X className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Designs */}
              <div>
                <label
                  htmlFor="cust-design-input"
                  className="block text-[length:var(--text-body)] text-ink-12"
                >
                  Varian desain
                </label>
                <div className="mt-1.5 flex gap-2">
                  <input
                    id="cust-design-input"
                    type="text"
                    value={form.designInput}
                    onChange={(e) => setForm((p) => ({ ...p, designInput: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addDesignTag();
                      }
                    }}
                    placeholder="Contoh: Floral Foil"
                    className="h-[var(--control-h)] flex-1 rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
                  />
                  <button
                    type="button"
                    onClick={addDesignTag}
                    className="touch-target inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
                  >
                    Tambah
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {form.designs.map((design) => (
                    <span
                      key={design}
                      className="inline-flex items-center gap-1 rounded-full bg-ink-3 px-2.5 py-1 text-[length:var(--text-meta)] text-ink-12"
                    >
                      {design}
                      {form.designs.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeDesignTag(design)}
                          aria-label={`Hapus varian ${design}`}
                          className="text-ink-10 hover:text-[var(--red-11)]"
                        >
                          <X className="size-3.5" aria-hidden="true" />
                        </button>
                      ) : null}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {/* Image Upload & URL */}
          <div>
            <span className="block text-[length:var(--text-body)] text-ink-12">Foto</span>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <ResilientImage
                src={form.imageUrl}
                alt={form.name || "Pratinjau foto"}
                className="size-16 shrink-0 rounded-[var(--radius-control)]"
              />
              <div className="flex-1 space-y-1.5">
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
                  Maksimal 2 MB. Atau masukkan tautan gambar di bawah.
                </p>
              </div>
            </div>
            <input
              type="text"
              value={form.imageUrl}
              onChange={(e) => updateField("imageUrl", e.target.value)}
              placeholder="https://res.cloudinary.com/... atau /images/catalog/card-design.svg"
              aria-label="Tautan gambar"
              className="mt-2 h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
            />
          </div>

          <div>
            <label
              htmlFor="cust-desc"
              className="block text-[length:var(--text-body)] text-ink-12"
            >
              Deskripsi <span className="text-ink-10">(opsional)</span>
            </label>
            <textarea
              id="cust-desc"
              rows={2}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Detail ukuran, bahan, atau catatan singkat…"
              className="mt-1.5 min-h-16 w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] bg-ink-2 p-3">
            <div>
              <p className="text-[length:var(--text-body)] text-ink-12">
                Tersedia di Custom Gift Builder
              </p>
              <p className="text-[length:var(--text-meta)] text-ink-10">
                Item nonaktif tidak akan ditampilkan ke pelanggan.
              </p>
            </div>
            <TactileSwitch
              checked={form.isAvailable}
              onCheckedChange={(v) => updateField("isAvailable", v)}
              ariaLabel="Tersedia di Custom Gift Builder"
            />
          </div>
        </form>
      </ModalSheet>

      {/* Delete Confirmation Modal */}
      <ModalSheet
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus item kustomisasi?"
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
              onClick={handleDeleteConfirm}
              className="touch-target inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--red-9)] px-4 text-[length:var(--text-body)] text-[var(--red-contrast)] disabled:opacity-50"
            >
              {deleting ? "Menghapus…" : "Ya, hapus"}
            </button>
          </>
        }
      >
        <p className="text-[length:var(--text-body)] text-ink-11">
          Item <span className="text-ink-12">{deleteTarget?.name}</span> akan dihapus permanen. Pesanan lama yang pernah memilih item ini tetap aman karena tersimpan sebagai snapshot.
        </p>
      </ModalSheet>
    </div>
  );
}

function RowActions({
  name,
  onEdit,
  onDelete,
}: {
  name: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Ubah ${name}`}
        className="touch-target inline-flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] text-ink-11 shadow-[var(--shadow-button)] hover:bg-ink-3 hover:text-ink-12"
      >
        <Pencil className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={`Hapus ${name}`}
        className="touch-target inline-flex size-8 items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] text-[var(--red-11)] shadow-[var(--shadow-button)] hover:bg-[var(--red-3)]"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}

function EmptyBox({ title, description }: { title: string; description: string }) {
  return (
    <div className="mt-6 rounded-[var(--radius-container)] bg-ink-2 p-11 text-center">
      <p className="text-[length:var(--text-body)] text-ink-12">{title}</p>
      <p className="mt-1 text-[length:var(--text-body)] text-ink-11">{description}</p>
    </div>
  );
}
