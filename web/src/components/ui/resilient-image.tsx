"use client";

import { useEffect, useState } from "react";
import CardGiftcardOutlinedIcon from "@mui/icons-material/CardGiftcardOutlined";

interface ResilientImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
}

export function ResilientImage({
  src,
  alt,
  className = "",
  priority = false,
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-ink-2 text-ink-9 ${className}`}
      >
        <CardGiftcardOutlinedIcon style={{ fontSize: 20 }} aria-hidden="true" />
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
