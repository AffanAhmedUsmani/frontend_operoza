import { useState } from "react";
import { Box, Card, CardContent, Stack, Tab, Tabs, Typography } from "@mui/material";

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

function ManagerDashboard({ session }) {
  const [tab, setTab] = useState(0);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Manager Workspace</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #ead8c4" }}>
        <Tab label="Dashboard" />
        <Tab label="My Team" />
        <Tab label="Pipeline" />
        <Tab label="Settings" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Overview</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Campaign oversight, team performance, and daily reporting will appear here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">My Team</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Team member list, attendance, and performance breakdown will appear here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Pipeline</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Active pipelines, deal stages, and follow-up quality view will appear here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Team configuration and notification settings will appear here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Stack>
  );
}

export default ManagerDashboard;