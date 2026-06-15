export type Role = "public" | "member" | "coordinator" | "core_team";
export type Domain = "android" | "web" | "ml" | "iot" | "arvr";

// Mirrors artifacts/android .../ui/theme/Color.kt exactly so the prototype
// looks identical to the native Compose app.
export const theme = {
  bgBase: "#0A0A1A",
  bgMid: "#0F0F2E",
  bgEnd: "#1A0A2E",

  glassFill: "rgba(255,255,255,0.07)",
  glassFillStrong: "rgba(255,255,255,0.10)",
  glassBorder: "rgba(255,255,255,0.15)",

  textPrimary: "rgba(255,255,255,0.95)",
  textSecondary: "rgba(255,255,255,0.65)",
  textMuted: "rgba(255,255,255,0.40)",

  accentGreen: "#4ADE80", // android
  accentBlue: "#60A5FA", // web / primary
  accentPurple: "#A78BFA", // ml
  accentOrange: "#FB923C", // iot
  accentPink: "#F472B6", // arvr

  accentAmber: "#FBBF24",
  accentRed: "#F87171",
} as const;

export const bgGradient = `linear-gradient(160deg, ${theme.bgBase} 0%, ${theme.bgMid} 55%, ${theme.bgEnd} 100%)`;

export function domainColor(domain?: Domain | null): string {
  switch (domain) {
    case "android":
      return theme.accentGreen;
    case "web":
      return theme.accentBlue;
    case "ml":
      return theme.accentPurple;
    case "iot":
      return theme.accentOrange;
    case "arvr":
      return theme.accentPink;
    default:
      return theme.accentBlue;
  }
}

export const DOMAINS: Domain[] = ["android", "web", "ml", "iot", "arvr"];

export function domainLabel(domain: Domain): string {
  return { android: "Android", web: "Web", ml: "ML", iot: "IoT", arvr: "AR/VR" }[
    domain
  ];
}

export function roleLabel(role: Role): string {
  return role.replace("_", " ").toUpperCase();
}

export function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
