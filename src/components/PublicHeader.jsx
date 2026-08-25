import { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { label: "Features", to: "/features" },
  { label: "Campaigns", to: "/campaigns" },
  { label: "Pricing", to: "/pricing" },
  { label: "Security", to: "/security" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
];

/**
 * Public-website Phase 3, Step 2 (PUBLIC_WEBSITE_SITEMAP.md); UI/UX
 * revamp - locked to the top of the viewport at all times (position
 * "fixed", not "sticky" - sticky still lets the bar visually merge into
 * the page when a section right beneath it shares its background;
 * fixed keeps it a genuinely separate, always-on-top layer), with a
 * real mobile hamburger -> slide-in Drawer instead of the nav links
 * just wrapping onto a second line at narrow widths. CRM pages
 * (TenantCrmLayout) have their own, unrelated header and never render
 * this. PublicLayout adds a matching-height spacer so fixed positioning
 * doesn't hide page content underneath it.
 */
export default function PublicHeader() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (to) => location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: "blur(14px)",
          bgcolor: "rgba(247, 244, 238, 0.82)",
          borderBottom: "1px solid",
          borderColor: "brand.subtleBorder",
          boxShadow: "0 8px 24px rgba(79, 42, 17, 0.06)",
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 1, py: 1 }}>
            <Box
              component={Link}
              to="/"
              sx={{ display: "flex", alignItems: "center", mr: "auto" }}
            >
              <Box component="img" src="/logo.png" alt="Operoza" sx={{ height: { xs: 60, md: 76 }, width: "auto" }} />
            </Box>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{ display: { xs: "none", lg: "flex" } }}
            >
              {NAV_LINKS.map((item) => (
                <Button
                  key={item.to}
                  component={Link}
                  to={item.to}
                  color="inherit"
                  size="small"
                  sx={{
                    borderRadius: 999,
                    px: 1.75,
                    fontWeight: isActive(item.to) ? 700 : 500,
                    bgcolor: isActive(item.to) ? "brand.subtle" : "transparent",
                    "&:hover": { bgcolor: "brand.subtleHover" },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Button
              component={Link}
              to="/start"
              variant="contained"
              size="small"
              sx={{ display: { xs: "none", sm: "inline-flex" }, ml: 1 }}
            >
              Start Free
            </Button>

            <IconButton
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              sx={{ display: { xs: "inline-flex", lg: "none" } }}
            >
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280, py: 2, height: "100%", display: "flex", flexDirection: "column" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, mb: 1 }}>
            <Box component="img" src="/logo.png" alt="Operoza" sx={{ height: 40, width: "auto" }} />
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="Close menu">
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
          <Divider sx={{ mb: 1 }} />
          <Stack sx={{ px: 1, flexGrow: 1 }}>
            {NAV_LINKS.map((item) => (
              <Button
                key={item.to}
                component={Link}
                to={item.to}
                onClick={() => setDrawerOpen(false)}
                fullWidth
                sx={{
                  justifyContent: "flex-start",
                  borderRadius: 2,
                  px: 2,
                  py: 1.2,
                  fontWeight: isActive(item.to) ? 700 : 500,
                  bgcolor: isActive(item.to) ? "brand.subtle" : "transparent",
                  color: "text.primary",
                }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
          <Box sx={{ px: 2, pb: 1 }}>
            <Button
              component={Link}
              to="/start"
              onClick={() => setDrawerOpen(false)}
              variant="contained"
              fullWidth
              size="large"
            >
              Start Free
            </Button>
          </Box>
        </Box>
      </Drawer>
    </>
  );
}
