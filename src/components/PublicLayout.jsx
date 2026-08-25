import { Box } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";

import storefrontTheme from "../storefrontTheme";
import FloatingActions from "./FloatingActions";
import PublicFooter from "./PublicFooter";
import PublicHeader from "./PublicHeader";

/**
 * Public-website Phase 3, Step 2. Shared shell for every public
 * marketing page (header + ambient background + footer + the existing
 * WhatsApp/Calendar floating CTAs) - factored out of HomePage.jsx once a
 * second real page (StartJourneyPage.jsx) and six more (this step)
 * needed the same structure, so real site navigation exists between
 * them instead of every page being an island only reachable by a direct
 * link. CRM pages (TenantCrmLayout) are a completely separate layout and
 * never use this.
 *
 * UI/UX revamp - nests storefrontTheme (pill buttons, larger-radius
 * cards) inside the app-wide default ThemeProvider from main.jsx, so
 * every public page reads as a marketing site rather than reusing the
 * CRM's dashboard-flavored defaults. CRM routes never render this
 * component, so they're unreachable by this override regardless.
 *
 * `ambient` (default true) toggles the single atmospheric glow
 * (.ambient-bg) designed for a short, one-background page. HomePage
 * passes `ambient={false}`: it now builds its own visual rhythm from
 * full-bleed alternating color bands (see SectionDivider), and the old
 * glow - one absolutely-positioned effect sized to the whole page -
 * only had one hero's worth of height to work with, so on a page this
 * much taller it showed through several bands at once as an unintended
 * muddy tint. Every other page is unaffected (still `ambient=true`).
 */
export default function PublicLayout({ children, ambient = true }) {
  return (
    <ThemeProvider theme={storefrontTheme}>
      <Box className="page-shell">
        <Box
          component="a"
          href="#main-content"
          className="skip-link"
          sx={{
            position: "absolute",
            left: 8,
            top: -60,
            zIndex: 10,
            bgcolor: "background.paper",
            color: "text.primary",
            px: 2,
            py: 1,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            transition: "top 0.15s ease-in-out",
            "&:focus": { top: 8 },
          }}
        >
          Skip to main content
        </Box>
        <PublicHeader />
        {/* PublicHeader is position:"fixed" (always locked to the
            viewport top, not just sticky-while-scrolling) - this spacer
            reserves the same height in the page's own flow so fixed
            positioning doesn't hide content underneath it. */}
        <Box sx={{ height: { xs: 84, md: 100 } }} />
        {ambient ? <Box className="ambient-bg" /> : null}
        <Box component="main" id="main-content">
          {children}
        </Box>
        <PublicFooter />
        <FloatingActions />
      </Box>
    </ThemeProvider>
  );
}
