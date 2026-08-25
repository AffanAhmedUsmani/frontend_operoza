import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  checkIn,
  checkOut,
  exportAttendanceCsv,
  fetchAttendanceReport,
} from "../services/attendanceService";
import { useCampaigns } from "../hooks/useCampaigns";
import { resolveActorContext, ADMIN_ROLES } from "./sales/salesFormUtils";

// Sprint 5 (docs/SPRINT_PLAN.md) - one message per check-in rejection code,
// matching the specific-reason contract the 3-stage backend validation
// (campaign assignment -> shift window -> IP allowlist) guarantees.
const CHECK_IN_ERROR_MESSAGES = {
  not_assigned: "You are not assigned to any campaign - contact your admin.",
  shift_window_closed: "Too late to check in for this shift - contact your manager.",
  shift_ended: "Shift for this campaign has already ended for today.",
  ip_blocked: "Access blocked: your current network is not authorized for this shift.",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function monthEndIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
}

dayjs.extend(utc);
dayjs.extend(timezone);

// Sprint 5 (docs/SPRINT_PLAN.md) - a check-in's "on time"/"late"
// classification is decided server-side against the campaign's
// configured shift_timezone_code (general guide §9), so displaying that
// same timestamp in the viewer's browser-local time here would show a
// different, potentially confusing hour. When the row's campaign has a
// known timezone, render in that timezone (labelled) instead of relying
// on the browser's local one.
function prettyDateTime(value, timezoneCode) {
  if (!value) return "-";
  const parsed = dayjs(value);
  if (!parsed.isValid()) return String(value);
  if (timezoneCode) {
    return `${parsed.tz(timezoneCode).format("YYYY-MM-DD HH:mm")} (${timezoneCode})`;
  }
  return parsed.format("YYYY-MM-DD HH:mm:ss");
}

function minutesToHours(value) {
  const minutes = Number(value || 0);
  return (minutes / 60).toFixed(2);
}

