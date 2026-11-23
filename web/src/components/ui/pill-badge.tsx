interface PillBadgeProps {
  tone?: "plum" | "amber" | "blue" | "green" | "red" | "neutral";
  size?: "sm" | "md";
  children: React.ReactNode;
}

const TONE_STYLES: Record<NonNullable<PillBadgeProps["tone"]>, string> = {
  plum: "bg-[var(--plum-3)] text-[var(--plum-11)] shadow-[var(--shadow-badge)]",
  amber: "bg-[var(--amber-3)] text-[var(--amber-11)] shadow-[var(--shadow-badge)]",
  blue: "bg-[var(--blue-3)] text-[var(--blue-11)] shadow-[var(--shadow-badge)]",
  green: "bg-[var(--green-3)] text-[var(--green-11)] shadow-[var(--shadow-badge)]",
  red: "bg-[var(--red-3)] text-[var(--red-11)] shadow-[var(--shadow-badge)]",
  neutral: "bg-[var(--raised)] text-ink-11 shadow-[var(--shadow-button)]",
};

export function PillBadge({
  tone = "neutral",
  size = "sm",
  children,
}: PillBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 text-[length:var(--text-meta)] leading-[var(--leading-meta)] ${
        size === "md" ? "h-6" : "h-[var(--badge-h)]"
      } ${TONE_STYLES[tone]}`}
    >
      {children}
    </span>
  );
}
