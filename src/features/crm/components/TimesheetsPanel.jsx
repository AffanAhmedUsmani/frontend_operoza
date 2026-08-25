import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
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
import { fetchAttendanceReport } from "../services/attendanceService";

function monthStartIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function monthEndIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
}

/**
 * Sprint 8 (docs/SPRINT_PLAN.md) - a real, data-bound Timesheets screen
 * for HR Manager, replacing a static placeholder ("Timesheet review is
 * connected to attendance records... use the attendance tab" - HR-003,
 * confirmed defect per HR_MANAGER_GUIDE.md's own acceptance criteria).
 * Reuses the existing attendance report endpoint - no new backend needed -
 * aggregated per user into total hours worked, exactly what a timesheet
 * is, rather than the day-by-day session list AttendancePanel already
 * shows.
 */
export default function TimesheetsPanel({ accessToken, users = [] }) {
  const [filters, setFilters] = useState({ startDate: monthStartIso(), endDate: monthEndIso() });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchAttendanceReport(accessToken, filters);
      setItems(data.items);
    } catch (err) {
      setError(err.message || "Failed to load timesheet data.");
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [accessToken, filters.startDate, filters.endDate]);

  useEffect(() => {
    load();
  }, [load]);

  const perUserTotals = useMemo(() => {
    const totals = new Map();
    for (const item of items) {
      const key = String(item.user_id);
      const existing = totals.get(key) || { userId: item.user_id, minutes: 0, sessions: 0, lateDays: 0, absentDays: 0 };
      existing.minutes += Number(item.total_minutes || 0);
      existing.sessions += 1;
      if (item.exception_type === "late") existing.lateDays += 1;
      if (item.exception_type === "absent") existing.absentDays += 1;
      totals.set(key, existing);
    }
    return Array.from(totals.values()).sort((a, b) => b.minutes - a.minutes);
  }, [items]);

  const nameFor = (userId) => users.find((u) => String(u.user_id) === String(userId))?.display_name || "Unknown Agent";

  return (
    <Stack spacing={2.5}>
      {error ? <Alert severity="error">{error}</Alert> : null}

      <Card sx={{ border: "1px solid", borderColor: "divider" }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Timesheets</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1.5, mb: 2 }}>
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
            <Button variant="outlined" onClick={load} disabled={loading} sx={{ height: "100%" }}>
              {loading ? "Loading..." : "Refresh"}
            </Button>
          </Box>

          {loading ? (
            <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress size={28} /></Stack>
          ) : loaded && perUserTotals.length === 0 ? (
            <Typography color="text.secondary">No attendance records found for this period.</Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Sessions</TableCell>
                    <TableCell>Total Hours</TableCell>
                    <TableCell>Late Days</TableCell>
                    <TableCell>Absent Days</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {perUserTotals.map((row) => (
                    <TableRow key={row.userId} hover>
                      <TableCell>{nameFor(row.userId)}</TableCell>
                      <TableCell>{row.sessions}</TableCell>
                      <TableCell>{(row.minutes / 60).toFixed(2)}</TableCell>
                      <TableCell>{row.lateDays}</TableCell>
                      <TableCell>{row.absentDays}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
