import { useMemo } from "react";
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Link as MuiLink,
} from "@mui/material";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { getCampaignBySlug } from "../data/campaignsData";
import { getFeatureBySlug } from "../data/featuresData";
import { CAMPAIGN_ILLUSTRATIONS } from "../data/illustrations";
import Illustration from "./Illustration";
import PublicLayout from "./PublicLayout";
import SeoHead from "./SeoHead";
import WorkflowSteps from "./WorkflowSteps";

/**
 * Public-website Phase 3, Step 4 (CONTENT_ARCHITECTURE.md Template C).
 * Shared layout for every /campaigns/:slug page, driven entirely by
 * campaignsData.js. Distinct from FeaturePageTemplate (Template B):
 * campaign pages ground themselves in the vertical's real operational
 * shape and the actual field groups from the shipped template, then
 * point at 1-2 real dashboard templates that fit the workflow - they
 * never claim the system auto-assigns a dashboard to a campaign type.
 */
export default function CampaignPageTemplate({ campaign }) {
  const breadcrumbStructuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://operoza.com/" },
        { "@type": "ListItem", position: 2, name: "Campaigns", item: "https://operoza.com/campaigns" },
        { "@type": "ListItem", position: 3, name: campaign.title, item: `https://operoza.com/campaigns/${campaign.slug}` },
      ],
    }),
    [campaign]
  );

  const relatedCampaigns = (campaign.related || []).map(getCampaignBySlug).filter(Boolean);
  const relatedFeatures = (campaign.relatedFeatures || []).map(getFeatureBySlug).filter(Boolean);

  return (
    <PublicLayout>
      <SeoHead path={`/campaigns/${campaign.slug}`} title={`${campaign.title} CRM`} description={campaign.metaDescription} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbStructuredData)}</script>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, position: "relative", zIndex: 2 }}>
        <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />} sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" color="inherit" underline="hover">Home</MuiLink>
          <MuiLink component={Link} to="/campaigns" color="inherit" underline="hover">Campaigns</MuiLink>
          <Typography color="text.primary">{campaign.title}</Typography>
        </Breadcrumbs>

        {/* Hero */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 7 }} className="fade-up">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              <Chip label={campaign.eyebrow} color="secondary" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
                Run {campaign.title} Operations With Operoza
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" fontWeight={400} sx={{ maxWidth: 640 }}>
                {campaign.heroSubhead}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
                <Button component={Link} to="/start" variant="contained" size="large">
                  Start Free
                </Button>
                <Button component={Link} to="/campaigns" variant="outlined" size="large">
                  All Campaigns
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "center" } }}>
            <Illustration src={CAMPAIGN_ILLUSTRATIONS[campaign.slug]} alt={campaign.title} maxWidth={280} />
          </Grid>
        </Grid>

        {/* What this campaign involves */}
        <Box sx={{ mb: 7 }} className="fade-up">
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, mb: 1.5 }}>
            What a {campaign.title} Campaign Involves
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 760 }}>
            {campaign.involves.intro}
          </Typography>
          <List dense sx={{ maxWidth: 700 }}>
            {campaign.involves.points.map((point) => (
              <ListItem key={point} disableGutters>
                <ListItemIcon sx={{ minWidth: 34 }}>
                  <CheckCircleOutlineRoundedIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={point} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* How Operoza structures it - real field groups */}
        <Box sx={{ mb: 7 }} className="fade-up">
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, mb: 1.5 }}>
            How Operoza Structures It
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 760 }}>
            The {campaign.title} template ships with these field groups already built - every field stays
            admin-configurable afterward, and nothing here is fixed or hardcoded.
          </Typography>
          <Grid container spacing={2}>
            {campaign.fieldGroups.map((group) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={group.name}>
                <Card sx={{ height: "100%", border: "1px solid", borderColor: "divider", p: 2.5 }}>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    {group.name}
                  </Typography>
                  <Stack spacing={0.5}>
                    {group.fields.map((field) => (
                      <Typography key={field} variant="body2" color="text.secondary">
                        {field}
                      </Typography>
                    ))}
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Workflow */}
        <Box sx={{ mb: 7 }} className="fade-up">
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, mb: 3 }}>
            The Workflow
          </Typography>
          <Card sx={{ border: "1px solid", borderColor: "divider", p: { xs: 3, md: 4 } }}>
            <WorkflowSteps steps={campaign.workflow} />
          </Card>
        </Box>

        {/* Relevant reporting */}
        <Card sx={{ bgcolor: "brand.subtle", border: "none", p: { xs: 3, md: 4 }, mb: 7 }} className="fade-up">
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
            <InsightsRoundedIcon color="primary" />
            <Typography variant="h3" fontWeight={700} sx={{ fontSize: "1.4rem" }}>
              Reporting That Fits This Workflow
            </Typography>
          </Stack>
          <Typography color="text.secondary" sx={{ mb: 2, fontSize: "1.05rem" }}>
            {campaign.reporting.note}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {campaign.reporting.dashboards.map((dashboard) => (
              <Chip key={dashboard} label={dashboard} component={Link} to="/features/dashboards-reports" clickable />
            ))}
          </Stack>
        </Card>

        {/* Why it matters */}
        <Box sx={{ mb: 7 }} className="fade-up">
          <Typography variant="h3" fontWeight={700} sx={{ mb: 1, fontSize: "1.4rem" }}>
            Why It Matters
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1.05rem", maxWidth: 760 }}>
            {campaign.whyItMatters}
          </Typography>
        </Box>

        {/* Related features - two-way linking into feature deep dives */}
        {relatedFeatures.length > 0 ? (
          <Box sx={{ mb: 5 }}>
            <Typography variant="h3" sx={{ mb: 2, fontSize: "1.15rem" }}>Built On These Features</Typography>
            <Grid container spacing={2}>
              {relatedFeatures.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <Grid size={{ xs: 12, sm: 4 }} key={feature.slug}>
                    <Card
                      component={Link}
                      to={`/features/${feature.slug}`}
                      className="feature-card"
                      sx={{ height: "100%", display: "block", textDecoration: "none", color: "inherit" }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <FeatureIcon color="primary" />
                          <Typography fontWeight={600}>{feature.title}</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ) : null}

        {/* Related campaigns */}
        {relatedCampaigns.length > 0 ? (
          <Box sx={{ mb: 7 }}>
            <Typography variant="h3" sx={{ mb: 2, fontSize: "1.15rem" }}>Related Campaigns</Typography>
            <Grid container spacing={2}>
              {relatedCampaigns.map((related) => {
                const RelatedIcon = related.icon;
                return (
                  <Grid size={{ xs: 12, sm: 6 }} key={related.slug}>
                    <Card
                      component={Link}
                      to={`/campaigns/${related.slug}`}
                      className="feature-card"
                      sx={{ height: "100%", display: "block", textDecoration: "none", color: "inherit" }}
                    >
                      <CardContent>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <RelatedIcon color="primary" />
                          <Typography fontWeight={600}>{related.title}</Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        ) : null}

        <Divider sx={{ mb: 4 }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h3" sx={{ mb: 2, fontSize: "1.4rem" }}>Build your {campaign.title} campaign</Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center">
            <Button component={Link} to="/start" variant="contained" size="large">
              Start Free
            </Button>
            <Button component={Link} to="/demo" variant="outlined" size="large">
              Book a Demo
            </Button>
          </Stack>
        </Box>
      </Container>
    </PublicLayout>
  );
}
