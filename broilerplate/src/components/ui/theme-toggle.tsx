"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type ThemeMode = "light" | "dark";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme");
    if (attr === "dark" || attr === "light") {
      setTheme(attr);
      return;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  function toggleTheme() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("fg-theme", next);
    } catch {
      // Ignore storage failures
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className="touch-target inline-flex h-[var(--control-h-pill)] items-center gap-1.5 rounded-full bg-[var(--raised)] px-3 text-[length:var(--text-meta)] text-ink-11 shadow-[var(--shadow-toggle)] transition-colors duration-[var(--dur-hover)] ease-[var(--ease-out)] hover:bg-ink-3 hover:text-ink-12 active:scale-[0.97]"
    >
      {theme === "dark" ? (
        <Sun className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
      ) : (
        <Moon className="size-3.5" strokeWidth={2.2} aria-hidden="true" />
      )}
      <span>{theme === "dark" ? "Terang" : "Gelap"}</span>
    </button>
  );
}
