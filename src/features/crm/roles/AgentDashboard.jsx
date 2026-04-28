import { useState } from "react";
import { Box, Card, CardContent, Stack, Tab, Tabs, Typography } from "@mui/material";

function TabPanel({ value, index, children }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

function AgentDashboard({ session }) {
  const [tab, setTab] = useState(0);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">Agent Workspace</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: "1px solid #ead8c4" }}>
        <Tab label="Dashboard" />
        <Tab label="My Leads" />
        <Tab label="Settings" />
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Overview</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Daily summary, task prompts, and performance metrics will appear here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">My Leads</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Your assigned lead queue, call outcomes, and follow-up schedule will appear here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Notification preferences and profile settings will appear here.
            </Typography>
          </CardContent>
        </Card>
      </TabPanel>
    </Stack>
  );
}

export default AgentDashboard;