export default function AttendancePanel({ accessToken, users = [] }) {
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [warning, setWarning] = useState("");
  const [highlightAttendanceId, setHighlightAttendanceId] = useState("");

  const actor = useMemo(() => resolveActorContext(accessToken), [accessToken]);
  const actorUserId = actor.userId;
  const role = actor.role;
  const isAdmin = ADMIN_ROLES.has(role);

  const [filters, setFilters] = useState({
    startDate: monthStartIso(),
    endDate: monthEndIso(),
    userId: "",
  });

  const selectedUserId = isAdmin ? filters.userId : actorUserId;

  // Sprint 5: only needed to resolve which campaign's shift a check-in
  // belongs to when the agent has more than one assignment - most agents
  // have exactly one, and the backend auto-resolves that case without any
  // of this ever needing to render.
  const { campaigns } = useCampaigns(accessToken);
  const [checkInCampaignId, setCheckInCampaignId] = useState("");
  const [needsCampaignChoice, setNeedsCampaignChoice] = useState(false);

  const campaignTimezoneById = useMemo(() => {
    const map = {};
    for (const c of campaigns) {
      if (c.shift_timezone_code) map[c.campaign_id] = c.shift_timezone_code;
    }
    return map;
  }, [campaigns]);

  const loadReport = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");

    try {
      const data = await fetchAttendanceReport(accessToken, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: selectedUserId,
      });
      setItems(data.items);
      setSummary(data.summary);
    } catch (err) {
      setError(err.message || "Failed to load attendance report.");
    } finally {
      setLoading(false);
    }
  }, [accessToken, filters.endDate, filters.startDate, selectedUserId]);

  useEffect(() => {
    if (!accessToken) return;
    loadReport();
  }, [accessToken, loadReport]);

  useEffect(() => {
    if (!highlightAttendanceId) return;
    const timer = setTimeout(() => setHighlightAttendanceId(""), 1600);
    return () => clearTimeout(timer);
  }, [highlightAttendanceId]);

  const latestRow = items.length > 0 ? items[0] : null;
  const latestEventType = latestRow
    ? latestRow.status_code === "checked_in" && !latestRow.check_out_at
      ? "Checked In"
      : "Checked Out"
    : "-";
  const latestEventAt = latestRow
    ? latestRow.status_code === "checked_in" && !latestRow.check_out_at
      ? latestRow.check_in_at
      : latestRow.check_out_at || latestRow.check_in_at
    : null;

  const handleCheckIn = async () => {
    if (!accessToken) return;
    setError("");
    setSuccess("");
    setWarning("");

    const payload = selectedUserId ? { user_id: selectedUserId } : {};
    if (checkInCampaignId) {
      payload.campaign_id = checkInCampaignId;
    }

    try {
      const attendance = await checkIn(accessToken, payload);
      if (attendance?.attendance_id) {
        setHighlightAttendanceId(attendance.attendance_id);
      }
      setNeedsCampaignChoice(false);
      const isLate = attendance?.exception_type === "late";
      setSuccess(
        isLate
          ? `Check-in recorded, marked late: ${attendance.exception_note}`
          : "Check-in recorded successfully."
      );
      await loadReport();
    } catch (err) {
      if (err?.status === 409) {
        const existingAttendance = err?.data?.attendance;
        if (existingAttendance?.attendance_id) {
          setHighlightAttendanceId(existingAttendance.attendance_id);
        }
        setWarning("You are already checked in. Latest active attendance is highlighted.");
        await loadReport();
        return;
      }
      const code = err?.data?.code;
      if (code === "ambiguous_campaign") {
        setNeedsCampaignChoice(true);
        setError("You're assigned to multiple campaigns - choose which one you're checking into.");
        return;
      }
      setError(CHECK_IN_ERROR_MESSAGES[code] || err.message || "Check-in failed.");
    }
  };

  const handleCheckOut = async () => {
    if (!accessToken) return;
    setError("");
    setSuccess("");
    setWarning("");

    try {
      // work_date is intentionally omitted: this button always means
      // "close my current open session", not "close a session for some
      // specific historical date" - the backend already resolves that as
      // the most recent open check-in with no filter at all. Passing the
      // report filter's end-date here (a real bug this E2E test caught)
      // meant check-out 404'd on every day except the last day of the
      // displayed month, since that end-date almost never equals today.
      const attendance = await checkOut(accessToken, {
        user_id: selectedUserId || undefined,
      });
      if (attendance?.attendance_id) {
        setHighlightAttendanceId(attendance.attendance_id);
      }
      setSuccess("Check-out recorded successfully.");
      await loadReport();
    } catch (err) {
      setError(err.message || "Check-out failed.");
    }
  };

  const handleExportCsv = async () => {
    setError("");
    try {
      const csvText = await exportAttendanceCsv(accessToken, {
        startDate: filters.startDate,
        endDate: filters.endDate,
        userId: selectedUserId,
      });
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = "attendance_report.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(href);
    } catch (err) {
      setError(err.message || "CSV export failed.");
    }
  };

  return (
    <Stack spacing={2.5}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {success ? <Alert severity="success">{success}</Alert> : null}
      {warning ? <Alert severity="warning">{warning}</Alert> : null}

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6">Latest Attendance Event</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Type: {latestEventType} | Time: {prettyDateTime(latestEventAt, campaignTimezoneById[latestRow?.campaign_id])}
          </Typography>
          <Typography color="text.secondary">
            Date: {latestRow?.work_date || "-"} | Status: {latestRow?.status_code || "-"}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Attendance Controls</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(4, minmax(0, 1fr))" },
              gap: 1.5,
              mb: 1.5,
            }}
          >
            <TextField
              label="Start date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            {isAdmin ? (
              <TextField
                label="User"
                select
                value={filters.userId}
                onChange={(e) => setFilters((prev) => ({ ...prev, userId: e.target.value }))}
                fullWidth
              >
                <MenuItem value="">All users</MenuItem>
                {users.map((u) => (
                  <MenuItem key={u.user_id} value={u.user_id}>{u.display_name || u.email}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField label="User" value="Current user" fullWidth disabled />
            )}
            <Button variant="outlined" onClick={loadReport} disabled={loading}>
              {loading ? "Loading..." : "Load Report"}
            </Button>
          </Box>

          {needsCampaignChoice ? (
            <TextField
              label="Which campaign are you checking into?"
              select
              value={checkInCampaignId}
              onChange={(e) => setCheckInCampaignId(e.target.value)}
              sx={{ mb: 1.5, minWidth: 260 }}
            >
              <MenuItem value="">Select a campaign</MenuItem>
              {campaigns.map((c) => (
                <MenuItem key={c.campaign_id} value={c.campaign_id}>{c.name}</MenuItem>
              ))}
            </TextField>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button
              variant="contained"
              onClick={handleCheckIn}
              disabled={loading || (needsCampaignChoice && !checkInCampaignId)}
            >
              Check In
            </Button>
            <Button variant="contained" color="secondary" onClick={handleCheckOut} disabled={loading}>Check Out</Button>
            <Button variant="text" onClick={handleExportCsv} disabled={loading}>Export CSV</Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6">Attendance Summary</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Total sessions: {summary.total_sessions || 0} | Completed: {summary.completed_sessions || 0} | Active check-ins: {summary.checked_in_sessions || 0}
          </Typography>
          <Typography color="text.secondary">
            Total minutes: {summary.total_minutes || 0} | Total hours: {summary.total_hours || 0}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Attendance Records</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Check-in</TableCell>
                  <TableCell>Check-out</TableCell>
                  <TableCell>Total Minutes</TableCell>
                  <TableCell>Total Hours</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Exception</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Typography color="text.secondary">No attendance records found for selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((row) => {
                    const name = users.find((u) => String(u.user_id) === String(row.user_id))?.display_name || row.user_id;
                    return (
                      <TableRow
                        key={row.attendance_id}
                        hover
                        sx={
                          row.attendance_id === highlightAttendanceId
                            ? {
                                bgcolor: "rgba(255, 193, 7, 0.16)",
                                animation: "attendanceFlash 0.85s ease-in-out 2",
                                "@keyframes attendanceFlash": {
                                  "0%": { transform: "scale(1)", boxShadow: "0 0 0 rgba(255, 193, 7, 0)" },
                                  "50%": { transform: "scale(1.01)", boxShadow: "0 0 0 2px rgba(255, 193, 7, 0.35)" },
                                  "100%": { transform: "scale(1)", boxShadow: "0 0 0 rgba(255, 193, 7, 0)" },
                                },
                              }
                            : undefined
                        }
                      >
                        <TableCell>{row.work_date}</TableCell>
                        <TableCell>{name}</TableCell>
                        <TableCell>{prettyDateTime(row.check_in_at, campaignTimezoneById[row.campaign_id])}</TableCell>
                        <TableCell>{prettyDateTime(row.check_out_at, campaignTimezoneById[row.campaign_id])}</TableCell>
                        <TableCell>{row.total_minutes || 0}</TableCell>
                        <TableCell>{minutesToHours(row.total_minutes)}</TableCell>
                        <TableCell>{row.status_code}</TableCell>
                        <TableCell>
                          {row.exception_type ? (
                            <Tooltip title={row.exception_note || ""}>
                              <Chip
                                label={row.exception_type.replace("_", " ")}
                                size="small"
                                color={row.exception_type.startsWith("approved") ? "success" : "warning"}
                              />
                            </Tooltip>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Stack>
  );
}
