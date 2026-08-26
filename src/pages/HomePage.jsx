import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { ILLUSTRATIONS } from "../data/illustrations";
import FeaturePoint from "../components/FeaturePoint";
import Illustration from "../components/Illustration";
import PublicLayout from "../components/PublicLayout";
import SectionDivider from "../components/SectionDivider";
import SeoHead from "../components/SeoHead";

// Post-Sprint-20, public-website Phase 3 Step 1 - replaces the previous
// attributed-quote testimonials (PUBLIC_WEBSITE_AUDIT.md §3a: no real
// customer, company, or name existed anywhere behind them). These are
// explicitly labeled illustrative scenarios per the resolved decision,
// not claimed as real customer quotes.
const illustrativeScenarios = [
  {
    quote:
      "Before a system like this, everything lived in spreadsheets. One place to track every lead and every agent makes the whole operation easier to run.",
    role: "A multi-campaign call center owner",
  },
  {
    quote:
      "Seeing performance, follow-ups, and results without having to ask anyone is the difference operational visibility makes.",
    role: "An operations manager running outbound sales",
  },
  {
    quote:
      "A CRM built around how a call center actually works, instead of a generic sales pipeline, saves real time every day.",
    role: "A team lead overseeing a support campaign",
  },
];

const heroValuePoints = [
  "Assign and track leads in real-time",
  "Monitor agent performance instantly",
  "Customize campaigns without touching code",
  "Get clear reports without manual work",
];

const problemPoints = [
  "Leads get lost or duplicated",
  "Agents do not follow up properly",
  "No visibility on real performance",
  "Managers rely on manual reports",
  "Scaling operations becomes messy",
];

// Post-Sprint-20 - expanded from the previous 5 generic cards to reflect
// what's actually implemented (PUBLIC_WEBSITE_AUDIT.md §4), not just the
// fraction of it the site used to mention.
const solutionBlocks = [
  {
    icon: <GroupsRoundedIcon fontSize="large" color="primary" />,
    title: "Configurable Campaigns",
    detail: "Build campaigns from templates or from scratch, with the exact fields and pipeline your operation needs - no code required.",
    to: "/features/campaign-management",
  },
  {
    icon: <TimelineRoundedIcon fontSize="large" color="primary" />,
    title: "Leads, Sales & Agent Performance",
    detail: "Track every lead through to a sale, and see who is working, who is closing, and who needs support right now.",
    to: "/features/sales-leads",
  },
  {
    icon: <GraphicEqRoundedIcon fontSize="large" color="primary" />,
    title: "Call Analysis",
    detail: "Upload call audio and get sentiment, compliance, and summary analysis on every recorded interaction.",
    to: "/features/call-analysis",
  },
  {
    icon: <PaymentsRoundedIcon fontSize="large" color="primary" />,
    title: "Payroll & Commission",
    detail: "Base salary, attendance-based deductions, and flat/percentage/tiered commission - computed automatically, even across campaigns in different currencies.",
    to: "/features/payroll-commission",
  },
  {
    icon: <DashboardRoundedIcon fontSize="large" color="primary" />,
    title: "Dashboards & Reports",
    detail: "Configurable dashboards and formula-driven reports, with scheduled delivery and CSV/XLSX/PDF export.",
    to: "/features/dashboards-reports",
  },
  {
    icon: <BadgeRoundedIcon fontSize="large" color="primary" />,
    title: "Client Portal",
    detail: "Give clients their own scoped view of campaign performance - without exposing the rest of your operation.",
    to: "/features/client-portal",
  },
  {
    icon: <AdminPanelSettingsRoundedIcon fontSize="large" color="primary" />,
    title: "Role-Based Access Control",
    detail: "Give the right access to admins, team leads, agents, HR, and clients, with clear boundaries enforced everywhere.",
    // Not its own /features page - RBAC is documented on Security
    // instead, so this links there rather than to a page that doesn't exist.
    to: "/security",
  },
  {
    icon: <InsightsRoundedIcon fontSize="large" color="primary" />,
    title: "Attendance & Workforce",
    detail: "Shift-based attendance, exception handling, and network-based sign-in restrictions for your agents.",
    to: "/features/attendance-workforce",
  },
];

