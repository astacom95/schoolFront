export const colors = {
  primary: "#8CA9FF",
  secondary: "#FFF2C6",
  highlight: "#FFF8DE",
  accent: "#AAC4F5",
  surface: "#101935",
  surfaceAlt: "#161f3b",
  text: "#f6f7fb",
  mutedText: "#c8d0f0"
} as const;

export type ColorName = keyof typeof colors;
