"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { BrandLogo } from "@/components/ui/brand-logo";
import { getClientAuth, isFirebaseClientConfigured } from "@/lib/firebase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isFirebaseClientConfigured()) return;
    const unsub = onAuthStateChanged(getClientAuth(), (currentUser) => {
      if (currentUser) {
        router.replace("/admin");
      }
    });
    return () => unsub();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isFirebaseClientConfigured()) {
      setError("Sistem masuk admin belum terhubung ke database toko. Hubungi pengelola teknis untuk mengaktifkan akun.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(getClientAuth(), email.trim(), password);
      router.push("/admin");
    } catch {
      setError("Email atau kata sandi salah. Periksa kembali lalu coba masuk lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main
      id="main-content"
      className="flex min-h-dvh items-center justify-center bg-[var(--ground)] px-4 py-10"
    >
      <div className="surface-raised w-full max-w-[464px] rounded-[var(--radius-container)] bg-[var(--raised)] p-8 shadow-[var(--shadow-card)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <BrandLogo height={28} />
          <div>
            <h1 className="font-display text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-ink-12">
              FairyGift Admin
            </h1>
            <p className="mt-1 text-[length:var(--text-body)] font-normal text-ink-11">
              Masuk untuk mengelola katalog, pesanan, dan pembayaran.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-email" className="text-[length:var(--text-body)] text-ink-12">
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={Boolean(error)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fairygift.id"
              className={`h-[var(--control-h)] rounded-[var(--radius-control)] border-0 bg-ink-3 px-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none ${
                error ? "shadow-[0_0_0_1px_var(--red-11)]" : ""
              }`}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="admin-password" className="text-[length:var(--text-body)] text-ink-12">
              Kata sandi
            </label>
            <div className="relative flex items-center">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                aria-required="true"
                aria-invalid={Boolean(error)}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className={`h-[var(--control-h)] w-full rounded-[var(--radius-control)] border-0 bg-ink-3 pr-11 pl-3 text-[length:var(--text-field)] text-ink-12 placeholder:text-ink-10 focus:bg-ink-4 focus:outline-none ${
                  error ? "shadow-[0_0_0_1px_var(--red-11)]" : ""
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                aria-pressed={showPassword}
                title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                className="touch-target absolute right-1.5 inline-flex size-[var(--control-h-pill)] items-center justify-center rounded-[var(--radius-sm)] text-ink-10 transition-colors duration-[var(--dur-hover)] hover:bg-ink-4 hover:text-ink-12 active:scale-[0.96]"
              >
                {showPassword ? (
                  <VisibilityOffOutlinedIcon style={{ fontSize: 18 }} aria-hidden="true" />
                ) : (
                  <VisibilityOutlinedIcon style={{ fontSize: 18 }} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-[length:var(--text-meta)] text-[var(--red-11)]">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex h-[var(--control-h)] w-full items-center justify-center rounded-[var(--radius-control)] bg-[var(--primary-bg)] px-4 text-[length:var(--text-body)] text-[var(--primary-fg)] shadow-[var(--shadow-primary)] transition-transform duration-[var(--dur-hover)] hover:bg-[var(--primary-hover)] active:scale-[0.97] disabled:opacity-60"
          >
            {isSubmitting ? "Memeriksa…" : "Masuk"}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-[length:var(--text-meta)]">
          <Link href="/" className="text-ink-11 underline hover:text-ink-12">
            Kembali ke toko
          </Link>
          {!isFirebaseClientConfigured() ? (
            <Link href="/admin" className="text-ink-10 hover:text-ink-12">
              Buka mode pratinjau
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}