// Post-Sprint-20 - a call center's customer data (names, SSNs, health and
// financial detail - see the real fields on any /campaigns/* page) is the
// business, so data isolation is surfaced here on the homepage itself,
// not left as something a prospect only finds by clicking into /security.
// Every point below is the same verified mechanism documented in full on
// SecurityPage.jsx - nothing new or stronger is claimed here. Placed near
// the end of the page (not straight after the hero) - the smoothest
// first-time read is what -> why -> how -> proof -> price, with security
// reassurance landing right before the close, not interrupting the pitch
// before it's even been made.
const dataTrustPoints = [
  {
    icon: <VerifiedUserRoundedIcon fontSize="large" color="primary" />,
    title: "Isolated at the Data Layer",
    detail: "Your workspace's data is scoped to your tenant on every single query - not just hidden in the interface. No other business on Operoza can see it, ever.",
  },
  {
    icon: <LockRoundedIcon fontSize="large" color="primary" />,
    title: "Access Enforced by Role, on the Server",
    detail: "Admin, Team Lead, Agent, HR Manager, and Client each get exactly the access their role allows - checked on every API request, not just hidden menu items.",
  },
  {
    icon: <HistoryRoundedIcon fontSize="large" color="primary" />,
    title: "Every Sensitive Action Logged",
    detail: "User changes, role changes, and network access changes are recorded with who did it and when - visible to your own Admin.",
  },
];

const insightPoints = [
  "Identify top-performing agents instantly",
  "Track conversion rates across campaigns",
  "Spot bottlenecks in your pipeline",
  "Monitor daily activity without chasing reports",
];

const howItWorks = [
  "Choose a campaign template, or build your own",
  "Add your team and assign roles",
  "Start managing leads and tracking performance",
];

// Post-Sprint-20 - replaces "Try CRM free for one week," which had no
// backend enforcement behind it anywhere in the codebase
// (PUBLIC_WEBSITE_AUDIT.md §3b). The real, implemented model is a
// capacity-limited free tier with no time limit and no card required.
const pricingHooks = [
  "No credit card required",
  "No time limit on the free tier",
  "Upgrade only when you need more capacity",
];

const heroStats = [
  { value: "10", label: "Campaign Templates" },
  { value: "5", label: "User Roles" },
  { value: "1", label: "Platform" },
];

const sectionTitleSx = {
  mb: 1,
  fontSize: { xs: "1.7rem", md: "2.2rem" },
};

function BulletList({ items, errorTone = false }) {
  return (
    <List dense sx={{ py: 0 }}>
      {items.map((item) => (
        <ListItem key={item} disableGutters>
          <ListItemIcon sx={{ minWidth: 34 }}>
            {errorTone ? <ErrorOutlineRoundedIcon color="primary" /> : <CheckCircleRoundedIcon color="secondary" />}
          </ListItemIcon>
          <ListItemText primary={item} />
        </ListItem>
      ))}
    </List>
  );
}

// Post-Sprint-20 - minimal, real structured data matching what's
// actually on this page (an Organization + the site itself) - no
// FAQPage/Product schema here, since this page isn't either of those
// (FaqPage.jsx carries its own FAQPage schema).
const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Operoza",
  url: "https://www.operoza.com",
  logo: "https://www.operoza.com/favicon.png",
};

const websiteStructuredData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Operoza",
  url: "https://www.operoza.com",
};

