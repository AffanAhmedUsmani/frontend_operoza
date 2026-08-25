import { Chip, Container, Grid, Stack, Typography } from "@mui/material";

import CampaignPanel from "../components/CampaignPanel";
import Illustration from "../components/Illustration";
import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";
import { CAMPAIGNS } from "../data/campaignsData";
import { ILLUSTRATIONS } from "../data/illustrations";

/**
 * Public-website Phase 3, Step 4. The /campaigns hub - the canonical
 * home for all 10 campaign-template pages, and (per
 * PUBLIC_WEBSITE_SITEMAP.md) the tier that doubles as "solutions by
 * industry" rather than a separate, thinner /solutions/* section.
 *
 * UI/UX revamp - each template renders as a CampaignPanel (icon+title
 * on one row, tag below, then detail - not three stacked lines before
 * even reaching the detail copy), not a plain bordered Card.
 */
function CampaignsIndexPage() {
  return (
    <PublicLayout>
      <SeoHead
        path="/campaigns"
        title="Campaign Templates"
        description="Ten ready-made campaign templates for insurance, solar, real estate, support, collections, and appointment-setting operations - each with its own real fields, workflow, and reporting."
      />
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Grid container spacing={5} alignItems="center" sx={{ mb: 5 }}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={1.5} sx={{ maxWidth: 760 }} className="fade-up">
              <Chip label="Campaign Templates" color="secondary" sx={{ alignSelf: "flex-start" }} />
              <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
                Built For How Your Industry Actually Sells
              </Typography>
              <Typography variant="h6" component="p" color="text.secondary" fontWeight={400}>
                Ten real templates, each with its own fields, workflow, and reporting - a starting point you can
                reconfigure completely, not a locked-in mold.
              </Typography>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: "flex", justifyContent: "center" }} className="fade-up">
            <Illustration src={ILLUSTRATIONS.campaignsHub} alt="Ten industry campaign templates arranged around one wheel" maxWidth={280} />
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {CAMPAIGNS.map((campaign) => {
            const Icon = campaign.icon;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={campaign.slug} className="fade-up">
                <CampaignPanel
                  to={`/campaigns/${campaign.slug}`}
                  icon={<Icon color="primary" />}
                  eyebrow={campaign.eyebrow}
                  title={campaign.title}
                  detail={campaign.heroSubhead}
                />
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </PublicLayout>
  );
}

export default CampaignsIndexPage;
