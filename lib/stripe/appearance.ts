import type { Appearance } from "@stripe/stripe-js";

// The app's own inputs are --tertiary at 35% over --primary, so the Element's fill is that blend flattened.
const FIELD = "#3C3838";
const PAGE = "#171717";
const BORDER = "#656464";
const TEXT = "#FFFFFF";
const LABEL = "#D4D4D4";
const MUTED = "#A7A7A7";
const ACCENT = "#FF2782";

// The Element renders in a Stripe iframe that Tailwind cannot reach, so the dark tokens are mirrored as literals here.
export const paymentAppearance: Appearance = {
  theme: "night",
  variables: {
    colorPrimary: ACCENT,
    colorBackground: FIELD,
    colorText: TEXT,
    colorTextSecondary: LABEL,
    colorTextPlaceholder: MUTED,
    colorSuccess: "#3FBF7F",
    // --destructive has no hex form in globals.css, so its oklch red is converted once here.
    colorDanger: "#F87171",
    // The iframe cannot read the page's CSS variables, so next/font's family is unreachable and a stack is named instead.
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    fontSizeBase: "16px",
    borderRadius: "10px",
    spacingUnit: "4px",
  },
  rules: {
    ".Label": { color: LABEL, fontWeight: "600" },
    ".Input": { color: TEXT, backgroundColor: FIELD, border: `1px solid ${BORDER}` },
    ".Input:focus": { border: `1px solid ${ACCENT}`, boxShadow: "none" },
    ".Input::placeholder": { color: MUTED },
    ".Tab": { color: TEXT, backgroundColor: FIELD, border: `1px solid ${BORDER}` },
    ".Tab:hover": { color: TEXT },
    ".Tab--selected": { color: TEXT, borderColor: ACCENT, backgroundColor: PAGE },
    ".TabLabel": { color: TEXT },
    ".Error": { color: "#F87171" },
  },
};
