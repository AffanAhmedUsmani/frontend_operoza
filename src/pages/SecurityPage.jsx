import { Box, Button, Card, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import GppGoodRoundedIcon from "@mui/icons-material/GppGoodRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import WifiTetheringRoundedIcon from "@mui/icons-material/WifiTetheringRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { Link } from "react-router-dom";

import FeaturePoint from "../components/FeaturePoint";
import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";

// Post-Sprint-20, public-website Phase 3 Step 2. Every claim here is a
// real, verified mechanism (PUBLIC_WEBSITE_AUDIT.md's Template E) - no
// "bank-level security" or unqualified "100% secure" language, and no
// compliance certification claimed since none exists.
const securityPoints = [
  {
    icon: <VerifiedUserRoundedIcon fontSize="large" color="primary" />,
    title: "Tenant Data Isolation",
    detail: "Every record in the system is scoped to your workspace. Tenants never share data, and every query is filtered by tenant at the data layer, not just hidden in the interface.",
  },
  {
    icon: <LockRoundedIcon fontSize="large" color="primary" />,
    title: "Role-Based Access Control",
    detail: "Five roles - Admin, Team Lead, Agent, HR Manager, Client - each with permissions enforced on the server, not just hidden menu items. An Agent's API requests are checked the same way their screens are.",
  },
  {
    icon: <HistoryRoundedIcon fontSize="large" color="primary" />,
    title: "Activity & Audit Log",
    detail: "Sensitive actions - user changes, role changes, branding updates, network access changes, campaign and report creation - are recorded with who did what and when, visible to your Admin.",
  },
  {
    icon: <WifiTetheringRoundedIcon fontSize="large" color="primary" />,
    title: "Network Access Restrictions",
    detail: "Restrict Agent sign-in to specific IP addresses or ranges you control, so agent accounts can't be used from an unapproved network.",
  },
  {
    icon: <GppGoodRoundedIcon fontSize="large" color="primary" />,
    title: "Account & Session Security",
    detail: "Passwords are hashed, never stored in plain text. Repeated failed login attempts (5) lock an account for 15 minutes. Sessions use short-lived access tokens with rotating refresh tokens.",
  },
];

function SecurityPage() {
  return (
    <PublicLayout>
      <SeoHead
        path="/security"
        title="Security"
        description="How Operoza protects your workspace: tenant data isolation, server-enforced role-based access control, an audit log, network access restrictions, and secure session handling."
      />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Stack spacing={1.5} sx={{ mb: 5, maxWidth: 760 }} className="fade-up">
          <Chip label="Security" color="secondary" sx={{ alignSelf: "flex-start" }} />
          <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
            What Actually Protects Your Data
          </Typography>
          <Typography variant="h6" component="p" color="text.secondary" fontWeight={400}>
            Specific mechanisms, not marketing adjectives. Here's what's actually enforced.
          </Typography>
        </Stack>

        <Grid container rowSpacing={0.5} columnSpacing={4} sx={{ mb: 6 }}>
          {securityPoints.map((item) => (
            <Grid size={{ xs: 12, md: 6 }} key={item.title} className="fade-up">
              <FeaturePoint icon={item.icon} title={item.title} detail={item.detail} />
            </Grid>
          ))}
        </Grid>

        <Card sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider", mb: 5 }}>
          <Typography variant="h2" sx={{ mb: 1, fontSize: "1.3rem" }}>What we don't claim</Typography>
          <Typography color="text.secondary">
            We don't hold a specific compliance certification today, and we won't describe our
            security as "bank-level" or "100% secure" - no software honestly can. If your team has
            a specific security or compliance question before signing up, ask us directly.
          </Typography>
        </Card>

        <Box sx={{ textAlign: "center" }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button component={Link} to="/start" variant="contained" size="large">
              Start Free
            </Button>
            <Button component={Link} to="/contact" variant="outlined" size="large">
              Ask a Security Question
            </Button>
          </Stack>
        </Box>
      </Container>
    </PublicLayout>
  );
}

export default SecurityPage;
