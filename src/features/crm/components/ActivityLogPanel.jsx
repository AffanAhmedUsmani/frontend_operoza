import { useEffect, useState } from "react";
import {
  Alert,
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

import { fetchAuditLog } from "../services/adminService";

// Human-readable labels for the action codes actually emitted by
// record_audit_event() call sites (iam/audit.py). Falls back to a
// humanized version of any action this list doesn't yet name, so a
// future call site never renders as a blank row here.
const ACTION_LABELS = {
  user_created: "Added a user",
  user_deactivated: "Removed a user",
  role_assigned: "Assigned a role",
  role_enabled: "Enabled a role",
  role_disabled: "Disabled a role",
  network_access_created: "Added an allowed IP/network",
  network_access_removed: "Removed an allowed IP/network",
  tenant_branding_updated: "Changed workspace branding",
  campaign_created: "Created a campaign",
  campaign_deleted: "Deleted a campaign",
  report_created: "Created a report",
  dashboard_created: "Created a dashboard",
  TENANT_TIER_CHANGED: "Changed billing tier",
  TENANT_DATA_IMPORTED: "Restored workspace from a backup",
  TENANT_DATA_EXPORTED: "Exported workspace data",
};

function humanizeAction(action) {
  if (ACTION_LABELS[action]) return ACTION_LABELS[action];
  return String(action || "")
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function summarizeMetadata(event) {
  const meta = event.metadata || {};
  if (meta.name) return `"${meta.name}"`;
  if (meta.fields) return `(${Array.isArray(meta.fields) ? meta.fields.join(", ") : meta.fields})`;
  if (event.target_type) return event.target_id ? `${event.target_type} ${event.target_id.slice(0, 8)}` : event.target_type;
  return "";
}

/**
 * Post-Sprint-20 - Settings -> Activity Log: "who took a major decision
 * inside this tenant's portal" (report generation, dashboard creation,
 * campaign changes, role/user changes, branding/network-access
 * changes...), including an Admin's own past actions. Reads the
 * existing (Sprint 4) AuditEvent trail via GET /api/auth/admin/audit-log
 * - that endpoint already existed with zero frontend consumer before
 * this panel.
 */
export default function ActivityLogPanel({ accessToken }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchAuditLog(accessToken)
      .then((items) => {
        if (!cancelled) setEvents(items);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load the activity log.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        A record of major decisions taken inside this workspace - who did what, and when. Includes
        your own past actions.
      </Typography>

      {error ? <Alert severity="error">{error}</Alert> : null}

      {loading ? (
        <Stack alignItems="center" sx={{ py: 3 }}>
          <CircularProgress size={24} />
        </Stack>
      ) : events.length === 0 ? (
        <Typography color="text.secondary" variant="body2">No activity recorded yet.</Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 420, overflowY: "auto", border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: "brand.subtle" }}>When</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "brand.subtle" }}>Who</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "brand.subtle" }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "brand.subtle" }}>Detail</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.audit_event_id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                    {new Date(event.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="body2">{event.actor_display_name || "System"}</Typography>
                      {event.actor_role ? (
                        <Chip label={event.actor_role.replace("_", " ")} size="small" variant="outlined" sx={{ height: 18, fontSize: "0.65rem" }} />
                      ) : null}
                    </Stack>
                  </TableCell>
                  <TableCell>{humanizeAction(event.action)}</TableCell>
                  <TableCell sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{summarizeMetadata(event)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
