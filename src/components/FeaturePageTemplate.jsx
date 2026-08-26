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
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

import { getFeatureBySlug } from "../data/featuresData";
import { FEATURE_ILLUSTRATIONS } from "../data/illustrations";
import Illustration from "./Illustration";
import PublicLayout from "./PublicLayout";
import SeoHead from "./SeoHead";
import WorkflowSteps from "./WorkflowSteps";

/**
 * Public-website Phase 3, Step 3 (CONTENT_ARCHITECTURE.md Template B).
 * One shared, considered layout for every /features/:slug page, driven
 * entirely by featuresData.js - real design investment made once, not
 * ten slightly-inconsistent one-offs. Every section maps to the seven
 * questions Template B requires (what/who/problem/how/workflow/why/next).
 */
export default function FeaturePageTemplate({ feature }) {
  const breadcrumbStructuredData = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://www.operoza.com/" },
        { "@type": "ListItem", position: 2, name: "Features", item: "https://www.operoza.com/features" },
        { "@type": "ListItem", position: 3, name: feature.title, item: `https://www.operoza.com/features/${feature.slug}` },
      ],
    }),
    [feature]
  );

  const relatedFeatures = feature.related.map(getFeatureBySlug).filter(Boolean);

  return (
    <PublicLayout>
      <SeoHead path={`/features/${feature.slug}`} title={feature.title} description={feature.metaDescription} />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(breadcrumbStructuredData)}</script>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 }, position: "relative", zIndex: 2 }}>
        <Breadcrumbs separator={<NavigateNextRoundedIcon fontSize="small" />} sx={{ mb: 3 }}>
          <MuiLink component={Link} to="/" color="inherit" underline="hover">Home</MuiLink>
          <MuiLink component={Link} to="/features" color="inherit" underline="hover">Features</MuiLink>
          <Typography color="text.primary">{feature.title}</Typography>
        </Breadcrumbs>

        {/* Hero - the thesis of the page in one screen */}
        <Grid container spacing={4} alignItems="center" sx={{ mb: 7 }} className="fade-up">
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2}>
              <Chip label={feature.eyebrow} color="secondary" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "3rem" } }}>
                {feature.title}
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" fontWeight={400} sx={{ maxWidth: 640 }}>
                {feature.heroSubhead}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
                {feature.roles.map((role) => (
                  <Chip key={role} label={role} size="small" variant="outlined" />
                ))}
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ pt: 1 }}>
                <Button component={Link} to="/start" variant="contained" size="large">
                  Start Free
                </Button>
                <Button component={Link} to="/features" variant="outlined" size="large">
                  All Features
                </Button>
              </Stack>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "center" } }}>
            <Illustration src={FEATURE_ILLUSTRATIONS[feature.slug]} alt={feature.title} maxWidth={280} />
          </Grid>
        </Grid>

        {/* The problem */}
        <Box sx={{ mb: 7 }} className="fade-up">
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, mb: 1.5 }}>
            The Problem
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 760 }}>
            {feature.problem.intro}
          </Typography>
          <List dense sx={{ maxWidth: 640 }}>
            {feature.problem.points.map((point) => (
              <ListItem key={point} disableGutters>
                <ListItemIcon sx={{ minWidth: 34 }}>
                  <ErrorOutlineRoundedIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={point} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* How Operoza solves it */}
        <Box sx={{ mb: 7 }} className="fade-up">
          <Typography variant="h2" sx={{ fontSize: { xs: "1.5rem", md: "1.9rem" }, mb: 1.5 }}>
            How Operoza Solves It
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 760 }}>
            {feature.mechanism}
          </Typography>
          <Card sx={{ border: "1px solid", borderColor: "divider", p: { xs: 3, md: 4 } }}>
            <WorkflowSteps steps={feature.workflow} />
          </Card>
        </Box>

        {/* Why it matters */}
        <Card sx={{ bgcolor: "brand.subtle", border: "none", p: { xs: 3, md: 4 }, mb: 7 }} className="fade-up">
          <Typography variant="h3" fontWeight={700} sx={{ mb: 1, fontSize: "1.4rem" }}>
            Why It Matters
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: "1.05rem" }}>
            {feature.whyItMatters}
          </Typography>
        </Card>

        {/* Related features - real internal linking */}
        {relatedFeatures.length > 0 ? (
          <Box sx={{ mb: 7 }}>
            <Typography variant="h3" sx={{ mb: 2, fontSize: "1.15rem" }}>Related Features</Typography>
            <Grid container spacing={2}>
              {relatedFeatures.map((related) => {
                const RelatedIcon = related.icon;
                return (
                  <Grid size={{ xs: 12, sm: 4 }} key={related.slug}>
                    <Card
                      component={Link}
                      to={`/features/${related.slug}`}
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
          <Typography variant="h3" sx={{ mb: 2, fontSize: "1.4rem" }}>See it running in your own workspace</Typography>
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
