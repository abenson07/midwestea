"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BannerEnrollmentItem } from "@/lib/marketing/banner-enrollment";

const ROTATE_MS = 25_000;
const FADE_MS = 300;

type RotatingEnrollmentBannerProps = {
  items: BannerEnrollmentItem[];
};

export function RotatingEnrollmentBanner({ items }: RotatingEnrollmentBannerProps) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (items.length <= 1) return;

    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((current) => (current + 1) % items.length);
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);

    return () => window.clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  const item = items[index] ?? items[0];

  return (
    <Link
      href={item.href}
      className="hidden h-12 w-full bg-neutral-lighter md:flex md:items-center md:justify-center hover:opacity-90"
    >
      <span
        className="px-4 text-center text-xs leading-[1.4] text-text transition-opacity duration-300"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <span className="font-bold">{item.headline}</span>
        {item.detail ? ` ${item.detail}` : null}
      </span>
    </Link>
  );
}
