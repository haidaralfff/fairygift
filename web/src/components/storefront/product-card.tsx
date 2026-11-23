import Link from "next/link";
import NorthEastRoundedIcon from "@mui/icons-material/NorthEastRounded";
import { PillBadge } from "@/components/ui/pill-badge";
import { ResilientImage } from "@/components/ui/resilient-image";
import { StatusDot } from "@/components/ui/status-dot";
import { formatRupiah } from "@/lib/format";
import type { Product } from "@/types/domain";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <Link
      href={`/produk/${product.slug}`}
      className={`surface-raised group flex flex-col overflow-hidden rounded-[var(--radius-feature)] bg-[var(--raised)] p-2.5 shadow-[var(--shadow-card)] transition-[transform,box-shadow,background-color] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[0_14px_28px_-16px_rgb(var(--shadow-ink)/0.22),0_0_0_1px_var(--fg-rose-border)] active:scale-[0.99] motion-reduce:hover:translate-y-0 ${
        product.isAvailable ? "" : "opacity-65"
      }`}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-container)] border-[0.5px] border-ink-5 bg-ink-2">
        <ResilientImage
          src={product.imageUrl}
          alt={product.name}
          priority={priority}
          className="size-full transition-transform duration-300 ease-[var(--ease-out)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />

        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2">
          <PillBadge tone={product.isFeatured ? "plum" : "neutral"}>
            {product.categoryName}
          </PillBadge>
          <span className="inline-flex h-[var(--badge-h)] items-center rounded-full bg-[color-mix(in_oklab,var(--panel)_92%,transparent)] px-2 shadow-[var(--shadow-button)] backdrop-blur-sm">
            <StatusDot
              tone={product.isAvailable ? "green" : "neutral"}
              label={product.isAvailable ? "Tersedia" : "Habis"}
              muted={!product.isAvailable}
            />
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-3 px-2 pt-3.5 pb-1.5">
        <div>
          <h3 className="line-clamp-2 text-[length:var(--text-title)] font-semibold leading-[var(--leading-title)] text-ink-12 transition-colors group-hover:text-[var(--fg-rose-text)]">
            {product.name}
          </h3>

          <p className="mt-1.5 line-clamp-2 text-[length:var(--text-body)] font-normal leading-[var(--leading-body)] text-ink-11">
            {product.description}
          </p>
        </div>

        <div className="hairline-t flex items-center justify-between gap-2 pt-2.5">
          <div>
            <p className="text-[11px] font-medium leading-none text-ink-10">Mulai dari</p>
            <p className="tabular-nums mt-1 text-[length:var(--text-title)] font-semibold leading-none text-ink-12">
              {formatRupiah(product.price)}
            </p>
          </div>

          <span className="inline-flex h-[var(--control-h-pill)] items-center gap-1 rounded-full bg-[var(--fg-rose-soft)] px-2.5 text-[length:var(--text-meta)] text-[var(--fg-rose-text)] transition-colors group-hover:bg-[var(--fg-rose)] group-hover:text-[var(--fg-rose-fg)]">
            <span>Detail</span>
            <NorthEastRoundedIcon style={{ fontSize: 14 }} aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}

