import { Card, CardContent, Stack, Typography } from "@mui/material";
import DashboardsPanel from "../components/dashboard/DashboardsPanel";
import CampaignsPanel from "../components/CampaignsPanel";
import SalesPanel from "../components/SalesPanel";
import ReportsPanel from "../components/reports/ReportsPanel";
import MyTeamPanel from "../components/MyTeamPanel";
import MyFollowUpsPanel from "../components/MyFollowUpsPanel";
import PayrollPanel from "../components/PayrollPanel";
import MessagingPanel from "../../messaging/components/MessagingPanel";
import ComingSoonNotice from "../components/ComingSoonNotice";
import { useCampaigns } from "../hooks/useCampaigns";

const KNOWN_SECTIONS = ["Dashboard", "Campaigns", "Sales", "Reports", "My Team", "Dashboards", "Payroll", "Follow-Ups", "Messages", "Settings"];

/**
 * Sprint 8 (docs/SPRINT_PLAN.md) - fixed the TL-002 duplicate-navigation
 * defect: this used to render its own internal <Tabs> bar in addition to
 * the sidebar (TenantCrmLayout.jsx), two navigation surfaces controlling
 * the same state. Now driven purely by activeNavLabel, matching
 * AgentDashboard's already-correct pattern - exactly one nav surface.
 * "Dashboard" and "My Team" also used to show fixed fake numbers with no
 * fetch behind them (general guide §15.7); "My Team" is now real
 * (MyTeamPanel), "Dashboard" is an honest landing card since no
 * conversion/follow-up backend exists yet (FollowUpTask is Sprint 12).
 */
function TeamLeadDashboard({ session, activeNavLabel }) {
  const accessToken = session?.accessToken;
  const currentSection = activeNavLabel || "Dashboard";
  const { campaigns } = useCampaigns(accessToken);

  return (
    <Stack spacing={2}>
      {currentSection === "Dashboard" ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="h6">Team Lead Workspace</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Use the sidebar to review campaigns, sales, and reports, or check My Team for your
              current agent roster.
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {currentSection === "Campaigns" ? <CampaignsPanel session={session} /> : null}

      {currentSection === "Sales" ? <SalesPanel accessToken={accessToken} /> : null}

      {currentSection === "Reports" ? <ReportsPanel session={session} accessToken={accessToken} /> : null}

      {currentSection === "My Team" ? <MyTeamPanel accessToken={accessToken} /> : null}

      {currentSection === "Dashboards" ? (
        <DashboardsPanel accessToken={accessToken} role="team_lead" campaigns={campaigns} />
      ) : null}

      {currentSection === "Payroll" ? <PayrollPanel accessToken={accessToken} role="team_lead" /> : null}

      {currentSection === "Follow-Ups" ? (
        <MyFollowUpsPanel accessToken={accessToken} showEmployeeColumn title="Team Follow-Ups" />
      ) : null}

      {currentSection === "Messages" ? <MessagingPanel accessToken={accessToken} /> : null}

      {currentSection === "Settings" ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <ComingSoonNotice
                title="Notifications"
                description="Route coaching alerts, escalation notices, and SLA warnings to the correct channel."
                sprint="Sprint 11"
              />
              <ComingSoonNotice
                title="Team visibility"
                description="Fine-tune which team members and dashboards are surfaced in this workspace."
              />
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {!KNOWN_SECTIONS.includes(currentSection) ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="h6">Team Lead Workspace</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Use the sidebar to navigate to a section.
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

export default TeamLeadDashboard;
