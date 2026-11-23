"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, RotateCcw, Search, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { PillBadge } from "@/components/ui/pill-badge";
import { ResilientImage } from "@/components/ui/resilient-image";
import { useToast } from "@/components/ui/toast";
import { COMPONENT_CATEGORIES, CUSTOM_GIFT_CARD_MAX_CHARS } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type {
  CardDesign,
  CustomGiftSelection,
  GiftComponent,
  Packaging,
  PackagingColor,
} from "@/types/domain";

const DRAFT_STORAGE_KEY = "fairygift-builder-draft-v1";

interface BuilderDraft {
  step: 1 | 2 | 3;
  packagingId: string | null;
  selectedColor: PackagingColor | null;
  selectedDesign: string | null;
  selectedComponentIds: string[];
  cardDesignId: string | null;
  greetingMessage: string;
}

interface CustomGiftBuilderProps {
  packagings: Packaging[];
  components: GiftComponent[];
  cardDesigns: CardDesign[];
}

export function CustomGiftBuilder({
  packagings,
  components,
  cardDesigns,
}: CustomGiftBuilderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editCartItemId = searchParams.get("edit");
  const { items: cartItems, addCustomGift } = useCart();
  const { showToast } = useToast();

  const defaultPackaging = packagings[0] ?? null;
  const defaultCard = cardDesigns[0] ?? null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [packagingId, setPackagingId] = useState<string | null>(
    defaultPackaging?.id ?? null
  );
  const [selectedColor, setSelectedColor] = useState<PackagingColor | null>(
    defaultPackaging?.colors[0] ?? null
  );
  const [selectedDesign, setSelectedDesign] = useState<string | null>(
    defaultPackaging?.designs[0] ?? null
  );
  const [selectedComponentIds, setSelectedComponentIds] = useState<string[]>([]);
  const [cardDesignId, setCardDesignId] = useState<string | null>(
    defaultCard?.id ?? null
  );
  const [greetingMessage, setGreetingMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const [componentCategory, setComponentCategory] = useState<string>("Semua");
  const [componentQuery, setComponentQuery] = useState("");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [summarySheetOpen, setSummarySheetOpen] = useState(false);

  // Hydrate from cart item (if ?edit=) or localStorage draft
  useEffect(() => {
    if (editCartItemId) {
      const target = cartItems.find(
        (i) => i.cartItemId === editCartItemId && i.type === "custom_gift"
      );
      if (target && target.type === "custom_gift") {
        const c = target.customization;
        setPackagingId(c.packagingId);
        setSelectedColor(c.selectedColor);
        setSelectedDesign(c.selectedDesign);
        setSelectedComponentIds(c.components.map((comp) => comp.componentId));
        setCardDesignId(c.cardDesignId);
        setGreetingMessage(c.greetingMessage);
        setStep(1);
        setHydrated(true);
        return;
      }
    }

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<BuilderDraft>;
        if (draft.packagingId && packagings.some((p) => p.id === draft.packagingId)) {
          setPackagingId(draft.packagingId);
        }
        if (draft.selectedColor) setSelectedColor(draft.selectedColor);
        if (draft.selectedDesign) setSelectedDesign(draft.selectedDesign);
        if (Array.isArray(draft.selectedComponentIds)) {
          const validIds = draft.selectedComponentIds.filter((id) =>
            components.some((c) => c.id === id)
          );
          setSelectedComponentIds(validIds);
        }
        if (draft.cardDesignId && cardDesigns.some((d) => d.id === draft.cardDesignId)) {
          setCardDesignId(draft.cardDesignId);
        }
        if (typeof draft.greetingMessage === "string") {
          setGreetingMessage(draft.greetingMessage.slice(0, CUSTOM_GIFT_CARD_MAX_CHARS));
        }
        if (draft.step === 1 || draft.step === 2 || draft.step === 3) {
          setStep(draft.step);
        }
      }
    } catch {
      // Ignore draft parse error
    } finally {
      setHydrated(true);
    }
  }, [editCartItemId, cartItems, packagings, components, cardDesigns]);

  // Persist draft automatically
  useEffect(() => {
    if (!hydrated || editCartItemId) return;
    const draft: BuilderDraft = {
      step,
      packagingId,
      selectedColor,
      selectedDesign,
      selectedComponentIds,
      cardDesignId,
      greetingMessage,
    };
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
    } catch {
      // Ignore storage error
    }
  }, [
    hydrated,
    editCartItemId,
    step,
    packagingId,
    selectedColor,
    selectedDesign,
    selectedComponentIds,
    cardDesignId,
    greetingMessage,
  ]);

  const activePackaging = useMemo(
    () => packagings.find((p) => p.id === packagingId) ?? null,
    [packagings, packagingId]
  );

  const selectedComponents = useMemo(
    () => components.filter((c) => selectedComponentIds.includes(c.id)),
    [components, selectedComponentIds]
  );

  const activeCardDesign = useMemo(
    () => cardDesigns.find((d) => d.id === cardDesignId) ?? null,
    [cardDesigns, cardDesignId]
  );

  const filteredComponents = useMemo(() => {
    const q = componentQuery.trim().toLowerCase();
    return components.filter((c) => {
      if (componentCategory !== "Semua" && c.category !== componentCategory) {
        return false;
      }
      if (q && !c.name.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [components, componentCategory, componentQuery]);

  const totalPrice = useMemo(() => {
    const packPrice = activePackaging?.price ?? 0;
    const compsPrice = selectedComponents.reduce((sum, c) => sum + c.price, 0);
    const cardPrice = activeCardDesign?.price ?? 0;
    return packPrice + compsPrice + cardPrice;
  }, [activePackaging, selectedComponents, activeCardDesign]);

  const step1Valid = Boolean(activePackaging && selectedColor && selectedDesign);
  const step2Valid = selectedComponents.length >= 1;
  const step3Valid = Boolean(activeCardDesign);
  const canAddToCart = step1Valid && step2Valid && step3Valid;

  function selectPackaging(pack: Packaging) {
    setPackagingId(pack.id);
    setSelectedColor(pack.colors[0] ?? null);
    setSelectedDesign(pack.designs[0] ?? null);
  }

  function toggleComponent(componentId: string) {
    setSelectedComponentIds((prev) =>
      prev.includes(componentId)
        ? prev.filter((id) => id !== componentId)
        : [...prev, componentId]
    );
  }

  function handleReset() {
    setStep(1);
    setPackagingId(defaultPackaging?.id ?? null);
    setSelectedColor(defaultPackaging?.colors[0] ?? null);
    setSelectedDesign(defaultPackaging?.designs[0] ?? null);
    setSelectedComponentIds([]);
    setCardDesignId(defaultCard?.id ?? null);
    setGreetingMessage("");
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    setResetModalOpen(false);
    showToast("Pilihan custom gift dikembalikan ke awal.", "neutral");
  }

  function handlePrimaryAction() {
    if (step === 1) {
      if (step1Valid) setStep(2);
      return;
    }
    if (step === 2) {
      if (step2Valid) setStep(3);
      return;
    }
    if (!canAddToCart || !activePackaging || !selectedColor || !selectedDesign || !activeCardDesign) {
      return;
    }

    const selection: CustomGiftSelection = {
      packagingId: activePackaging.id,
      packagingName: activePackaging.name,
      packagingPrice: activePackaging.price,
      selectedColor,
      selectedDesign,
      components: selectedComponents.map((c) => ({
        componentId: c.id,
        name: c.name,
        price: c.price,
        quantity: 1,
      })),
      cardDesignId: activeCardDesign.id,
      cardDesignName: activeCardDesign.name,
      cardDesignPrice: activeCardDesign.price,
      greetingMessage: greetingMessage.trim(),
    };

    addCustomGift(selection, totalPrice, 1, editCartItemId);
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
      // Ignore
    }
    showToast(
      editCartItemId
        ? "Perubahan custom gift disimpan ke keranjang."
        : "Custom gift ditambahkan ke keranjang.",
      "green"
    );
    router.push("/keranjang");
  }

  const disabledReason =
    step === 1 && !step1Valid
      ? "Pilih 1 kemasan, warna, dan desain kemasan untuk melanjutkan."
      : step === 2 && !step2Valid
        ? "Pilih minimal 1 isi hadiah untuk melanjutkan."
        : step === 3 && !canAddToCart
          ? "Lengkapi kemasan, minimal 1 isi hadiah, dan desain kartu."
          : null;

  const isPrimaryDisabled =
    (step === 1 && !step1Valid) ||
    (step === 2 && !step2Valid) ||
    (step === 3 && !canAddToCart);

  const primaryLabel =
    step < 3
      ? "Lanjut ke tahap berikutnya"
      : editCartItemId
        ? "Simpan perubahan ke keranjang"
        : "Tambah ke keranjang";

  const summaryRows = (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3 text-[length:var(--text-body)]">
        <div className="min-w-0">
          <p className="text-ink-12">
            {activePackaging ? activePackaging.name : "Belum memilih kemasan"}
          </p>
          {selectedColor || selectedDesign ? (
            <p className="text-[length:var(--text-meta)] text-ink-11">
              {[selectedColor?.name, selectedDesign].filter(Boolean).join(" · ")}
            </p>
          ) : null}
        </div>
        <span className="tabular-nums shrink-0 text-ink-12">
          {activePackaging ? formatRupiah(activePackaging.price) : "Rp0"}
        </span>
      </div>

      <div className="hairline-t pt-3">
        <p className="text-[length:var(--text-meta)] text-ink-11">
          Isi hadiah ({selectedComponents.length})
        </p>
        {selectedComponents.length === 0 ? (
          <p className="mt-1 text-[length:var(--text-meta)] text-ink-10">
            Belum ada isi hadiah yang dipilih.
          </p>
        ) : (
          <ul className="mt-1.5 space-y-1.5">
            {selectedComponents.map((comp) => (
              <li
                key={comp.id}
                className="flex items-center justify-between gap-3 text-[length:var(--text-body)]"
              >
                <span className="truncate text-ink-12">{comp.name}</span>
                <span className="tabular-nums shrink-0 text-ink-11">
                  {formatRupiah(comp.price)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="hairline-t flex items-start justify-between gap-3 pt-3 text-[length:var(--text-body)]">
        <div className="min-w-0">
          <p className="text-ink-12">
            {activeCardDesign ? activeCardDesign.name : "Kartu ucapan"}
          </p>
          {greetingMessage.trim() ? (
            <p className="mt-0.5 line-clamp-2 break-words text-[length:var(--text-meta)] text-ink-11">
              &ldquo;{greetingMessage.trim()}&rdquo;
            </p>
          ) : null}
        </div>
        <span className="tabular-nums shrink-0 text-ink-12">
          {activeCardDesign
            ? activeCardDesign.price === 0
              ? "Termasuk"
              : formatRupiah(activeCardDesign.price)
            : "Rp0"}
        </span>
      </div>
    </div>
  );

  const stepsMeta = [
    { num: 1 as const, title: "Kemasan", done: step > 1 && step1Valid },
    { num: 2 as const, title: "Isi hadiah", done: step > 2 && step2Valid },
    { num: 3 as const, title: "Kartu ucapan", done: false },
  ];

  return (
    <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-[calc(168px+env(safe-area-inset-bottom))] md:px-6 md:py-8">
      {/* Header + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12">
              Rangkai kado custom
            </h1>
            <PillBadge tone="plum">Dirangkai Khusus</PillBadge>
          </div>
          <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
            Sesuaikan kemasan, isi hadiah, dan kartu ucapan dengan estimasi harga langsung.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setResetModalOpen(true)}
          className="inline-flex h-[var(--control-h-compact)] items-center gap-1.5 rounded-[var(--radius-control)] px-2.5 text-[length:var(--text-meta)] text-ink-10 transition-colors hover:bg-ink-2 hover:text-ink-12"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          <span>Reset pilihan</span>
        </button>
      </div>

      {/* Step Markers */}
      <nav aria-label="Tahapan custom gift" className="mt-6">
        <ol className="flex items-center gap-2 sm:gap-4">
          {stepsMeta.map((s, idx) => {
            const isCurrent = step === s.num;
            const canClick =
              s.num === 1 || (s.num === 2 && step1Valid) || (s.num === 3 && step1Valid && step2Valid);

            return (
              <li key={s.num} className="flex flex-1 items-center gap-2 sm:flex-none">
                <button
                  type="button"
                  disabled={!canClick}
                  onClick={() => canClick && setStep(s.num)}
                  className={`inline-flex items-center gap-2.5 rounded-[var(--radius-control)] py-1 pr-2 text-left transition-colors ${
                    canClick ? "cursor-pointer" : "cursor-not-allowed opacity-55"
                  }`}
                >
                  <span
                    className={`tabular-nums inline-flex size-8 shrink-0 items-center justify-center rounded-full text-[length:var(--text-meta)] transition-colors ${
                      s.done
                        ? "bg-[var(--green-9)] text-[var(--green-contrast)]"
                        : isCurrent
                          ? "bg-[var(--fg-rose)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)]"
                          : "bg-[var(--raised)] text-ink-12 shadow-[var(--shadow-button)]"
                    }`}
                  >
                    {s.done ? <Check className="size-4" strokeWidth={2.5} /> : s.num}
                  </span>
                  <span
                    className={`text-[length:var(--text-body)] ${
                      isCurrent ? "text-ink-12" : "text-ink-11"
                    }`}
                  >
                    {s.title}
                  </span>
                </button>
                {idx < stepsMeta.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className="hidden h-[0.5px] w-10 bg-ink-6 sm:block"
                  />
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Main Split Area */}
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Builder Workspace */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.section
                key="step-1"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                aria-labelledby="step-1-heading"
                className="space-y-6"
              >
                <div>
                  <h2
                    id="step-1-heading"
                    className="text-[length:var(--text-title)] leading-[var(--leading-title)] text-ink-12"
                  >
                    Tahap 1. Pilih kemasan
                  </h2>
                  <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
                    Tentukan jenis wadah hadiah yang paling sesuai.
                  </p>

                  <div
                    role="radiogroup"
                    aria-label="Jenis kemasan"
                    className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3"
                  >
                    {packagings.map((pack) => {
                      const selected = pack.id === packagingId;
                      return (
                        <button
                          key={pack.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => selectPackaging(pack)}
                          className={`relative flex min-h-[124px] flex-col justify-between rounded-[var(--radius-feature)] p-3.5 text-left transition-colors duration-[var(--dur-hover)] ${
                            selected
                              ? "border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] shadow-[0_0_0_1px_var(--fg-rose-border)]"
                              : "bg-[var(--raised)] shadow-[var(--shadow-card)] hover:bg-ink-2"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <ResilientImage
                              src={pack.imageUrl}
                              alt={pack.name}
                              className="size-12 rounded-[var(--radius-control)] border-[0.5px] border-ink-6"
                            />
                            <span
                              aria-hidden="true"
                              className={`inline-flex size-[18px] items-center justify-center rounded-full border-[1.5px] ${
                                selected ? "border-[var(--fg-rose)]" : "border-ink-6"
                              }`}
                            >
                              {selected ? (
                                <span className="size-2 rounded-full bg-[var(--fg-rose)]" />
                              ) : null}
                            </span>
                          </div>

                          <div className="mt-3">
                            <p className="text-[length:var(--text-body)] text-ink-12">
                              {pack.name}
                            </p>
                            <p className="tabular-nums mt-0.5 text-[length:var(--text-meta)] text-ink-11">
                              {formatRupiah(pack.price)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activePackaging ? (
                  <>
                    <div>
                      <h3 className="text-[length:var(--text-body)] text-ink-12">
                        Warna kemasan
                      </h3>
                      <div
                        role="radiogroup"
                        aria-label="Warna kemasan"
                        className="mt-2.5 flex flex-wrap gap-2"
                      >
                        {activePackaging.colors.map((color) => {
                          const active = selectedColor?.name === color.name;
                          return (
                            <button
                              key={color.name}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setSelectedColor(color)}
                              className={`inline-flex h-[var(--control-h)] items-center gap-2 rounded-full px-3.5 text-[length:var(--text-body)] transition-colors ${
                                active
                                  ? "border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)]"
                                  : "bg-[var(--raised)] text-ink-11 shadow-[var(--shadow-button)] hover:text-ink-12"
                              }`}
                            >
                              <span
                                aria-hidden="true"
                                className="size-3.5 shrink-0 rounded-full border-[0.5px] border-[var(--ink-a4)]"
                                style={{ backgroundColor: color.hex }}
                              />
                              <span>{color.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[length:var(--text-body)] text-ink-12">
                        Varian desain kemasan
                      </h3>
                      <div
                        role="radiogroup"
                        aria-label="Desain kemasan"
                        className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                      >
                        {activePackaging.designs.map((design) => {
                          const active = selectedDesign === design;
                          return (
                            <button
                              key={design}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              onClick={() => setSelectedDesign(design)}
                              className={`flex h-[var(--control-h)] items-center justify-between rounded-[var(--radius-container)] px-3.5 text-[length:var(--text-body)] transition-colors ${
                                active
                                  ? "border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] text-[var(--fg-rose-text)]"
                                  : "bg-[var(--raised)] text-ink-11 shadow-[var(--shadow-button)] hover:text-ink-12"
                              }`}
                            >
                              <span>{design}</span>
                              {active ? (
                                <Check className="size-4 text-[var(--fg-rose)]" aria-hidden="true" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : null}
              </motion.section>
            ) : null}

            {step === 2 ? (
              <motion.section
                key="step-2"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                aria-labelledby="step-2-heading"
                className="space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h2
                      id="step-2-heading"
                      className="text-[length:var(--text-title)] leading-[var(--leading-title)] text-ink-12"
                    >
                      Tahap 2. Pilih isi hadiah
                    </h2>
                    <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
                      Pilih satu atau beberapa item hadiah yang tersedia.
                    </p>
                  </div>
                  <PillBadge tone="plum" size="md">
                    <span className="tabular-nums">{selectedComponents.length} dipilih</span>
                  </PillBadge>
                </div>

                {/* Filter kategori & pencarian */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="no-scrollbar edge-fade-x flex items-center gap-1.5 overflow-x-auto py-1 pr-6">
                    {COMPONENT_CATEGORIES.map((cat) => {
                      const active = componentCategory === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setComponentCategory(cat)}
                          className={`inline-flex h-[var(--control-h-pill)] shrink-0 items-center rounded-full px-3 text-[length:var(--text-meta)] transition-colors ${
                            active
                              ? "bg-[var(--fg-rose)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)]"
                              : "bg-[var(--raised)] text-ink-11 shadow-[var(--shadow-toggle)] hover:text-ink-12"
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>

                  {components.length > 8 ? (
                    <div className="relative sm:w-56">
                      <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-10"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        value={componentQuery}
                        onChange={(e) => setComponentQuery(e.target.value)}
                        placeholder="Cari isi hadiah…"
                        aria-label="Cari isi hadiah"
                        className="h-[var(--control-h)] w-full rounded-full border-0 bg-ink-3 pr-3 pl-8 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none"
                      />
                    </div>
                  ) : null}
                </div>

                {filteredComponents.length === 0 ? (
                  <div className="rounded-[var(--radius-container)] bg-ink-2 p-8 text-center">
                    <p className="text-[length:var(--text-body)] text-ink-12">
                      Komponen tidak ditemukan.
                    </p>
                    <p className="mt-1 text-[length:var(--text-meta)] text-ink-11">
                      Coba kata kunci lain atau pilih kategori Semua.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {filteredComponents.map((comp) => {
                      const checked = selectedComponentIds.includes(comp.id);
                      return (
                        <button
                          key={comp.id}
                          type="button"
                          role="checkbox"
                          aria-checked={checked}
                          onClick={() => toggleComponent(comp.id)}
                          className={`flex items-center justify-between gap-3 rounded-[var(--radius-feature)] p-3 text-left transition-colors ${
                            checked
                              ? "border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] shadow-[0_0_0_1px_var(--fg-rose-border)]"
                              : "bg-[var(--raised)] shadow-[var(--shadow-card)] hover:bg-ink-2"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <ResilientImage
                              src={comp.imageUrl}
                              alt={comp.name}
                              className="size-10 shrink-0 rounded-[var(--radius-control)] border-[0.5px] border-ink-6"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[length:var(--text-body)] text-ink-12">
                                {comp.name}
                              </p>
                              <p className="tabular-nums text-[length:var(--text-meta)] text-ink-11">
                                +{formatRupiah(comp.price)}
                              </p>
                            </div>
                          </div>

                          <span
                            aria-hidden="true"
                            className={`inline-flex size-[18px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] transition-colors ${
                              checked
                                ? "bg-[var(--fg-rose)] text-[var(--fg-rose-fg)]"
                                : "border-[1.5px] border-ink-6 bg-transparent"
                            }`}
                          >
                            {checked ? <Check className="size-3" strokeWidth={2.8} /> : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex h-[var(--control-h-compact)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
                  >
                    Kembali ke tahap kemasan
                  </button>
                </div>
              </motion.section>
            ) : null}

            {step === 3 ? (
              <motion.section
                key="step-3"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                aria-labelledby="step-3-heading"
                className="space-y-6"
              >
                <div>
                  <h2
                    id="step-3-heading"
                    className="text-[length:var(--text-title)] leading-[var(--leading-title)] text-ink-12"
                  >
                    Tahap 3. Kartu ucapan
                  </h2>
                  <p className="mt-1 text-[length:var(--text-body)] text-ink-11">
                    Pilih desain kartu ucapan dan tulis pesan personal untuk penerima.
                  </p>

                  <div
                    role="radiogroup"
                    aria-label="Desain kartu ucapan"
                    className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
                  >
                    {cardDesigns.map((card) => {
                      const selected = card.id === cardDesignId;
                      return (
                        <button
                          key={card.id}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => setCardDesignId(card.id)}
                          className={`flex min-h-[92px] items-center justify-between gap-3 rounded-[var(--radius-feature)] p-3.5 text-left transition-colors ${
                            selected
                              ? "border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] shadow-[0_0_0_1px_var(--fg-rose-border)]"
                              : "bg-[var(--raised)] shadow-[var(--shadow-card)] hover:bg-ink-2"
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <ResilientImage
                              src={card.imageUrl}
                              alt={card.name}
                              className="size-12 shrink-0 rounded-[var(--radius-control)] border-[0.5px] border-ink-6"
                            />
                            <div className="min-w-0">
                              <p className="truncate text-[length:var(--text-body)] text-ink-12">
                                {card.name}
                              </p>
                              <p className="tabular-nums text-[length:var(--text-meta)] text-ink-11">
                                {card.price === 0 ? "Termasuk" : `+${formatRupiah(card.price)}`}
                              </p>
                            </div>
                          </div>

                          <span
                            aria-hidden="true"
                            className={`inline-flex size-[18px] shrink-0 items-center justify-center rounded-full border-[1.5px] ${
                              selected ? "border-[var(--fg-rose)]" : "border-ink-6"
                            }`}
                          >
                            {selected ? (
                              <span className="size-2 rounded-full bg-[var(--fg-rose)]" />
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor="greeting-message"
                      className="text-[length:var(--text-body)] text-ink-12"
                    >
                      Pesan kartu ucapan{" "}
                      <span className="text-ink-10">(opsional)</span>
                    </label>
                    <span className="tabular-nums text-[length:var(--text-meta)] text-ink-10">
                      {greetingMessage.length}/{CUSTOM_GIFT_CARD_MAX_CHARS}
                    </span>
                  </div>

                  <textarea
                    id="greeting-message"
                    rows={4}
                    maxLength={CUSTOM_GIFT_CARD_MAX_CHARS}
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    placeholder="Contoh: Selamat wisuda! Semoga langkah berikutnya selalu penuh kebahagiaan."
                    className="mt-2 min-h-24 w-full rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 py-2.5 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none [overflow-wrap:break-word]"
                  />
                </div>

                {/* Preview Ringkasan Kartu */}
                <div className="surface-raised rounded-[var(--radius-feature)] border-[0.5px] border-[var(--fg-rose-border)] bg-[var(--fg-rose-soft)] p-4 shadow-[var(--shadow-card)]">
                  <p className="text-[length:var(--text-meta)] text-[var(--fg-rose-text)]">
                    Pratinjau kartu ({activeCardDesign?.name ?? "Kartu Ucapan"})
                  </p>
                  <p className="mt-2 break-words text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-12">
                    {greetingMessage.trim()
                      ? greetingMessage.trim()
                      : "Belum ada pesan tertulis. Kartu akan disertakan kosong bila dibiarkan."}
                  </p>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex h-[var(--control-h-compact)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-button)] hover:bg-ink-2"
                  >
                    Kembali ke isi hadiah
                  </button>
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Desktop Sticky Summary Card */}
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="surface-raised sticky top-20 rounded-[var(--radius-feature)] border-[0.5px] border-[var(--line)] bg-[var(--raised)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-[length:var(--text-title)] leading-[var(--leading-title)] text-ink-12">
              Ringkasan custom gift
            </h2>

            <div className="mt-4">{summaryRows}</div>

            <div className="hairline-t mt-4 flex items-baseline justify-between pt-4">
              <span className="text-[length:var(--text-body)] text-ink-11">
                Total harga
              </span>
              <span
                aria-live="polite"
                className="tabular-nums text-[length:var(--text-figure)] leading-[var(--leading-figure)] text-[var(--fg-rose-text)]"
              >
                {formatRupiah(totalPrice)}
              </span>
            </div>

            <button
              type="button"
              disabled={isPrimaryDisabled}
              onClick={handlePrimaryAction}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-[var(--fg-rose-hover)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
            >
              {step === 3 ? <ShoppingBag className="size-4" aria-hidden="true" /> : null}
              <span>{primaryLabel}</span>
            </button>

            {disabledReason ? (
              <p className="mt-2 text-[length:var(--text-meta)] text-ink-11">
                {disabledReason}
              </p>
            ) : null}
          </div>
        </aside>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="surface-panel hairline-t fixed inset-x-0 bottom-0 z-[var(--z-portal)] bg-[var(--panel)] px-5 pt-3 pb-[max(20px,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto max-w-[640px]">
          <div className="mb-2.5 flex items-center justify-between gap-2">
            <div>
              <p className="text-[length:var(--text-meta)] text-ink-11">Total harga</p>
              <p
                aria-live="polite"
                className="tabular-nums text-[length:var(--text-section)] leading-[var(--leading-section)] text-[var(--fg-rose-text)]"
              >
                {formatRupiah(totalPrice)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSummarySheetOpen(true)}
              className="touch-target inline-flex h-[var(--control-h-pill)] items-center rounded-full bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-toggle)]"
            >
              Rincian ({selectedComponents.length} item)
            </button>
          </div>

          <button
            type="button"
            disabled={isPrimaryDisabled}
            onClick={handlePrimaryAction}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-container)] bg-[var(--fg-rose)] px-4 text-[length:var(--text-body)] text-[var(--fg-rose-fg)] shadow-[var(--fg-cta-glow)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            <span>{primaryLabel}</span>
          </button>

          {disabledReason ? (
            <p className="mt-1.5 text-[length:var(--text-meta)] text-ink-11">
              {disabledReason}
            </p>
          ) : null}
        </div>
      </div>

      {/* Mobile Summary Bottom Sheet */}
      <ModalSheet
        open={summarySheetOpen}
        onClose={() => setSummarySheetOpen(false)}
        title="Rincian custom gift"
        size="form"
        footer={
          <button
            type="button"
            onClick={() => setSummarySheetOpen(false)}
            className="inline-flex h-[var(--control-h)] w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
          >
            Tutup
          </button>
        }
      >
        {summaryRows}
      </ModalSheet>

      {/* Reset Confirmation Modal */}
      <ModalSheet
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset semua pilihan?"
        size="confirm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setResetModalOpen(false)}
              className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--raised)] px-4 text-[length:var(--text-body)] text-ink-12 shadow-[var(--shadow-button)]"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-[var(--control-h)] items-center rounded-[var(--radius-control)] bg-[var(--red-9)] px-4 text-[length:var(--text-body)] text-[var(--red-contrast)]"
            >
              Ya, reset pilihan
            </button>
          </>
        }
      >
        <p className="text-[length:var(--text-body)] text-ink-11">
          Kemasan, isi hadiah, dan teks kartu ucapan yang sedang Anda susun akan dikembalikan ke awal.
        </p>
      </ModalSheet>
    </div>
  );
}
