import { Card, CardContent, Stack, Typography } from "@mui/material";
import AttendancePanel from "../components/AttendancePanel";
import CampaignsPanel from "../components/CampaignsPanel";
import ReportsPanel from "../components/reports/ReportsPanel";
import SalesPanel from "../components/SalesPanel";

function AgentDashboard({ session, activeNavLabel }) {
  const accessToken = session?.accessToken;
  const currentSection = activeNavLabel || "Attendance";

  return (
    <Stack spacing={2}>
      {currentSection === "Attendance" ? (
        <AttendancePanel accessToken={accessToken} />
      ) : null}

      {currentSection === "Campaigns" ? (
        <CampaignsPanel accessToken={accessToken} />
      ) : null}

      {currentSection === "Sales" ? (
        <SalesPanel accessToken={accessToken} />
      ) : null}

      {currentSection === "Reports" ? (
        <ReportsPanel session={session} accessToken={accessToken} />
      ) : null}

      {! ["Attendance", "Campaigns", "Sales", "Reports"].includes(currentSection) ? (
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="h6">Agent Workspace</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Use the sidebar to mark attendance, review assigned campaigns, and create your own sales.
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

export default AgentDashboard;