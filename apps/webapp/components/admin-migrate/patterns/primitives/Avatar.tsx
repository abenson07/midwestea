"use client";

const AVATAR_COLORS = ["#5e6ad2", "#eb5757", "#f2994a", "#27a644", "#4db6ac", "#e879a9"];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export type AvatarProps = {
  name: string;
  size?: "sm" | "md";
};

export function Avatar({ name, size = "md" }: AvatarProps) {
  const px = size === "sm" ? 20 : 32;

  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: px,
        height: px,
        borderRadius: "50%",
        background: colorForName(name),
        color: "#ffffff",
        fontSize: size === "sm" ? 10 : 13,
        fontWeight: 600,
        flexShrink: 0,
      }}
    >
      {getInitials(name)}
    </span>
  );
}
