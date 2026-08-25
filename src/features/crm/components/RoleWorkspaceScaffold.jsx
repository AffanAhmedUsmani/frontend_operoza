import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

function RoleWorkspaceScaffold({ title, subtitle, tabs, quickActions, kpiCards, activeNavLabel }) {
  const safeTabs = useMemo(() => (Array.isArray(tabs) && tabs.length > 0 ? tabs : ["Overview"]), [tabs]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!activeNavLabel) {
      return;
    }
    if (activeNavLabel === "Dashboard") {
      setActiveTab(0);
      return;
    }
    const matchingIndex = safeTabs.findIndex((label) => label === activeNavLabel);
    if (matchingIndex >= 0) {
      setActiveTab(matchingIndex);
    }
  }, [activeNavLabel, safeTabs]);

  return (
    <Stack spacing={3}>
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h5">{title}</Typography>
            <Typography color="text.secondary">{subtitle}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ pt: 1 }}>
              {quickActions.map((actionLabel) => (
                <Button key={actionLabel} variant="outlined" size="small" sx={{ borderColor: "primary.light", color: "primary.dark" }}>
                  {actionLabel}
                </Button>
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ borderBottom: "1px solid", borderBottomColor: "divider" }}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        {safeTabs.map((label) => (
          <Tab key={label} label={label} />
        ))}
      </Tabs>

      <Grid container spacing={2}>
        {kpiCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <Card sx={{ border: "1px solid", borderColor: "divider", height: "100%" }}>
              <CardContent>
                <Stack spacing={1}>
                  <Typography variant="body2" color="text.secondary">{card.title}</Typography>
                  <Typography variant="h5">{card.value}</Typography>
                  <Chip label={card.trend} color={card.trend.startsWith("+") ? "success" : "warning"} size="small" sx={{ width: "fit-content" }} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1 }}>{safeTabs[activeTab]} Focus</Typography>
          <Typography color="text.secondary">
            This section is prepared for {safeTabs[activeTab].toLowerCase()} workflows with role-specific actions and data integrations.
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default RoleWorkspaceScaffold;
