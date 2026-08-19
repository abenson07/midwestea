"use client";

import { Sparkles } from "lucide-react";

export function WorkspaceMark() {
  return (
    <span
      aria-hidden
      style={{
        width: 18,
        height: 18,
        borderRadius: 4,
        background: "#E9AF08",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Sparkles size={11} color="#1a1a1a" strokeWidth={2.25} />
    </span>
  );
}
