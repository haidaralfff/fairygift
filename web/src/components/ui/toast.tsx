"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";

type ToastTone = "green" | "red" | "amber" | "neutral";

interface ToastMessage {
  id: number;
  text: string;
  tone: ToastTone;
}

interface ToastContextValue {
  showToast: (text: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_CLASS: Record<ToastTone, string> = {
  green: "bg-[var(--green-3)] text-[var(--green-11)] border-[var(--green-6)]",
  red: "bg-[var(--red-3)] text-[var(--red-11)] border-[var(--red-6)]",
  amber: "bg-[var(--amber-3)] text-[var(--amber-11)] border-[var(--amber-6)]",
  neutral: "bg-[var(--raised)] text-ink-12 border-ink-6",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const timerRef = useRef<number | null>(null);

  const showToast = useCallback((text: string, tone: ToastTone = "neutral") => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const id = Date.now();
    setToast({ id, text, tone });
    timerRef.current = window.setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 6000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[var(--z-toast)] flex justify-center px-4"
      >
        <AnimatePresence>
          {toast ? (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className={`pointer-events-auto inline-flex min-h-12 max-w-[460px] items-center rounded-full border px-5 py-2.5 text-[length:var(--text-body)] shadow-[var(--shadow-menu)] ${TONE_CLASS[toast.tone]}`}
            >
              {toast.text}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast harus dipakai di dalam ToastProvider.");
  }
  return ctx;
}
