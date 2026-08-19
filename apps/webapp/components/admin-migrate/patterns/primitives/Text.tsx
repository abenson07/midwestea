"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

export type TextColor = "primary" | "secondary" | "disabled" | "accent";
export type TextSize = "sm" | "md";
export type TextWeight = "regular" | "medium" | "semibold";
export type TextType = "body" | "label";

export type TextProps = {
  children?: ReactNode;
  size?: TextSize;
  color?: TextColor;
  weight?: TextWeight;
  type?: TextType;
  as?: ElementType;
  display?: "inline" | "block";
  style?: CSSProperties;
};

const colorVar: Record<TextColor, string> = {
  primary: "var(--linear-color-ink)",
  secondary: "var(--linear-color-ink-subtle)",
  disabled: "var(--linear-color-ink-tertiary)",
  accent: "var(--linear-color-accent)",
};

const fontWeight: Record<TextWeight, number> = {
  regular: 400,
  medium: 510,
  semibold: 600,
};

export function Text({
  children,
  size = "md",
  color = "primary",
  weight = "regular",
  type = "body",
  as,
  display = "inline",
  style,
}: TextProps) {
  const Element: ElementType = as ?? (display === "block" ? "p" : "span");
  const isLabel = type === "label";

  return (
    <Element
      style={{
        margin: 0,
        fontSize: isLabel ? 12 : size === "sm" ? 13 : 14,
        lineHeight: isLabel ? "16px" : size === "sm" ? "20px" : "22px",
        fontWeight: isLabel ? fontWeight.medium : fontWeight[weight],
        color: colorVar[color],
        ...style,
      }}
    >
      {children}
    </Element>
  );
}

export type HeadingLevel = 1 | 2 | 3;

export type HeadingProps = {
  children?: ReactNode;
  level?: HeadingLevel;
  style?: CSSProperties;
};

const headingStyle: Record<HeadingLevel, CSSProperties> = {
  1: { fontSize: 20, lineHeight: "26px", fontWeight: 600, letterSpacing: "-0.01em" },
  2: { fontSize: 16, lineHeight: "22px", fontWeight: 600 },
  3: { fontSize: 14, lineHeight: "20px", fontWeight: 600 },
};

export function Heading({ children, level = 1, style }: HeadingProps) {
  const Element = `h${level}` as ElementType;
  return (
    <Element
      style={{
        margin: 0,
        color: "var(--linear-color-ink)",
        ...headingStyle[level],
        ...style,
      }}
    >
      {children}
    </Element>
  );
}
