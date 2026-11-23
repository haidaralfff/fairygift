interface StatusDotProps {
  tone: "amber" | "blue" | "green" | "red" | "neutral";
  label: string;
  ping?: boolean;
}

const TONE_COLOR: Record<StatusDotProps["tone"], string> = {
  amber: "bg-[var(--amber-9)]",
  blue: "bg-[var(--blue-9)]",
  green: "bg-[var(--green-9)]",
  red: "bg-[var(--red-9)]",
  neutral: "bg-ink-8",
};

export function StatusDot({ tone, label, ping = false }: StatusDotProps) {
  return (
    <span className="inline-flex items-center gap-2 text-[length:var(--text-body)] leading-[var(--leading-body)] text-ink-12">
      <span className="relative inline-flex size-2 shrink-0 items-center justify-center">
        {ping ? (
          <span
            aria-hidden="true"
            className={`animate-ping absolute inline-flex size-full rounded-full opacity-55 ${TONE_COLOR[tone]}`}
          />
        ) : null}
        <span
          aria-hidden="true"
          className={`relative inline-flex size-2 rounded-full ${TONE_COLOR[tone]}`}
        />
      </span>
      <span>{label}</span>
    </span>
  );
}
