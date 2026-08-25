import { alpha, createTheme, darken, lighten } from "@mui/material/styles";

const DEFAULT_PRIMARY = "#c05314";
const DEFAULT_SECONDARY = "#0f8a7a";
const DEFAULT_BACKGROUND = "#f7f4ee";
const DEFAULT_SURFACE = "#fffdf8";

/**
 * Sprint 19 (docs/SPRINT_PLAN.md), general guide S12 - "the frontend
 * theme provider reads [tenant branding] at login instead of the single
 * hardcoded palette." `buildTheme()` takes optional hex overrides for
 * the tenant's four colors (falling back to the original hardcoded
 * palette when a tenant hasn't set one).
 *
 * Post-Sprint-20: the four colors are Primary, Secondary, Background
 * (page canvas), and Surface (cards/panels) - a standard 4-token design
 * system. MUI's `createTheme` already derives light/dark/contrastText
 * variants for primary and secondary from `main` on its own; everything
 * else (backgrounds, generic hover overlays, elevation shadows) is
 * derived explicitly below so "the whole color experience" tracks the
 * tenant's palette, not just the primary/secondary swatches.
 *
 * `mode` ("light" | "dark") is a separate, per-viewer preference (see
 * useColorMode.js) layered on top of the same four tenant colors - it
 * does not require the tenant to pick a second set of colors. Dark mode
 * darkens the same background/surface hues (rather than switching to a
 * fixed grey) so a tenant's palette still reads as "theirs" in both
 * modes, and lightens primary/secondary slightly for contrast against a
 * dark canvas, per standard Material dark-theme guidance.
 */
export function buildTheme({ primaryColor, secondaryColor, backgroundColor, surfaceColor, mode } = {}) {
  const isDark = mode === "dark";

  const primaryBase = primaryColor || DEFAULT_PRIMARY;
  const secondaryBase = secondaryColor || DEFAULT_SECONDARY;
  const backgroundBase = backgroundColor || DEFAULT_BACKGROUND;
  // No explicit surface color yet: derive one from the background (a
  // lightened tint of it), same fallback this used before Surface
  // existed as its own tenant-selectable color.
  const surfaceBase = surfaceColor || (backgroundColor ? mix(backgroundBase, "#ffffff", 0.55) : DEFAULT_SURFACE);

  const primary = isDark ? lighten(primaryBase, 0.16) : primaryBase;
  const secondary = isDark ? lighten(secondaryBase, 0.16) : secondaryBase;
  // Paper stays lighter/more-elevated than the page canvas in both
  // modes (standard Material convention) - in dark mode that means
  // darkening the canvas hue MORE than the surface hue, not less.
  const backgroundDefault = isDark ? darken(backgroundBase, 0.87) : backgroundBase;
  const backgroundPaper = isDark ? darken(surfaceBase, 0.75) : surfaceBase;
  const textPrimary = isDark ? "#f4efe7" : "#1d1813";
  const textSecondary = isDark ? "#cabfae" : "#54493f";

  const theme = createTheme({
    palette: {
      mode: isDark ? "dark" : "light",
      primary: {
        main: primary,
      },
      secondary: {
        main: secondary,
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      // Generic hover/selected overlays (list items, menu items, etc. -
      // anything that isn't a Button, which already derives its own
      // hover from primary/secondary) tint toward the tenant's primary
      // color instead of a fixed neutral grey, a bit stronger in dark
      // mode where a faint tint is easier to miss.
      action: {
        hover: alpha(primary, isDark ? 0.14 : 0.06),
        selected: alpha(primary, isDark ? 0.22 : 0.1),
        focus: alpha(primary, isDark ? 0.3 : 0.14),
      },
      // Post-Sprint-20 - `divider` used to fall back to MUI's flat
      // neutral grey, which is how card/table borders across the app
      // ended up hardcoded to a literal tan hex (#ead8c4) instead of a
      // theme token in the first place: there was nothing tenant-aware
      // to point at. Tinting it from primary closes that gap for every
      // component that migrates to `borderColor: "divider"`.
      divider: alpha(primary, isDark ? 0.24 : 0.22),
      // THE central color controller's remaining surface: every
      // "faint tinted card/section background" in the app (previously
      // one-off hex literals like #f5ece0, #faf6f0, #fff7ef...) should
      // read from here instead, so it derives from the tenant's primary
      // color and adapts to light/dark mode automatically. Not a
      // standard MUI palette key - a deliberate small extension, same
      // pattern MUI itself documents for custom palette entries.
      brand: {
        subtle: alpha(primary, isDark ? 0.1 : 0.05),
        subtleHover: alpha(primary, isDark ? 0.16 : 0.09),
        subtleBorder: alpha(primary, isDark ? 0.28 : 0.16),
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Segoe UI", sans-serif',
      h1: {
        fontWeight: 800,
        letterSpacing: "-0.04em",
      },
      h2: {
        fontWeight: 800,
        letterSpacing: "-0.03em",
      },
      h3: {
        fontWeight: 700,
      },
      button: {
        textTransform: "none",
        fontWeight: 700,
      },
    },
    shape: {
      borderRadius: 18,
    },
  });

  // Elevation shadows: replace MUI's default neutral-grey shadow color
  // with one tinted by the tenant's (base, mode-independent) primary
  // color, at the same offsets/blur MUI already uses per elevation
  // level - so "shadows shift with the selected color" without
  // hand-authoring 25 new curves.
  const shadowColor = hexToRgbTriplet(primaryBase) || "0,0,0";
  theme.shadows = theme.shadows.map((shadow, index) => {
    if (index === 0) return "none";
    return shadow.replace(/rgba\(0,0,0,([\d.]+)\)/g, (_match, opacity) => `rgba(${shadowColor},${opacity})`);
  });

  theme.components = {
    ...theme.components,
    MuiPaper: {
      ...(theme.components?.MuiPaper || {}),
      styleOverrides: {
        ...(theme.components?.MuiPaper?.styleOverrides || {}),
        root: {
          backgroundImage: "none",
        },
      },
    },
  };

  return theme;
}

function hexToRgbTriplet(color) {
  const hexMatch = /^#([0-9a-f]{6})$/i.exec(String(color || "").trim());
  if (hexMatch) {
    const int = parseInt(hexMatch[1], 16);
    return `${(int >> 16) & 255},${(int >> 8) & 255},${int & 255}`;
  }
  const rgbMatch = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i.exec(String(color || "").trim());
  if (rgbMatch) {
    return `${Math.round(rgbMatch[1])},${Math.round(rgbMatch[2])},${Math.round(rgbMatch[3])}`;
  }
  return null;
}

function mix(hexA, hexB, weightOfA) {
  const a = hexToRgbTriplet(hexA);
  const b = hexToRgbTriplet(hexB);
  if (!a || !b) return hexA;
  const [ar, ag, ab] = a.split(",").map(Number);
  const [br, bg, bb] = b.split(",").map(Number);
  const r = Math.round(ar * weightOfA + br * (1 - weightOfA));
  const g = Math.round(ag * weightOfA + bg * (1 - weightOfA));
  const bl = Math.round(ab * weightOfA + bb * (1 - weightOfA));
  return `rgb(${r},${g},${bl})`;
}

export { DEFAULT_BACKGROUND, DEFAULT_PRIMARY, DEFAULT_SECONDARY, DEFAULT_SURFACE };

const theme = buildTheme();

export default theme;
