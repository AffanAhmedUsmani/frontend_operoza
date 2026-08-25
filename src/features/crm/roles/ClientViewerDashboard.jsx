import { Card, CardContent, Stack, Typography } from "@mui/material";
import ClientCampaignsPanel from "../components/ClientCampaignsPanel";
import ReportsPanel from "../components/reports/ReportsPanel";
import ComingSoonNotice from "../components/ComingSoonNotice";

const KNOWN_SECTIONS = ["Campaigns", "Reports", "Settings"];

/**
 * Sprint 8 (docs/SPRINT_PLAN.md) - fixed the CL-001 duplicate-navigation
 * defect (its own internal <Tabs> bar, in addition to the sidebar).
 * "Dashboard" and "Dashboards" tabs are removed entirely: neither is a
 * real sidebar nav item for Client (TenantCrmLayout.jsx's NAV_MAP has no
 * "Dashboard"/"Dashboards" entry for this role - assigned dashboards are
 * their own per-dashboard nav items, handled by RoleDashboardSwitch
 * before this component ever renders), so they were unreachable via the
 * sidebar and only existed via the now-removed internal tab bar.
 * "Campaigns" is now a real read-only view (general guide §15.7) instead
 * of a stub pointing at other tabs.
 */
function ClientViewerDashboard({ session, activeNavLabel }) {
  const accessToken = session?.accessToken;
  const currentSection = activeNavLabel || "Campaigns";

  return (
    <Stack spacing={2}>
      {currentSection === "Campaigns" ? <ClientCampaignsPanel accessToken={accessToken} /> : null}

      {currentSection === "Reports" ? <ReportsPanel session={session} accessToken={accessToken} /> : null}

      {currentSection === "Settings" ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              <ComingSoonNotice
                title="Notifications"
                description="Configure client-facing status alerts and delivery summaries."
                sprint="Sprint 11"
              />
              <ComingSoonNotice
                title="Access"
                description="Manage who can view reports, dashboards, and exportable data."
              />
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {!KNOWN_SECTIONS.includes(currentSection) ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="h6">Client Workspace</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Use the sidebar to navigate to a section.
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

export default ClientViewerDashboard;
