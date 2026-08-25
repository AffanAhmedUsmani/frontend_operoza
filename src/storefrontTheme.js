import { createTheme } from "@mui/material/styles";

import theme from "./theme";

/**
 * Public-website UI/UX revamp. A Storefront-only visual layer, nested
 * inside PublicLayout via its own <ThemeProvider> - CRM (TenantCrmLayout,
 * TenantLoginPage, TenantPortalPage) never renders PublicLayout and each
 * builds its own theme independently (see theme.js's own buildTheme()
 * callers), so nothing here can reach or change CRM's appearance.
 *
 * Built on top of the base theme (same palette, same typography, same
 * "brand" tokens) via createTheme(baseTheme, overrides) - MUI's
 * documented pattern for extending an existing theme - rather than a
 * from-scratch palette, so the Storefront stays visibly the same brand,
 * just styled like a marketing site instead of a dashboard: pill-shaped
 * buttons, larger-radius cards, bolder chips.
 */
const storefrontTheme = createTheme(theme, {
  shape: {
    borderRadius: 22,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
        sizeLarge: {
          paddingTop: 10,
          paddingBottom: 10,
          paddingLeft: 24,
          paddingRight: 24,
          fontSize: "0.975rem",
        },
        sizeMedium: {
          paddingLeft: 20,
          paddingRight: 20,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
  },
});

export default storefrontTheme;
