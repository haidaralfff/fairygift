"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  immediate?: boolean;
  as?: "div" | "li";
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 20,
  immediate = false,
  as = "div",
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const Component = as === "li" ? motion.li : motion.div;

  if (prefersReducedMotion) {
    if (as === "li") {
      return <li className={className}>{children}</li>;
    }
    return <div className={className}>{children}</div>;
  }

  if (immediate) {
    return (
      <Component
        initial={{ opacity: 0, y }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration, delay, ease: EASE_OUT }}
        className={className}
      >
        {children}
      </Component>
    );
  }

  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{ duration, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </Component>
  );
}
