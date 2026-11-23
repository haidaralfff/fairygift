"use client";

import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

interface CopyPillProps {
  text: string;
  label: string;
  copiedLabel?: string;
  ariaLabel?: string;
}

export function CopyPill({
  text,
  label,
  copiedLabel = "Disalin",
  ariaLabel,
}: CopyPillProps) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timerRef = useRef<number | null>(null);

  async function handleCopy() {
    setFailed(false);
    setCopied(true);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 1500);

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      setCopied(false);
      setFailed(true);
      timerRef.current = window.setTimeout(() => setFailed(false), 1500);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={ariaLabel || label}
      className="touch-target inline-flex h-[var(--control-h-pill)] items-center gap-1.5 rounded-full bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-12 shadow-[var(--shadow-toggle)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-ink-3 active:scale-[0.97]"
    >
      {copied ? (
        <Check
          className="size-3.5 text-[var(--green-11)] transition-transform duration-200 scale-110"
          strokeWidth={2.5}
          aria-hidden="true"
        />
      ) : (
        <Copy className="size-3.5 text-ink-10" strokeWidth={2.2} aria-hidden="true" />
      )}
      <span>{failed ? "Gagal menyalin" : copied ? copiedLabel : label}</span>
    </button>
  );
}
