import { useState } from "react";
import { Box, Card, CardContent, Chip, Grid, Stack, Tab, Tabs, Typography } from "@mui/material";
import DashboardsPanel from "../components/dashboard/DashboardsPanel";
import CampaignsPanel from "../components/CampaignsPanel";
import SalesPanel from "../components/SalesPanel";
import { useCampaigns } from "../hooks/useCampaigns";

const TAB_MAP = { Dashboard: 0, Campaigns: 1, Sales: 2, "My Team": 3, Dashboards: 4, Settings: 5 };

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function TeamLeadDashboard({ session, activeNavLabel }) {
  const accessToken = session?.accessToken;
  const [tab, setTab] = useState(0);
  const { campaigns } = useCampaigns(accessToken);

  const handleNav = (label) => {
    if (TAB_MAP[label] !== undefined) setTab(TAB_MAP[label]);
  };

  // Sync sidebar nav → tab
  if (activeNavLabel && TAB_MAP[activeNavLabel] !== undefined && TAB_MAP[activeNavLabel] !== tab) {
    setTab(TAB_MAP[activeNavLabel]);
  }

  return (
    <Stack spacing={2}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: "1px solid #ead8c4" }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Team Lead workspace sections"
      >
        {Object.keys(TAB_MAP).map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Grid container spacing={2}>
          {[
            { title: "Team Conversion", value: "18.9%", trend: "+1.2%" },
            { title: "Leads in Follow-up", value: "312", trend: "+27 today" },
            { title: "Coaching Due", value: "14", trend: "-3 completed" },
          ].map((card) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <Card sx={{ border: "1px solid #ead8c4" }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">{card.title}</Typography>
                  <Typography variant="h5">{card.value}</Typography>
                  <Chip label={card.trend} color={card.trend.startsWith("+") ? "success" : "warning"} size="small" sx={{ mt: 0.5 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <CampaignsPanel session={session} />
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <SalesPanel session={session} />
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">My Team</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Agent activity, coaching notes, and SLA tracking will appear here.</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={4}>
        <DashboardsPanel accessToken={accessToken} role="team_lead" campaigns={campaigns} />
      </TabPanel>

      <TabPanel value={tab} index={5}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Notification preferences and profile settings will appear here.</Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Stack>
  );
}

export default TeamLeadDashboard;
