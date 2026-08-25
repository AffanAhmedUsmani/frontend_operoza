import { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, LinearProgress, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { MdCheckCircle, MdRadioButtonUnchecked } from "react-icons/md";

import { fetchDashboards } from "../services/dashboardService";
import { listReports } from "../services/reportingService";

const DISMISS_KEY = "operoza-getting-started-dismissed";

/**
 * Sprint 19 (docs/SPRINT_PLAN.md) - the static, always-on, unmetered
 * in-app guidance layer's "guided step-by-step checklist for a tenant's
 * first campaign, first dashboard, and first report." No prior
 * onboarding-checklist pattern existed in this codebase to reuse (the
 * sprint plan's premise didn't hold up against the actual code), so this
 * is a new, deliberately simple component - three steps, done/not-done,
 * a jump-to-tab action, dismissible once complete or by choice.
 */
export default function GettingStartedChecklist({ accessToken, campaignCount = 0, onNavigate }) {
  const theme = useTheme();
  const [dashboardCount, setDashboardCount] = useState(null);
  const [reportCount, setReportCount] = useState(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "1");

  useEffect(() => {
    if (!accessToken || dismissed) return;
    let cancelled = false;
    Promise.all([
      fetchDashboards(accessToken).catch(() => []),
      listReports(accessToken).catch(() => []),
    ]).then(([dashboards, reports]) => {
      if (cancelled) return;
      setDashboardCount(Array.isArray(dashboards) ? dashboards.length : 0);
      setReportCount(Array.isArray(reports) ? reports.length : 0);
    });
    return () => {
      cancelled = true;
    };
  }, [accessToken, dismissed]);

  if (dismissed) return null;

  const steps = [
    { label: "Create your first campaign", done: campaignCount > 0, tabIndex: 2 },
    { label: "Build your first dashboard", done: (dashboardCount ?? 0) > 0, tabIndex: 6 },
    { label: "Create your first report", done: (reportCount ?? 0) > 0, tabIndex: 5 },
  ];
  const loading = dashboardCount === null || reportCount === null;
  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <Alert
      severity={allDone ? "success" : "info"}
      onClose={handleDismiss}
      sx={{ "& .MuiAlert-message": { width: "100%" } }}
    >
      <Stack spacing={1.25} sx={{ width: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2" fontWeight={700}>
            {allDone ? "You're all set!" : "Getting started"}
          </Typography>
          <Chip size="small" label={`${doneCount}/${steps.length}`} />
        </Stack>
        {loading ? <LinearProgress sx={{ borderRadius: 4 }} /> : null}
        {!loading &&
          steps.map((step) => (
            <Stack key={step.label} direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                {step.done ? (
                  <MdCheckCircle color={theme.palette.success.main} size={18} />
                ) : (
                  <MdRadioButtonUnchecked color={theme.palette.text.disabled} size={18} />
                )}
                <Typography variant="body2" sx={{ textDecoration: step.done ? "line-through" : "none" }}>
                  {step.label}
                </Typography>
              </Stack>
              {!step.done ? (
                <Button size="small" onClick={() => onNavigate?.(step.tabIndex)}>
                  Go
                </Button>
              ) : null}
            </Stack>
          ))}
      </Stack>
    </Alert>
  );
}
