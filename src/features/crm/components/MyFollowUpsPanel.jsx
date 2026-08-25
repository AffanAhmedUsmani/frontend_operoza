import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { fetchFollowUpTasks, markFollowUpTaskDone, snoozeFollowUpTask } from "../services/followUpService";
import { fetchTenantUsers } from "../services/adminService";

const STATUS_COLORS = {
  pending: "default",
  overdue: "error",
  done: "success",
  snoozed: "info",
};

function bucketFor(task) {
  if (task.status_code === "overdue") return "overdue";
  if (task.status_code !== "pending") return "other";
  const dueDate = new Date(task.due_at);
  const today = new Date();
  const isToday = dueDate.toDateString() === today.toDateString();
  return isToday ? "today" : dueDate < today ? "overdue" : "upcoming";
}

/**
 * Sprint 12 (docs/SPRINT_PLAN.md), Agent guide §5 - "My Follow-ups"
 * (today, overdue, upcoming) for campaigns with follow-ups enabled.
 * `showEmployeeColumn` lets TeamFollowUpsPanel (Team Lead's rolled-up
 * view) reuse this exact component instead of duplicating the table.
 */
export default function MyFollowUpsPanel({ accessToken, showEmployeeColumn = false, title = "My Follow-Ups" }) {
  const [tasks, setTasks] = useState([]);
  const [usersById, setUsersById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const items = await fetchFollowUpTasks(accessToken);
      setTasks(items);
    } catch (err) {
      setError(err.message || "Unable to load follow-ups.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !showEmployeeColumn) return;
    fetchTenantUsers(accessToken)
      .then((items) => {
        const map = {};
        items.forEach((u) => { map[u.user_id] = u.display_name; });
        setUsersById(map);
      })
      .catch(() => {});
  }, [accessToken, showEmployeeColumn]);

  const handleMarkDone = async (taskId) => {
    setActionError("");
    try {
      const updated = await markFollowUpTaskDone(accessToken, taskId);
      setTasks((prev) => prev.map((t) => (t.follow_up_task_id === taskId ? updated : t)));
    } catch (err) {
      setActionError(err.message || "Unable to mark as done.");
    }
  };

  const handleSnooze = async (task) => {
    const nextDue = new Date(task.due_at);
    nextDue.setDate(nextDue.getDate() + 1);
    setActionError("");
    try {
      const updated = await snoozeFollowUpTask(accessToken, task.follow_up_task_id, nextDue.toISOString());
      setTasks((prev) => prev.map((t) => (t.follow_up_task_id === task.follow_up_task_id ? updated : t)));
    } catch (err) {
      setActionError(err.message || "Unable to snooze.");
    }
  };

  const openTasks = tasks.filter((t) => t.status_code !== "done");
  const overdue = openTasks.filter((t) => bucketFor(t) === "overdue");
  const today = openTasks.filter((t) => bucketFor(t) === "today");
  const upcoming = openTasks.filter((t) => bucketFor(t) === "upcoming");

  const renderGroup = (label, items) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>{label} ({items.length})</Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Nothing here.</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {showEmployeeColumn ? <TableCell>Assigned To</TableCell> : null}
                <TableCell>Campaign</TableCell>
                <TableCell>Note</TableCell>
                <TableCell>Due</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((task) => (
                <TableRow key={task.follow_up_task_id} hover>
                  {showEmployeeColumn ? (
                    <TableCell>{usersById[task.assigned_to_user_id] || task.assigned_to_user_id}</TableCell>
                  ) : null}
                  <TableCell>{task.campaign_name}</TableCell>
                  <TableCell>{task.note || "—"}</TableCell>
                  <TableCell>{new Date(task.due_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip size="small" label={task.status_code} color={STATUS_COLORS[task.status_code] || "default"} />
                  </TableCell>
                  <TableCell align="center">
                    {!showEmployeeColumn ? (
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Button size="small" onClick={() => handleMarkDone(task.follow_up_task_id)}>Done</Button>
                        <Button size="small" onClick={() => handleSnooze(task)}>Snooze 1d</Button>
                      </Stack>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  return (
    <Card sx={{ border: "1px solid", borderColor: "divider" }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 0.5 }}>{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Only campaigns with follow-ups enabled ever produce tasks here - nothing is scheduled automatically.
        </Typography>

        {error ? <Alert severity="error" sx={{ mb: 2 }} action={<Button size="small" onClick={load}>Retry</Button>}>{error}</Alert> : null}
        {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}

        {loading ? (
          <Stack alignItems="center" sx={{ py: 4 }}><CircularProgress /></Stack>
        ) : tasks.length === 0 ? (
          <Typography color="text.secondary">No follow-ups yet.</Typography>
        ) : (
          <>
            {renderGroup("Overdue", overdue)}
            {renderGroup("Today", today)}
            {renderGroup("Upcoming", upcoming)}
          </>
        )}
      </CardContent>
    </Card>
  );
}
