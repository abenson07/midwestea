import type { CSSProperties } from "react";

export const mobilePageStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  height: "100%",
  minHeight: 0,
  background: "var(--linear-color-background)",
  color: "var(--linear-color-ink)",
};

export const mobileHeaderStyle: CSSProperties = {
  flexShrink: 0,
  padding: "12px 16px 8px",
  borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-background)",
};

export const mobileTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 600,
  letterSpacing: "-0.02em",
  color: "var(--linear-color-ink)",
};

export const mobileScrollStyle: CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflow: "auto",
  WebkitOverflowScrolling: "touch",
};

export const mobileListRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 12,
  width: "100%",
  padding: "14px 16px",
  border: "none",
  borderBottom: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  textAlign: "left",
  cursor: "pointer",
  boxSizing: "border-box",
};

export const mobileSearchInputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: 40,
  paddingInline: 12,
  borderRadius: 10,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 15,
  fontFamily: "inherit",
};

export const mobileFabStyle: CSSProperties = {
  position: "absolute",
  right: 16,
  bottom: 16,
  zIndex: 2,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  height: 48,
  paddingInline: 18,
  borderRadius: 999,
  border: "none",
  background: "var(--linear-color-accent)",
  color: "var(--linear-color-accent-ink, #fff)",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "inherit",
  boxShadow: "0 4px 16px rgba(0,0,0,0.28)",
  cursor: "pointer",
};

export const mobilePrimaryBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  width: "100%",
  height: 44,
  borderRadius: 10,
  border: "none",
  background: "var(--linear-color-accent)",
  color: "var(--linear-color-accent-ink, #fff)",
  fontSize: 15,
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
};

export const mobileSecondaryBtnStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  width: "100%",
  height: 44,
  borderRadius: 10,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 15,
  fontWeight: 500,
  fontFamily: "inherit",
  cursor: "pointer",
};

export const mobileFieldLabelStyle: CSSProperties = {
  fontSize: 12,
  color: "var(--linear-color-ink-subtle)",
};

export const mobileInputStyle: CSSProperties = {
  boxSizing: "border-box",
  width: "100%",
  height: 40,
  paddingInline: 10,
  borderRadius: 8,
  border: "var(--linear-border-width) solid var(--linear-color-hairline)",
  background: "var(--linear-color-canvas)",
  color: "var(--linear-color-ink)",
  fontSize: 15,
  fontFamily: "inherit",
};

export const mobileEmptyStyle: CSSProperties = {
  padding: "32px 16px",
  textAlign: "center",
  color: "var(--linear-color-ink-subtle)",
  fontSize: 14,
};
