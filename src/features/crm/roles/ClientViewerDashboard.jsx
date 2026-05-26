import { useState } from "react";
import { Box, Card, CardContent, Stack, Tab, Tabs, Typography } from "@mui/material";
import DashboardsPanel from "../components/dashboard/DashboardsPanel";
import ReportsPanel from "../components/reports/ReportsPanel";
import { useCampaigns } from "../hooks/useCampaigns";

const TAB_MAP = { Dashboard: 0, Campaigns: 1, Reports: 2, Dashboards: 3, Settings: 4 };

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 2 }}>{children}</Box> : null;
}

function ClientViewerDashboard({ session, activeNavLabel }) {
  const accessToken = session?.accessToken;
  const [tab, setTab] = useState(0);
  const { campaigns } = useCampaigns(accessToken);

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
        aria-label="Client workspace sections"
      >
        {Object.keys(TAB_MAP).map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Campaign Overview</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Campaign progress, delivered leads, and SLA status will appear here.</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Campaigns</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Read-only campaign details and milestones will appear here.</Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <ReportsPanel session={session} accessToken={accessToken} />
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <DashboardsPanel accessToken={accessToken} role="client" campaigns={campaigns} />
      </TabPanel>

      <TabPanel value={tab} index={4}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>Account preferences will appear here.</Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Stack>
  );
}

export default ClientViewerDashboard;
