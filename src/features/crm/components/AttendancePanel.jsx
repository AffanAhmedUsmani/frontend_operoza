import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

import {
  checkIn,
  checkOut,
  exportAttendanceCsv,
  fetchAttendanceReport,
} from "../services/attendanceService";
import { resolveActorContext, ADMIN_ROLES } from "./sales/salesFormUtils";

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

function prettyDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString();
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

    try {
      const attendance = await checkIn(accessToken, selectedUserId ? { user_id: selectedUserId } : {});
      if (attendance?.attendance_id) {
        setHighlightAttendanceId(attendance.attendance_id);
      }
      setSuccess("Check-in recorded successfully.");
      await loadReport();
    } catch (err) {
      if (err?.status === 409) {
        const existingAttendance = err?.attendance;
        if (existingAttendance?.attendance_id) {
          setHighlightAttendanceId(existingAttendance.attendance_id);
        }
        setWarning("You are already checked in. Latest active attendance is highlighted.");
        await loadReport();
        return;
      }
      setError(err.message || "Check-in failed.");
    }
  };

  const handleCheckOut = async () => {
    if (!accessToken) return;
    setError("");
    setSuccess("");
    setWarning("");

    try {
      const attendance = await checkOut(accessToken, {
        user_id: selectedUserId || undefined,
        work_date: filters.endDate || undefined,
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

      <Card sx={{ border: "1px solid #ead8c4" }}>
        <CardContent>
          <Typography variant="h6">Latest Attendance Event</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Type: {latestEventType} | Time: {prettyDateTime(latestEventAt)}
          </Typography>
          <Typography color="text.secondary">
            Date: {latestRow?.work_date || "-"} | Status: {latestRow?.status_code || "-"}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid #ead8c4" }}>
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

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button variant="contained" onClick={handleCheckIn} disabled={loading}>Check In</Button>
            <Button variant="contained" color="warning" onClick={handleCheckOut} disabled={loading}>Check Out</Button>
            <Button variant="text" onClick={handleExportCsv} disabled={loading}>Export CSV</Button>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ border: "1px solid #ead8c4" }}>
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

      <Card sx={{ border: "1px solid #ead8c4" }}>
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
                </TableRow>
              </TableHead>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7}>
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
                        <TableCell>{prettyDateTime(row.check_in_at)}</TableCell>
                        <TableCell>{prettyDateTime(row.check_out_at)}</TableCell>
                        <TableCell>{row.total_minutes || 0}</TableCell>
                        <TableCell>{minutesToHours(row.total_minutes)}</TableCell>
                        <TableCell>{row.status_code}</TableCell>
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
