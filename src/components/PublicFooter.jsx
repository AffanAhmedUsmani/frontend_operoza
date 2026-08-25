import { Box, Container, Divider, Stack, Link as MuiLink, Typography } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * Public-website Phase 3, Step 2. Real internal linking (per
 * CONVERSION_FUNNEL.md's two-way linking rule) rather than a dead end -
 * every public page ends here. Legal pages (Privacy/Terms) are
 * deliberately not linked yet: they don't exist (PUBLIC_WEBSITE_SITEMAP.md
 * notes this is a legal-drafting task, not an IA decision) - linking to
 * them now would be a dead link.
 */
export default function PublicFooter() {
  return (
    <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", mt: 8, py: 5, position: "relative", zIndex: 2 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={3}>
          <Stack spacing={1.5} sx={{ maxWidth: 360 }}>
            <Box component="img" src="/logo.png" alt="Operoza" sx={{ height: 36, width: "auto" }} />
            <Typography variant="body2" color="text.secondary">
              The CRM built around BPO campaigns - configurable campaigns, agent workflows, call
              analysis, payroll, and reporting in one platform.
            </Typography>
          </Stack>

          <Stack direction="row" spacing={6} flexWrap="wrap">
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">Product</Typography>
              <MuiLink component={Link} to="/features" color="inherit" underline="hover">Features</MuiLink>
              <MuiLink component={Link} to="/campaigns" color="inherit" underline="hover">Campaigns</MuiLink>
              <MuiLink component={Link} to="/pricing" color="inherit" underline="hover">Pricing</MuiLink>
              <MuiLink component={Link} to="/security" color="inherit" underline="hover">Security</MuiLink>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">Company</Typography>
              <MuiLink component={Link} to="/about" color="inherit" underline="hover">About</MuiLink>
              <MuiLink component={Link} to="/faq" color="inherit" underline="hover">FAQ</MuiLink>
              <MuiLink component={Link} to="/contact" color="inherit" underline="hover">Contact</MuiLink>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary">Get Started</Typography>
              <MuiLink component={Link} to="/start" color="inherit" underline="hover">Start Free</MuiLink>
              <MuiLink component={Link} to="/demo" color="inherit" underline="hover">Book a Demo</MuiLink>
              <MuiLink component={Link} to="/find-workspace" color="inherit" underline="hover">Find My Workspace</MuiLink>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Operoza. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
