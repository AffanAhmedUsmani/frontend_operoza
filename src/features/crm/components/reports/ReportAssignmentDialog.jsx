import { useMemo, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { assignReport } from "../../services/reportingService";

const ASSIGNABLE_ROLE_CODES = ["agent", "client", "team_lead", "hr_manager"];

function resolveUserRoleCode(user) {
  if (user?.role_code) return String(user.role_code).trim().toLowerCase();
  if (Array.isArray(user?.roles) && user.roles.length > 0) {
    const code = user.roles.find((item) => item?.role_code)?.role_code;
    if (code) return String(code).trim().toLowerCase();
  }
  return "";
}

export default function ReportAssignmentDialog({
  open,
  onClose,
  onAssigned,
  accessToken,
  report,
  users,
}) {
  const [assigneeType, setAssigneeType] = useState("user");
  const [userId, setUserId] = useState("");
  const [targetRoleCode, setTargetRoleCode] = useState("agent");
  const [canView, setCanView] = useState(true);
  const [canComment, setCanComment] = useState(false);
  const [canExport, setCanExport] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalizedUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    return users.map((u) => {
      const roleCode = resolveUserRoleCode(u);
      return {
        user_id: u?.user_id,
        display_name: u?.display_name || "",
        email_address: u?.email_address || u?.email || "",
        role_code: roleCode,
      };
    });
  }, [users]);

  const eligibleUsers = useMemo(
    () => normalizedUsers.filter((u) => ASSIGNABLE_ROLE_CODES.includes(u.role_code)),
    [normalizedUsers]
  );

  const handleAssign = async () => {
    if (!report?.report_id) return;

    let assignedToValue = null;
    if (assigneeType === "user") {
      assignedToValue = userId || null;
    } else if (assigneeType === "role") {
      assignedToValue = targetRoleCode || null;
    }

    const payload = {
      assigned_to_type: assigneeType,
      assigned_to_value: assignedToValue,
      can_view: canView,
      can_comment: canComment,
      can_export: canExport,
    };

    if (assigneeType === "user" && !userId) {
      setError("Please choose a user.");
      return;
    }
    if (assigneeType === "role" && !targetRoleCode) {
      setError("Please choose a target role.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await assignReport(accessToken, report.report_id, payload);
      if (onAssigned) onAssigned();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to assign report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Assign Report</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Typography variant="body2" color="text.secondary">
            Assign report: {report?.name || ""}
          </Typography>

          <FormControl fullWidth>
            <InputLabel id="assignee-type-label">Assignment Type</InputLabel>
            <Select
              labelId="assignee-type-label"
              label="Assignment Type"
              value={assigneeType}
              onChange={(e) => setAssigneeType(e.target.value)}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="role">Role</MenuItem>
              <MenuItem value="campaign_assignees">Campaign Assignees</MenuItem>
              <MenuItem value="all">All Tenant Users</MenuItem>
            </Select>
          </FormControl>

          {assigneeType === "user" ? (
            <FormControl fullWidth>
              <InputLabel id="assignee-user-label">Assignee User</InputLabel>
              <Select
                labelId="assignee-user-label"
                label="Assignee User"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              >
                {eligibleUsers.map((u) => (
                  <MenuItem key={u.user_id} value={u.user_id}>
                    {u.display_name || u.email_address || u.user_id} ({u.role_code || "no_role"})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          {assigneeType === "role" ? (
            <FormControl fullWidth>
              <InputLabel id="assignee-role-label">Target Role</InputLabel>
              <Select
                labelId="assignee-role-label"
                label="Target Role"
                value={targetRoleCode}
                onChange={(e) => setTargetRoleCode(e.target.value)}
              >
                {ASSIGNABLE_ROLE_CODES.map((roleCode) => (
                  <MenuItem key={roleCode} value={roleCode}>{roleCode}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <FormControlLabel
              control={<Switch checked={canView} onChange={(e) => setCanView(e.target.checked)} color="warning" />}
              label="Can View"
            />
            <FormControlLabel
              control={<Switch checked={canComment} onChange={(e) => setCanComment(e.target.checked)} color="warning" />}
              label="Can Comment"
            />
            <FormControlLabel
              control={<Switch checked={canExport} onChange={(e) => setCanExport(e.target.checked)} color="warning" />}
              label="Can Export"
            />
          </Stack>

          {!eligibleUsers.length && assigneeType === "user" ? (
            <Alert severity="info">
              No assignable users found yet. Add users with roles like agent, client, team_lead, or hr_manager.
            </Alert>
          ) : null}

          {assigneeType === "campaign_assignees" ? (
            <Typography variant="caption" color="text.secondary">
              This assignment grants access to users assigned to the report campaign.
            </Typography>
          ) : null}

          {assigneeType === "all" ? (
            <Typography variant="caption" color="text.secondary">
              This assignment grants access to all users in this tenant.
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleAssign} disabled={submitting}>Assign</Button>
      </DialogActions>
    </Dialog>
  );
}
