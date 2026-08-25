import { Box, Card, CardContent, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link } from "react-router-dom";

import Illustration from "../components/Illustration";
import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";
import { FEATURES } from "../data/featuresData";
import { ILLUSTRATIONS } from "../data/illustrations";

/**
 * Public-website Phase 3, Step 3. The /features hub - an index, not a
 * standalone pitch (PUBLIC_WEBSITE_SITEMAP.md), giving all 10 feature
 * pages one real parent instead of leaving them as orphaned pages
 * reachable only through in-content links.
 */
function FeaturesIndexPage() {
  return (
    <PublicLayout>
      <SeoHead
        path="/features"
        title="Features"
        description="Everything Operoza actually does: configurable campaigns, leads and sales, AI call analysis, attendance, payroll, dashboards and reports, client portal, messaging, branding, and data export."
      />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Grid container spacing={5} alignItems="center" sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1.5} sx={{ maxWidth: 760 }} className="fade-up">
              <Chip label="Features" color="secondary" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
                Everything You Need to Run a BPO
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" fontWeight={400}>
                Ten real capabilities, built around how a call center actually operates - not a
                generic feature list.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", justifyContent: "center" }} className="fade-up">
            <Illustration src={ILLUSTRATIONS.featuresHub} alt="Every feature area orbiting one connected hub" maxWidth={280} />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={feature.slug}>
                <Card
                  component={Link}
                  to={`/features/${feature.slug}`}
                  className="feature-card fade-up"
                  sx={{ height: "100%", display: "flex", flexDirection: "column", textDecoration: "none", color: "inherit" }}
                >
                  <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                    <Box
                      className="feature-card-icon"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "50%",
                        bgcolor: "brand.subtle",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                      }}
                    >
                      <Icon color="primary" />
                    </Box>
                    <Typography variant="h2" sx={{ mb: 1, fontSize: "1.15rem" }}>{feature.title}</Typography>
                    <Typography color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                      {feature.heroSubhead}
                    </Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "primary.main", fontWeight: 600 }}>
                      <Typography variant="body2" fontWeight={700} color="primary.main">Learn more</Typography>
                      <ArrowForwardRoundedIcon fontSize="small" className="feature-card-arrow" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </PublicLayout>
  );
}

export default FeaturesIndexPage;
