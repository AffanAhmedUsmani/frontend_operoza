import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import GraphicEqRoundedIcon from "@mui/icons-material/GraphicEqRounded";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import { Link } from "react-router-dom";

import Illustration from "../components/Illustration";
import PriceCalculator from "../components/PriceCalculator";
import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";
import { ILLUSTRATIONS } from "../data/illustrations";

// Post-Sprint-20, public-website Phase 3 Step 2. Every number below is
// the real, seeded rate card (billing/migrations/0002_seed_tier_rate_card.py)
// and Free-tier allowance (PLATFORM_OPS_AND_BILLING.md §1) - not
// invented pricing. Free and Gold are the SAME product; "Gold" is a
// label for "capacity allocated above the Free row," never a feature
// gate (billing/models.py's own module docstring).
const freeIncludes = [
  "10 team seats",
  "1 GB audio transcription / month",
  "500 MB file storage",
  "20 AI-assist actions / month",
  "Every feature - campaigns, sales, attendance",
  "Payroll, dashboards, reports, client portal",
];

const overageTiles = [
  { icon: <GroupsRoundedIcon color="primary" />, dimension: "Team seats", rate: "$2.00", unit: "/ seat / mo" },
  { icon: <GraphicEqRoundedIcon color="primary" />, dimension: "Audio transcription", rate: "$5.00", unit: "/ GB / mo" },
  { icon: <CloudQueueRoundedIcon color="primary" />, dimension: "File storage", rate: "$1.00", unit: "/ GB / mo" },
  { icon: <AutoAwesomeRoundedIcon color="primary" />, dimension: "AI-assist actions", rate: "$0.25", unit: "/ action / mo" },
];

const workedExamples = [
  { setup: "15 seats, 2 GB transcription, 500 MB storage, 20 AI actions", cost: "$15", period: "/month" },
  { setup: "20 seats, 4 GB transcription", cost: "$35", period: "/month" },
  { setup: "100 seats, 4 GB transcription", cost: "$195", period: "/month" },
];

function PricingPage() {
  return (
    <PublicLayout>
      <SeoHead
        path="/pricing"
        title="Pricing"
        description="Operoza pricing: a free tier with real capacity (10 seats, 1GB transcription, 500MB storage), then pay only for what you use beyond it. No feature gating, no time limit."
      />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Grid container spacing={5} alignItems="center" sx={{ mb: 6 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1.5} sx={{ maxWidth: 760 }} className="fade-up">
              <Chip label="Pricing" color="secondary" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
                Simple, Honest Pricing
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" fontWeight={400}>
                Free and paid tenants run the exact same product. The only thing capacity ever
                controls is how much room you have - never which features you can use.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", justifyContent: "center" }} className="fade-up">
            <Illustration src={ILLUSTRATIONS.pricingPage} alt="Ascending steps representing starting free and scaling up capacity" maxWidth={280} />
          </Grid>
        </Grid>

        {/* One unified plan, not two competing cards - Free and paid are
            the same product, so presenting them as rival tiers implied
            a choice that doesn't actually exist. */}
        <Card
          className="fade-up"
          sx={{
            mb: 6,
            p: { xs: 3, md: 5 },
            border: "2px solid",
            borderColor: "primary.main",
            background: (t) => `linear-gradient(135deg, ${t.palette.brand.subtle}, transparent)`,
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 5 }}>
              <Chip label="Free to start" color="primary" sx={{ mb: 1.5 }} />
              <Typography variant="h2" sx={{ fontSize: { xs: "2.6rem", md: "3.4rem" }, lineHeight: 1 }}>
                $0
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2.5 }}>
                No credit card. No time limit. Upgrade only when you outgrow the capacity below.
              </Typography>
              <Button component={Link} to="/start" variant="contained" size="large">
                Start Free
              </Button>
            </Grid>
            <Grid size={{ xs: 12, md: 7 }}>
              <Grid container spacing={1.5}>
                {freeIncludes.map((item) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={item}>
                    <Stack direction="row" spacing={1} alignItems="flex-start">
                      <CheckCircleRoundedIcon color="secondary" fontSize="small" sx={{ mt: 0.3, flexShrink: 0 }} />
                      <Typography variant="body2">{item}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Card>

        {/* Overage rates as a clean tile row, not an HTML-table look. */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ mb: 0.5, fontSize: "1.4rem" }}>Beyond the Free Tier</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            No base fee, no bucket jump - billed for capacity beyond the free allowance, one dimension at a time.
          </Typography>
          <Grid container spacing={2.5}>
            {overageTiles.map((tile) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tile.dimension}>
                <Stack
                  spacing={1}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    bgcolor: "brand.subtle",
                    height: "100%",
                  }}
                >
                  {tile.icon}
                  <Typography variant="body2" color="text.secondary">{tile.dimension}</Typography>
                  <Typography variant="h3" sx={{ fontSize: "1.5rem" }}>
                    {tile.rate}
                    <Typography component="span" variant="body2" color="text.secondary"> {tile.unit}</Typography>
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ mb: 6 }}>
          <PriceCalculator />
        </Box>

        {/* Worked examples as bold stat tiles instead of a table. */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h2" sx={{ mb: 3, fontSize: "1.4rem" }}>What That Looks Like In Practice</Typography>
          <Grid container spacing={2.5}>
            {workedExamples.map((row) => (
              <Grid size={{ xs: 12, md: 4 }} key={row.setup}>
                <Stack
                  spacing={1}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    height: "100%",
                  }}
                >
                  <Typography variant="h3" sx={{ fontSize: "2rem" }}>
                    {row.cost}
                    <Typography component="span" variant="body1" color="text.secondary"> {row.period}</Typography>
                  </Typography>
                  <Typography color="text.secondary" variant="body2">{row.setup}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Storage and AI-assist usage scale the same linear way, and are cheap enough relative to
            transcription that they rarely dominate a bill.
          </Typography>
        </Box>

        <Card sx={{ bgcolor: "brand.subtle", border: "none", p: { xs: 3, md: 4 } }}>
          <Grid container spacing={3} alignItems="center">
            <Grid size={{ xs: 12, md: 7 }}>
              <Typography variant="h2" sx={{ mb: 1, fontSize: "1.4rem" }}>Running a larger operation?</Typography>
              <Typography color="text.secondary">
                At significant scale (roughly 200+ seats), linear per-seat pricing gives way to a
                negotiated arrangement. Talk to us and we'll work out a number that makes sense for
                your footprint.
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Button component={Link} to="/contact" variant="contained" size="large" fullWidth>
                  Talk to Us
                </Button>
                <Button component={Link} to="/demo" variant="outlined" size="large" fullWidth sx={{ bgcolor: "background.default" }}>
                  Book a Demo
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Container>
    </PublicLayout>
  );
}

export default PricingPage;