function HomePage() {
  return (
    <PublicLayout ambient={false}>
      <SeoHead
        path="/"
        description="Operoza is the CRM built for BPO campaigns: configurable campaigns, agent workflows, call analysis, payroll, and reporting - with your customer data isolated to your workspace alone."
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(organizationStructuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteStructuredData)}</script>
      </Helmet>

      {/* 1. Hero - what Operoza is */}
      <Box sx={{ position: "relative", zIndex: 2, pt: { xs: 5, md: 8 }, pb: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={3} alignItems="flex-start" className="fade-up">
                <Chip label="Operoza CRM Platform for BPO Teams" color="secondary" />
                <Typography variant="h1" sx={{ fontSize: { xs: "2.2rem", md: "4rem" }, maxWidth: 900 }}>
                  Run Your Call Center Without the <Box component="span" className="gradient-text">Chaos</Box>
                </Typography>
                <Typography variant="h5" component="p" color="text.secondary" sx={{ maxWidth: 840 }}>
                  Operoza is a configurable CRM built specifically for BPOs to manage campaigns, leads, agent
                  performance, and reporting - without spreadsheets or disconnected tools.
                </Typography>
                <BulletList items={heroValuePoints} />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <Button
                    component={Link}
                    to="/start"
                    variant="contained"
                    color="primary"
                    size="large"
                    endIcon={<ArrowForwardRoundedIcon />}
                    className="pulse-cta"
                  >
                    Start Free
                  </Button>
                </Stack>
                <Stack direction="row" spacing={{ xs: 3, sm: 5 }} sx={{ pt: 2 }}>
                  {heroStats.map((stat) => (
                    <Stack key={stat.label} spacing={0}>
                      <Typography variant="h3" sx={{ fontSize: "2rem" }}>{stat.value}</Typography>
                      <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", justifyContent: "center" }} className="fade-up">
              <Illustration
                src={ILLUSTRATIONS.homepageHero}
                alt="A cluttered desk of tangled cords and scattered notes on one side, an organized digital workspace on the other"
                maxWidth={420}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ color: "brand.subtle", position: "relative", zIndex: 2 }}>
        <SectionDivider />
      </Box>

      {/* 2. Problem - why the status quo doesn't work */}
      <Box sx={{ bgcolor: "brand.subtle", position: "relative", zIndex: 2, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Box className="fade-up">
            <Typography variant="h2" sx={sectionTitleSx}>
              Still Running Your BPO on Excel and WhatsApp?
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1.5 }}>
              Operoza replaces disconnected operations with one configurable system.
            </Typography>
            <BulletList items={problemPoints} errorTone />
          </Box>
        </Container>
      </Box>

      <Box sx={{ color: "background.default", position: "relative", zIndex: 2 }}>
        <SectionDivider />
      </Box>

      {/* 3. Solution - how Operoza actually covers it */}
      <Box sx={{ position: "relative", zIndex: 2, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={sectionTitleSx}>
            Everything You Need to Run a BPO In One Place
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Operoza is designed for real call center workflows, not generic CRM use cases.
          </Typography>
          <Grid container rowSpacing={0.5} columnSpacing={4}>
            {solutionBlocks.map((item) => (
              <Grid size={{ xs: 12, md: 6 }} key={item.title} className="fade-up">
                <FeaturePoint icon={item.icon} title={item.title} detail={item.detail} to={item.to} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ color: "brand.subtle", position: "relative", zIndex: 2 }}>
        <SectionDivider />
      </Box>

      {/* 4. How it works, in more depth - insights + onboarding */}
      <Box sx={{ bgcolor: "brand.subtle", position: "relative", zIndex: 2, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="feature-card fade-up" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 1, fontSize: "1.7rem" }}>
                    Real Insights, Not Guesswork
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1.2 }}>
                    Operoza helps you understand what is actually happening inside your call center.
                  </Typography>
                  <BulletList items={insightPoints} />
                  <Typography sx={{ mt: 1.2, fontWeight: 700 }}>
                    Make decisions based on data, not assumptions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card className="feature-card fade-up" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 1, fontSize: "1.7rem" }}>
                    Get Started in 3 Simple Steps
                  </Typography>
                  <BulletList items={howItWorks} />
                  <Typography color="text.secondary" sx={{ mt: 1.2 }}>
                    No complex onboarding. No technical headaches.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ color: "background.default", position: "relative", zIndex: 2 }}>
        <SectionDivider />
      </Box>

      {/* 5. Proof - illustrative scenarios */}
      <Box sx={{ position: "relative", zIndex: 2, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Typography variant="h2" sx={sectionTitleSx}>
            What Running Your BPO On Operoza Looks Like
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
            Illustrative examples - not attributed customer testimonials.
          </Typography>
          <Grid container spacing={3}>
            {illustrativeScenarios.map((t) => (
              <Grid size={{ xs: 12, md: 4 }} key={t.role}>
                <Card className="testimonial-card fade-up" sx={{ height: "100%" }}>
                  <CardContent>
                    <Chip label="Illustrative example" size="small" sx={{ mb: 1.5 }} />
                    <Typography sx={{ mb: 2 }}>&quot;{t.quote}&quot;</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t.role}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ color: "brand.subtle", position: "relative", zIndex: 2 }}>
        <SectionDivider />
      </Box>

      {/* 6. Trust reassurance - right before the close, not before the pitch */}
      <Box sx={{ bgcolor: "brand.subtle", position: "relative", zIndex: 2, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={5} alignItems="center" className="fade-up">
            <Grid size={{ xs: 12, md: 7 }}>
              <Stack spacing={1} sx={{ mb: 3, maxWidth: 760 }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <VerifiedUserRoundedIcon color="primary" />
                  <Chip label="Data Security" size="small" color="secondary" />
                </Stack>
                <Typography variant="h2" sx={sectionTitleSx}>
                  Your Customer Data Is Yours Alone
                </Typography>
                <Typography color="text.secondary">
                  A call center's customer data - names, health detail, financial and payment
                  information - is the entire business. Every Operoza workspace is isolated so that
                  data never touches another tenant's, in any form.
                </Typography>
              </Stack>
              <Grid container spacing={3}>
                {dataTrustPoints.map((item) => (
                  <Grid size={{ xs: 12, sm: 4 }} key={item.title}>
                    <Stack spacing={1.2}>
                      {item.icon}
                      <Typography variant="h3" sx={{ fontSize: "1.15rem" }}>{item.title}</Typography>
                      <Typography color="text.secondary" variant="body2">{item.detail}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
              <Button
                component={Link}
                to="/security"
                variant="outlined"
                endIcon={<ArrowForwardRoundedIcon />}
                sx={{ mt: 3, bgcolor: "background.default" }}
              >
                See Exactly How Your Data Is Protected
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", justifyContent: "center" }}>
              <Illustration
                src={ILLUSTRATIONS.homepageDataTrust}
                alt="A single sealed, isolated workspace representing tenant data isolation"
                maxWidth={340}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box sx={{ color: "background.default", position: "relative", zIndex: 2 }}>
        <SectionDivider />
      </Box>

      {/* 7. Price + final CTA - the close */}
      <Box sx={{ position: "relative", zIndex: 2, py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Card className="feature-card fade-up" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 1, fontSize: "1.7rem" }}>
                    Simple, Honest Pricing
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    Start on the free tier and upgrade capacity as your team grows.
                  </Typography>
                  <BulletList items={pricingHooks} />
                  <Button component={Link} to="/pricing" variant="text" endIcon={<ArrowForwardRoundedIcon />} sx={{ mt: 1 }}>
                    See full pricing
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Card sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider" }} className="fade-up">
                <Stack spacing={2}>
                  <Typography variant="h3" sx={{ fontSize: "1.7rem" }}>Take Control of Your Call Center Today</Typography>
                  <Typography color="text.secondary">
                    Stop relying on spreadsheets and disconnected tools. Start using a system built for your business.
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>Free to start. No credit card required.</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Button component={Link} to="/start" variant="contained" size="large">
                      Start Free
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </PublicLayout>
  );
}

export default HomePage;
