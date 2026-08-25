import { Box, Card, CardContent, Chip, Stack, Typography } from "@mui/material";
import DashboardViewer from "./DashboardViewer";

function AssignedDashboardWorkspace({ session, dashboard, role }) {
  const accessToken = session?.accessToken;

  if (!dashboard) {
    return null;
  }

  return (
    <Stack spacing={2}>
      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Stack spacing={1}>
            <Typography variant="h5" fontWeight={700}>
              {dashboard.name}
            </Typography>
            <Typography color="text.secondary">
              Assigned dashboard view. Widgets below reflect the configuration created by your admin or team lead.
            </Typography>
            <Box>
              <Chip
                size="small"
                label={dashboard.campaign_name ? `Campaign ${dashboard.campaign_name}` : `Campaign ${dashboard.campaign_id}`}
                sx={{ bgcolor: "brand.subtle", color: "primary.dark" }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <DashboardViewer
        accessToken={accessToken}
        dashboard={dashboard}
        actorRole={role}
        canEdit={false}
      />
    </Stack>
  );
}

export default AssignedDashboardWorkspace;
