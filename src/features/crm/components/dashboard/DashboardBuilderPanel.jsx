import { useCallback, useEffect, useState } from "react";
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
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";
import { createWidget, fetchDashboardDetail, updateWidget } from "../../services/dashboardService";
import DashboardViewer from "./DashboardViewer";
import DashboardStudio from "./studio/DashboardStudio";

function normalizeStudioWidget(widget) {
  const position = widget?.position && typeof widget.position === "object" ? widget.position : {};
  return {
    ...widget,
    gridSpan: widget?.gridSpan || position.span || 1,
    gridRowSpan: widget?.gridRowSpan || position.rowSpan || 1,
    position,
  };
}

function toWidgetPosition(widget) {
  const position = widget?.position && typeof widget.position === "object" ? widget.position : {};
  return {
    ...position,
    row: position.row ?? 0,
    col: position.col ?? 0,
    span: widget?.gridSpan || position.span || 1,
    rowSpan: widget?.gridRowSpan || position.rowSpan || 1,
  };
}

/**
 * DashboardBuilderPanel
 *
 * Full management UI for a single dashboard (admin / team_lead only).
 * Provides two tabs: "Live View" and "Studio Builder".
 *
 * Props:
 *   accessToken   — JWT string
 *   dashboard     — dashboard object from fetchDashboards
 *   onRenamed     — (updatedDashboard) => void — called after rename
 *   onDelete      — (dashboardId) => void — called after deletion confirmed
 *   updateDashboard — async (dashboardId, payload) => updatedDashboard (from hook)
 */
function DashboardBuilderPanel({ accessToken, dashboard, campaign, actorRole, onRenamed, onDelete, updateDashboard }) {
  const [tab, setTab] = useState(0);
  const [widgets, setWidgets] = useState([]);

  // Rename state
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(dashboard.name);
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState(null);

  // Delete dashboard confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Re-sync widgets from the detail endpoint after mutations.
  const refreshWidgets = useCallback(async () => {
    try {
      const detail = await fetchDashboardDetail(accessToken, dashboard.dashboard_id);
      const normalizedWidgets = Array.isArray(detail.widgets)
        ? detail.widgets.map(normalizeStudioWidget)
        : [];
      setWidgets(normalizedWidgets);
      return normalizedWidgets;
    } catch (_) {
      // non-critical — viewer will still show via the data endpoint
      setWidgets([]);
      return [];
    }
  }, [accessToken, dashboard.dashboard_id]);

  // Load widgets on mount — the dashboard object from the list endpoint never
  // carries a widgets array, so we must fetch the detail to populate the studio.
  useEffect(() => {
    refreshWidgets();
  }, [refreshWidgets]);

  // ── Rename ──────────────────────────────────────────────────────────────────

  const handleRename = async () => {
    const name = renameValue.trim();
    if (!name) return;
    setRenaming(true);
    setRenameError(null);
    try {
      const updated = await updateDashboard(dashboard.dashboard_id, { name });
      onRenamed?.(updated);
      setRenameOpen(false);
    } catch (err) {
      setRenameError(err.message || "Failed to rename dashboard");
    } finally {
      setRenaming(false);
    }
  };

  return (
    <Stack spacing={2}>
      {/* Dashboard header row */}
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
          {dashboard.name}
        </Typography>
        {dashboard.is_client_visible && (
          <Chip label="Client visible" size="small" color="success" />
        )}
        <Tooltip title="Rename dashboard">
          <IconButton
            size="small"
            onClick={() => { setRenameValue(dashboard.name); setRenameOpen(true); }}
            aria-label="Rename dashboard"
          >
            <MdEdit size={16} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete dashboard">
          <IconButton
            size="small"
            color="error"
            onClick={() => setConfirmDeleteOpen(true)}
            aria-label="Delete dashboard"
          >
            <MdDelete size={16} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ borderBottom: "1px solid #ead8c4" }}
        aria-label="Dashboard sections"
      >
        <Tab label="Live View" id="tab-view" aria-controls="tabpanel-view" />
        <Tab label="Studio Builder" id="tab-studio" aria-controls="tabpanel-studio" />
      </Tabs>

      {/* Live View tab */}
      {tab === 0 && (
        <Box role="tabpanel" id="tabpanel-view" aria-labelledby="tab-view">
          <DashboardViewer
            accessToken={accessToken}
            dashboard={dashboard}
            actorRole={actorRole}
            canEdit={false}
          />
        </Box>
      )}

      {/* Studio Builder tab - drag-drop interface */}
      {tab === 1 && (
        <Box role="tabpanel" id="tabpanel-studio" aria-labelledby="tab-studio">
          <DashboardStudio
            dashboardId={dashboard.dashboard_id}
            dashboardName={dashboard.name}
            campaign={campaign}
            initialWidgets={widgets}
            onSave={async (updatedWidgets) => {
              // Save all widgets to backend, preserving widget layout in position JSON.
              for (const widget of updatedWidgets) {
                const position = toWidgetPosition(widget);
                if (widget.widget_id.startsWith("temp-")) {
                  await createWidget(accessToken, dashboard.dashboard_id, {
                    type: widget.type,
                    title: widget.title,
                    config_json: widget.config_json,
                    position,
                  });
                } else {
                  // Existing widget - update it
                  await updateWidget(accessToken, dashboard.dashboard_id, widget.widget_id, {
                    type: widget.type,
                    title: widget.title,
                    config_json: widget.config_json,
                    position,
                  });
                }
              }
              await refreshWidgets();
            }}
            onSaveDraft={async (draftWidgets, draftState) => {
              // Save draft as a local note for now (could extend to backend)
              localStorage.setItem(
                `dashboard-draft-${dashboard.dashboard_id}`,
                JSON.stringify({ widgets: draftWidgets, ...draftState })
              );
              alert("Draft saved locally. Changes are not yet published.");
            }}
            onCancel={() => setTab(0)}
          />
        </Box>
      )}

      {/* Rename dashboard dialog */}
      <Dialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="rename-dashboard-title"
      >
        <DialogTitle id="rename-dashboard-title">Rename Dashboard</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {renameError && <Alert severity="error">{renameError}</Alert>}
            <TextField
              label="Dashboard name"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              fullWidth
              autoFocus
              inputProps={{ maxLength: 180 }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameOpen(false)} disabled={renaming}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleRename}
            disabled={!renameValue.trim() || renaming}
          >
            {renaming ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete dashboard dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="confirm-delete-dashboard-title"
      >
        <DialogTitle id="confirm-delete-dashboard-title">Delete Dashboard</DialogTitle>
        <DialogContent>
          <Typography>
            Permanently delete <strong>{dashboard.name}</strong> and all its widgets?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => { setConfirmDeleteOpen(false); onDelete?.(dashboard.dashboard_id); }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

export default DashboardBuilderPanel;
