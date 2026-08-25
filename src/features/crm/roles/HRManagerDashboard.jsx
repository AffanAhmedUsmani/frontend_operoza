import { useEffect, useState } from "react";
import { Box, Button, Card, CardContent, Stack, Typography } from "@mui/material";
import AttendancePanel from "../components/AttendancePanel";
import ReportsPanel from "../components/reports/ReportsPanel";
import TimesheetsPanel from "../components/TimesheetsPanel";
import PayrollPanel from "../components/PayrollPanel";
import HRDeductionOverviewPanel from "../components/HRDeductionOverviewPanel";
import MessagingPanel from "../../messaging/components/MessagingPanel";
import ComingSoonNotice from "../components/ComingSoonNotice";
import { fetchTenantUsers } from "../services/adminService";

const KNOWN_SECTIONS = ["Attendance", "Timesheets", "Payroll", "Messages", "Reports", "Settings"];

/**
 * Sprint 8 (docs/SPRINT_PLAN.md) - fixed the HR-002 duplicate-navigation
 * defect (its own internal <Tabs> bar, in addition to the sidebar), and a
 * second, more severe bug this component didn't even accept
 * activeNavLabel before - meaning every sidebar click (Attendance,
 * Timesheets, Settings) silently did nothing; the internal Tabs bar was
 * the only way to reach any panel. Also replaces the Timesheets
 * placeholder (HR-003, confirmed in HR_MANAGER_GUIDE.md's own acceptance
 * criteria) with a real, data-bound component.
 *
 * Also found while wiring Timesheets: `session.users` is never actually
 * populated anywhere in the auth flow - AttendancePanel's `users` prop
 * was always an empty array here, so every name would have rendered as
 * "Unknown Agent"/the raw UUID. Fetches the real tenant user list
 * directly instead (HR has VIEW access to users_roles per the
 * permission matrix, same endpoint TenantAdminDashboard already uses).
 */
function HRManagerDashboard({ session, activeNavLabel }) {
  const accessToken = session?.accessToken;
  const currentSection = activeNavLabel || "Attendance";
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (!accessToken) return;
    let cancelled = false;
    fetchTenantUsers(accessToken)
      .then((items) => { if (!cancelled) setUsers(items); })
      .catch(() => { /* AttendancePanel/TimesheetsPanel fall back to "Unknown Agent" per row */ });
    return () => { cancelled = true; };
  }, [accessToken]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">HR Manager Workspace</Typography>
      <Typography color="text.secondary">
        Attendance governance, timesheets, and reporting are grouped here so the HR team can work
        from one screen.
      </Typography>

      {currentSection === "Attendance" ? <AttendancePanel accessToken={accessToken} users={users} /> : null}

      {currentSection === "Timesheets" ? <TimesheetsPanel accessToken={accessToken} users={users} /> : null}

      {currentSection === "Payroll" ? (
        <Stack spacing={3}>
          <PayrollPanel accessToken={accessToken} role="hr_manager" />
          <HRDeductionOverviewPanel accessToken={accessToken} />
        </Stack>
      ) : null}

      {currentSection === "Messages" ? <MessagingPanel accessToken={accessToken} /> : null}

      {currentSection === "Reports" ? <ReportsPanel session={session} accessToken={accessToken} /> : null}

      {currentSection === "Settings" ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="h6">Settings</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {/* Sprint 10 (docs/SPRINT_PLAN.md) moved the docking-policy
                  read-only view (and cross-employee deduction counts)
                  onto the Payroll tab, alongside this role's own payroll
                  breakdown - it's HR-manager-visible now, just grouped
                  with the rest of payroll rather than under Settings. */}
              <ComingSoonNotice
                title="Leave approvals"
                description="Approve or reject leave requests directly from this workspace."
              />
              <ComingSoonNotice
                title="Holiday calendar"
                description="Maintain public holidays and blackout dates that affect attendance expectations."
              />
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {!KNOWN_SECTIONS.includes(currentSection) ? (
        <Card sx={{ border: "1px solid", borderColor: "divider" }}>
          <CardContent>
            <Typography variant="h6">HR Manager Workspace</Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Use the sidebar to navigate to a section.
            </Typography>
          </CardContent>
        </Card>
      ) : null}
    </Stack>
  );
}

export default HRManagerDashboard;
