"use client";

import { motion } from "motion/react";

interface TactileSwitchProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel: string;
  disabled?: boolean;
}

export function TactileSwitch({
  checked,
  onCheckedChange,
  ariaLabel,
  disabled = false,
}: TactileSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={`touch-target relative inline-flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-1 transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] md:h-[26px] md:w-[52px] md:p-[3px] ${
        checked ? "justify-end bg-[var(--green-9)]" : "justify-start bg-ink-7"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <motion.span
        layout
        transition={{ type: "spring", bounce: 0.2, duration: 0.45 }}
        className="size-[23px] rounded-full bg-white shadow-[var(--shadow-toggle)] md:size-5"
        aria-hidden="true"
      />
    </button>
  );
}
