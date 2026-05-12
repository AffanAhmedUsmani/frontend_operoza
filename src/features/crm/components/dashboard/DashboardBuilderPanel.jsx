import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import {
  createWidget,
  deleteWidget,
  fetchDashboardDetail,
  updateWidget,
} from "../../services/dashboardService";
import DashboardViewer from "./DashboardViewer";
import WidgetFormDialog from "./WidgetFormDialog";
import DashboardStudio from "./studio/DashboardStudio";

/**
 * DashboardBuilderPanel
 *
 * Full management UI for a single dashboard (admin / team_lead only).
 * Provides two tabs: "View" (live computed data) and "Builder" (add/edit/delete widgets).
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
  const [widgets, setWidgets] = useState(dashboard.widgets || []);
  const [widgetDialogOpen, setWidgetDialogOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);
  const [savingWidget, setSavingWidget] = useState(false);
  const [widgetError, setWidgetError] = useState(null);
  const [deleteWidgetTarget, setDeleteWidgetTarget] = useState(null);
  const [deletingWidget, setDeletingWidget] = useState(false);

  // Rename state
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(dashboard.name);
  const [renaming, setRenaming] = useState(false);
  const [renameError, setRenameError] = useState(null);

  // Delete dashboard confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  // Re-sync widgets from the detail endpoint after mutations
  const refreshWidgets = useCallback(async () => {
    try {
      const detail = await fetchDashboardDetail(accessToken, dashboard.dashboard_id);
      setWidgets(detail.widgets || []);
    } catch (_) {
      // non-critical — viewer will still show via the data endpoint
    }
  }, [accessToken, dashboard.dashboard_id]);

  // Load widgets on mount — the dashboard object from the list endpoint never
  // carries a widgets array, so we must fetch the detail to populate the builder.
  useEffect(() => {
    refreshWidgets();
  }, [refreshWidgets]);

  // ── Widget CRUD ─────────────────────────────────────────────────────────────

  const handleWidgetSubmit = async (payload) => {
    setSavingWidget(true);
    setWidgetError(null);
    try {
      if (editingWidget) {
        await updateWidget(accessToken, dashboard.dashboard_id, editingWidget.widget_id, payload);
      } else {
        await createWidget(accessToken, dashboard.dashboard_id, payload);
      }
      await refreshWidgets();
      setWidgetDialogOpen(false);
      setEditingWidget(null);
    } catch (err) {
      setWidgetError(err.message || "Failed to save widget");
    } finally {
      setSavingWidget(false);
    }
  };

  const handleDeleteWidget = async () => {
    if (!deleteWidgetTarget) return;
    setDeletingWidget(true);
    try {
      await deleteWidget(accessToken, dashboard.dashboard_id, deleteWidgetTarget.widget_id);
      await refreshWidgets();
      setDeleteWidgetTarget(null);
    } catch (err) {
      // show inline
    } finally {
      setDeletingWidget(false);
    }
  };

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
        <Tab label="Builder" id="tab-builder" aria-controls="tabpanel-builder" />
        <Tab label="Studio Builder" id="tab-studio" aria-controls="tabpanel-studio" />
      </Tabs>

      {/* Live View tab */}
      {tab === 0 && (
        <Box role="tabpanel" id="tabpanel-view" aria-labelledby="tab-view">
          <DashboardViewer
            accessToken={accessToken}
            dashboard={dashboard}
            actorRole={actorRole}
            canEdit
            onEditWidget={(w) => { setEditingWidget(w); setWidgetDialogOpen(true); }}
            onDeleteWidget={(w) => setDeleteWidgetTarget(w)}
          />
        </Box>
      )}

      {/* Builder tab */}
      {tab === 1 && (
        <Box role="tabpanel" id="tabpanel-builder" aria-labelledby="tab-builder">
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2" color="text.secondary">
                {widgets.length} widget{widgets.length !== 1 ? "s" : ""} configured
              </Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<MdAdd />}
                onClick={() => { setEditingWidget(null); setWidgetDialogOpen(true); }}
                aria-label="Add new widget"
              >
                Add Widget
              </Button>
            </Stack>

            {widgets.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  border: "2px dashed #ead8c4",
                  borderRadius: 3,
                }}
                role="status"
              >
                <Typography variant="body2" color="text.secondary">
                  No widgets yet — add one to get started.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1} divider={<Divider />}>
                {widgets.map((w) => (
                  <Stack
                    key={w.widget_id}
                    direction="row"
                    alignItems="center"
                    spacing={1.5}
                    sx={{ py: 0.75, px: 1 }}
                  >
                    <Chip
                      label={w.type}
                      size="small"
                      sx={{ bgcolor: "#f5ece0", color: "#7c3f17", fontWeight: 700, fontSize: "0.68rem" }}
                    />
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {w.title}
                    </Typography>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => { setEditingWidget(w); setWidgetDialogOpen(true); }}
                        aria-label={`Edit ${w.title}`}
                      >
                        <MdEdit size={15} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteWidgetTarget(w)}
                        aria-label={`Delete ${w.title}`}
                      >
                        <MdDelete size={15} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </Box>
      )}

      {/* Studio Builder tab - drag-drop interface */}
      {tab === 2 && (
        <Box role="tabpanel" id="tabpanel-studio" aria-labelledby="tab-studio">
          <DashboardStudio
            dashboardId={dashboard.dashboard_id}
            dashboardName={dashboard.name}
            initialWidgets={widgets}
            onSave={async (updatedWidgets) => {
              // Save all widgets to backend
              for (const widget of updatedWidgets) {
                if (widget.widget_id.startsWith("temp-")) {
                  // New widget - create it
                  await createWidget(accessToken, dashboard.dashboard_id, {
                    type: widget.type,
                    title: widget.title,
                    config_json: widget.config_json,
                  });
                } else {
                  // Existing widget - update it
                  await updateWidget(accessToken, dashboard.dashboard_id, widget.widget_id, {
                    type: widget.type,
                    title: widget.title,
                    config_json: widget.config_json,
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

      {/* Widget add/edit dialog */}
      <WidgetFormDialog
        open={widgetDialogOpen}
        initialData={editingWidget}
        campaign={campaign}
        onClose={() => { setWidgetDialogOpen(false); setEditingWidget(null); setWidgetError(null); }}
        onSubmit={handleWidgetSubmit}
        saving={savingWidget}
        error={widgetError}
      />

      {/* Confirm delete widget dialog */}
      <Dialog
        open={!!deleteWidgetTarget}
        onClose={() => setDeleteWidgetTarget(null)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="confirm-delete-widget-title"
      >
        <DialogTitle id="confirm-delete-widget-title">Delete Widget</DialogTitle>
        <DialogContent>
          <Typography>
            Delete <strong>{deleteWidgetTarget?.title}</strong>? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteWidgetTarget(null)} disabled={deletingWidget}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteWidget}
            disabled={deletingWidget}
          >
            {deletingWidget ? "Deleting…" : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

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
