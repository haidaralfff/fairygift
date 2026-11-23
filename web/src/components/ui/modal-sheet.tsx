"use client";

import { useEffect, useId, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

interface ModalSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: "confirm" | "form" | "side";
  dirty?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function ModalSheet({
  open,
  onClose,
  title,
  size = "form",
  dirty = false,
  footer,
  children,
}: ModalSheetProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      const focusable = containerRef.current?.querySelector<HTMLElement>(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }, 30);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  const widthClass =
    size === "confirm"
      ? "md:max-w-[460px]"
      : size === "side"
        ? "md:max-w-[440px]"
        : "md:max-w-[620px]";

  const isSide = size === "side";

  return (
    <AnimatePresence>
      {open ? (
        <div
          className={`fixed inset-0 z-[var(--z-modal)] flex items-end justify-center ${
            isSide ? "md:items-stretch md:justify-end" : "md:items-center md:p-4"
          }`}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              if (!dirty) onClose();
            }}
            aria-hidden="true"
            className={`fixed inset-0 ${
              isSide
                ? "bg-[var(--backdrop)] md:bg-transparent"
                : "bg-[var(--backdrop)] backdrop-blur-[2px]"
            }`}
          />

          {/* Dialog / Sheet */}
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={isSide ? { x: "100%" } : { opacity: 0, y: 24 }}
            animate={isSide ? { x: 0 } : { opacity: 1, y: 0 }}
            exit={isSide ? { x: "100%" } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            className={`surface-overlay relative z-10 flex max-h-[90dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius-sheet)] bg-[var(--overlay)] shadow-[var(--shadow-modal)] ${widthClass} ${
              isSide
                ? "md:h-full md:max-h-dvh md:rounded-none md:rounded-l-[var(--radius-container)]"
                : "md:rounded-[var(--radius-container)]"
            }`}
          >
            {/* Mobile Grab Handle */}
            <div className="flex justify-center pt-2 md:hidden">
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="flex h-11 w-[88px] items-center justify-center"
              >
                <span className="h-[5px] w-9 rounded-full bg-ink-6" />
              </button>
            </div>

            {/* Header */}
            <div className="hairline-b px-5 pt-2 pb-4 md:px-6 md:pt-5">
              <h2
                id={titleId}
                className="text-[length:var(--text-section)] leading-[var(--leading-section)] text-ink-12 md:text-[length:var(--text-title)] md:leading-[var(--leading-title)]"
              >
                {title}
              </h2>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 md:px-6 md:py-5">
              {children}
            </div>

            {/* Footer */}
            {footer ? (
              <div className="hairline-t flex items-center justify-between gap-3 px-5 py-3 pb-[max(12px,env(safe-area-inset-bottom))] md:px-6 md:py-3">
                {footer}
              </div>
            ) : null}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
