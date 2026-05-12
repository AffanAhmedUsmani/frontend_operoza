import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdDelete } from "react-icons/md";
import { fetchTenantRoles, fetchTenantUsers } from "../../services/adminService";
import {
  createDashboardAssignment,
  deleteDashboardAssignment,
  fetchDashboardAssignments,
} from "../../services/dashboardService";

function DashboardAssignmentsDialog({ accessToken, dashboard, open, onClose }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [mode, setMode] = useState("role");
  const [targetUserId, setTargetUserId] = useState("");
  const [targetRoleCode, setTargetRoleCode] = useState("hr_manager");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const enabledRoles = useMemo(() => roles.filter((item) => item.enabled), [roles]);

  const load = async () => {
    if (!open || !accessToken || !dashboard?.dashboard_id) {
      return;
    }
    setLoading(true);
    setError("");
    try {
      const [usersData, rolesData, assignmentsData] = await Promise.all([
        fetchTenantUsers(accessToken),
        fetchTenantRoles(accessToken),
        fetchDashboardAssignments(accessToken, dashboard.dashboard_id),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
      setAssignments(assignmentsData);
      const firstRole = rolesData.find((item) => item.enabled)?.role_code || "hr_manager";
      setTargetRoleCode(firstRole);
    } catch (err) {
      setError(err.message || "Failed to load dashboard assignments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [open, accessToken, dashboard?.dashboard_id]);

  const roleLabel = (roleCode) => enabledRoles.find((item) => item.role_code === roleCode)?.display_name || roleCode;
  const userLabel = (userId) => users.find((item) => item.user_id === userId)?.display_name || userId;

  const handleAssign = async () => {
    setError("");
    try {
      const payload = mode === "user"
        ? { target_user_id: targetUserId }
        : { target_role_code: targetRoleCode };
      await createDashboardAssignment(accessToken, dashboard.dashboard_id, payload);
      setTargetUserId("");
      await load();
      window.dispatchEvent(new CustomEvent("dashboards:assignments-changed"));
    } catch (err) {
      setError(err.message || "Failed to assign dashboard");
    }
  };

  const handleDelete = async (assignmentId) => {
    setError("");
    try {
      await deleteDashboardAssignment(accessToken, dashboard.dashboard_id, assignmentId);
      await load();
      window.dispatchEvent(new CustomEvent("dashboards:assignments-changed"));
    } catch (err) {
      setError(err.message || "Failed to remove assignment");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Dashboard Assignments</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {dashboard?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Assign this dashboard to a role or a specific user. Assigned dashboards appear as submenu items in the tenant sidebar.
            </Typography>
          </Box>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              select
              label="Assign to"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              fullWidth
              size="small"
            >
              <MenuItem value="role">Role</MenuItem>
              <MenuItem value="user">Specific user</MenuItem>
            </TextField>

            {mode === "role" ? (
              <TextField
                select
                label="Role"
                value={targetRoleCode}
                onChange={(e) => setTargetRoleCode(e.target.value)}
                fullWidth
                size="small"
              >
                {enabledRoles.map((item) => (
                  <MenuItem key={item.role_code} value={item.role_code}>
                    {item.display_name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                select
                label="User"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                fullWidth
                size="small"
              >
                {users.map((item) => (
                  <MenuItem key={item.user_id} value={item.user_id}>
                    {item.display_name} ({item.email})
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Button
              variant="contained"
              onClick={handleAssign}
              disabled={loading || (mode === "role" ? !targetRoleCode : !targetUserId)}
            >
              Assign
            </Button>
          </Stack>

          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
              Current assignments
            </Typography>
            {assignments.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No assignments yet.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {assignments.map((assignment) => (
                  <Stack
                    key={assignment.dashboard_assignment_id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ border: "1px solid #ead8c4", borderRadius: 2, px: 1.5, py: 1 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Chip
                        size="small"
                        color={assignment.target_user_id ? "primary" : "warning"}
                        label={assignment.target_user_id ? "User" : "Role"}
                      />
                      <Typography variant="body2">
                        {assignment.target_user_id
                          ? userLabel(assignment.target_user_id)
                          : roleLabel(assignment.target_role_code)}
                      </Typography>
                    </Stack>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(assignment.dashboard_assignment_id)}
                      aria-label="Remove assignment"
                    >
                      <MdDelete />
                    </IconButton>
                  </Stack>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default DashboardAssignmentsDialog;
