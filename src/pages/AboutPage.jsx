import { Button, Card, CardContent, Chip, Container, Grid, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

import PublicLayout from "../components/PublicLayout";
import SeoHead from "../components/SeoHead";

function AboutPage() {
  return (
    <PublicLayout>
      <SeoHead
        path="/about"
        title="About"
        description="Operoza exists because BPOs run on campaigns, agents, clients, and operational reporting - not the generic sales pipeline most CRMs are built around."
      />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, position: "relative", zIndex: 2 }}>
        <Stack spacing={1.5} sx={{ mb: 5 }} className="fade-up">
          <Chip label="About Operoza" color="secondary" sx={{ alignSelf: "flex-start" }} />
          <Typography variant="h1" sx={{ fontSize: { xs: "2rem", md: "2.8rem" } }}>
            Built Around How a Call Center Actually Runs
          </Typography>
        </Stack>

        <Stack spacing={3} className="fade-up">
          <Typography variant="h6" component="p" fontWeight={400} color="text.secondary">
            Most CRMs are built for a generic sales pipeline: a deal moves through stages until it
            closes. That model doesn't match how a BPO actually operates.
          </Typography>
          <Typography color="text.secondary">
            Inside a call center, work is organized differently: a <strong>Campaign</strong> (a
            line of business - "Auto Insurance," "Solar Sales") contains <strong>Leads</strong>{" "}
            that convert into <strong>Sales</strong>, tied to an agent's <strong>Attendance</strong>{" "}
            on a shift, feeding into <strong>Payroll and Commission</strong>, all visible through{" "}
            <strong>Reports and Dashboards</strong> scoped to whoever is allowed to see them - an
            Admin, a Team Lead running the floor, an Agent working their own leads, an HR Manager
            handling attendance policy, or a Client watching campaign performance from the outside.
          </Typography>
          <Typography color="text.secondary">
            Operoza is built directly around that shape, rather than adapting a generic pipeline to
            fit it. Campaigns are configurable - built from templates or from scratch - so a
            medical insurance campaign and a solar sales campaign can track completely different
            fields and reports without needing separate software.
          </Typography>
          <Typography color="text.secondary">
            It's a guided, configurable product, not a blank no-code builder: campaigns are built
            from admin choices - templates, form fields, pipeline stages - not free-form scripting.
            That keeps it usable by an operations team, not just a developer.
          </Typography>
        </Stack>

        <Card sx={{ p: { xs: 3, md: 4 }, border: "1px solid", borderColor: "divider", my: 5 }} className="fade-up">
          <Grid container spacing={3}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="h4" fontWeight={800}>5</Typography>
              <Typography variant="body2" color="text.secondary">Roles, each with a clear mandate</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="h4" fontWeight={800}>10</Typography>
              <Typography variant="body2" color="text.secondary">Ready-made campaign templates</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="h4" fontWeight={800}>10</Typography>
              <Typography variant="body2" color="text.secondary">Dashboard templates out of the box</Typography>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Typography variant="h4" fontWeight={800}>1</Typography>
              <Typography variant="body2" color="text.secondary">Platform for the whole operation</Typography>
            </Grid>
          </Grid>
        </Card>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button component={Link} to="/start" variant="contained" size="large">
            Start Free
          </Button>
          <Button component={Link} to="/pricing" variant="outlined" size="large">
            See Pricing
          </Button>
        </Stack>
      </Container>
    </PublicLayout>
  );
}

export default AboutPage;
