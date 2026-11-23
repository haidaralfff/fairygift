"use client";

import { useId } from "react";
import { motion } from "motion/react";

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedToggleProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  className?: string;
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = "",
}: SegmentedToggleProps<T>) {
  const layoutGroupId = useId();

  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const delta = e.key === "ArrowRight" ? 1 : -1;
    const nextIdx = (idx + delta + options.length) % options.length;
    onChange(options[nextIdx]!.value);
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`no-scrollbar inline-flex max-w-full items-center gap-1 overflow-x-auto overflow-y-hidden rounded-full bg-ink-3 p-1 ${className}`}
    >
      {options.map((opt, idx) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative inline-flex h-[var(--control-h-pill)] shrink-0 items-center gap-1.5 rounded-full px-3 text-[length:var(--text-meta)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] ${
              active ? "text-ink-12" : "text-ink-11 hover:text-ink-12"
            }`}
          >
            {active ? (
              <motion.span
                layoutId={`seg-${layoutGroupId}`}
                transition={{ type: "spring", bounce: 0.12, duration: 0.4 }}
                className="absolute inset-0 rounded-full bg-[var(--raised)] shadow-[var(--shadow-toggle)]"
                aria-hidden="true"
              />
            ) : null}
            <span className="relative z-10">{opt.label}</span>
            {typeof opt.count === "number" ? (
              <span className="tabular-nums relative z-10 text-ink-10">{opt.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
