"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  onChange: (next: number) => void;
  size?: "compact" | "pill";
}

export function QuantityStepper({
  value,
  min = 1,
  max = 50,
  disabled = false,
  onChange,
  size = "compact",
}: QuantityStepperProps) {
  const canDecrease = !disabled && value > min;
  const canIncrease = !disabled && value < max;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-[var(--radius-control)] bg-[var(--raised)] px-1.5 shadow-[var(--shadow-button)] ${
        size === "pill" ? "h-[var(--control-h-pill)]" : "h-[var(--control-h)]"
      }`}
    >
      <button
        type="button"
        onClick={() => canDecrease && onChange(value - 1)}
        disabled={!canDecrease}
        aria-label="Kurangi jumlah"
        className="touch-target inline-flex size-[var(--control-h-icon)] items-center justify-center rounded-[var(--radius-sm)] text-ink-11 transition-colors duration-[var(--dur-hover)] hover:bg-ink-3 hover:text-ink-12 active:scale-[0.92] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3.5" strokeWidth={2.3} aria-hidden="true" />
      </button>

      <span className="tabular-nums min-w-7 text-center text-[length:var(--text-body)] text-ink-12">
        {value}
      </span>

      <button
        type="button"
        onClick={() => canIncrease && onChange(value + 1)}
        disabled={!canIncrease}
        aria-label="Tambah jumlah"
        className="touch-target inline-flex size-[var(--control-h-icon)] items-center justify-center rounded-[var(--radius-sm)] text-ink-11 transition-colors duration-[var(--dur-hover)] hover:bg-ink-3 hover:text-ink-12 active:scale-[0.92] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3.5" strokeWidth={2.3} aria-hidden="true" />
      </button>
    </div>
  );
}
