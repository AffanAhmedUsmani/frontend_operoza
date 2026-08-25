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
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdDelete, MdEdit } from "react-icons/md";
import {
  applyWidgetPreset,
  clearDashboardDraft,
  createWidget,
  fetchDashboardDetail,
  fetchDashboardDraft,
  fetchWidgetPresets,
  saveDashboardDraft,
  saveWidgetPreset,
  updateWidget,
} from "../../services/dashboardService";
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
  const [pendingDraft, setPendingDraft] = useState(null); // { draft_json, draft_saved_at }
  const [studioInitialWidgets, setStudioInitialWidgets] = useState([]);

  // Sprint 19 (docs/SPRINT_PLAN.md) - saved/reusable widget presets.
  const [presets, setPresets] = useState([]);
  const [selectedPresetId, setSelectedPresetId] = useState("");
  const [applyingPreset, setApplyingPreset] = useState(false);
  const [presetError, setPresetError] = useState("");
  const [savePresetOpen, setSavePresetOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [savingPreset, setSavingPreset] = useState(false);

  const loadPresets = useCallback(async () => {
    try {
      setPresets(await fetchWidgetPresets(accessToken));
    } catch (_) {
      // non-critical - the studio still works without presets
    }
  }, [accessToken]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const handleSavePreset = async () => {
    const name = presetName.trim();
    if (!name) return;
    setSavingPreset(true);
    setPresetError("");
    try {
      await saveWidgetPreset(accessToken, { dashboardId: dashboard.dashboard_id, name });
      setSavePresetOpen(false);
      setPresetName("");
      await loadPresets();
    } catch (err) {
      setPresetError(err.message || "Failed to save preset.");
    } finally {
      setSavingPreset(false);
    }
  };

  const handleApplyPreset = async () => {
    if (!selectedPresetId) return;
    setApplyingPreset(true);
    setPresetError("");
    try {
      await applyWidgetPreset(accessToken, dashboard.dashboard_id, selectedPresetId);
      await refreshWidgets();
    } catch (err) {
      setPresetError(err.message || "Failed to apply preset.");
    } finally {
      setApplyingPreset(false);
    }
  };

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
      setStudioInitialWidgets(normalizedWidgets);
      return normalizedWidgets;
    } catch (_) {
      // non-critical — viewer will still show via the data endpoint
      setWidgets([]);
      setStudioInitialWidgets([]);
      return [];
    }
  }, [accessToken, dashboard.dashboard_id]);

  // Load widgets on mount — the dashboard object from the list endpoint never
  // carries a widgets array, so we must fetch the detail to populate the studio.
  useEffect(() => {
    refreshWidgets();
  }, [refreshWidgets]);

  // Sprint 19 (docs/SPRINT_PLAN.md) - check for a pending draft once, on
  // mount, so a tenant reopening this dashboard's Studio Builder is
  // offered their unpublished work back rather than silently losing it.
  useEffect(() => {
    let cancelled = false;
    fetchDashboardDraft(accessToken, dashboard.dashboard_id)
      .then((draft) => {
        if (!cancelled && draft?.draft_json) setPendingDraft(draft);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [accessToken, dashboard.dashboard_id]);

  const handleRestoreDraft = () => {
    setStudioInitialWidgets(pendingDraft.draft_json.map(normalizeStudioWidget));
    setPendingDraft(null);
  };

  const handleDiscardDraft = async () => {
    setPendingDraft(null);
    try {
      await clearDashboardDraft(accessToken, dashboard.dashboard_id);
    } catch (_) {
      // non-critical - the banner is already dismissed either way
    }
  };

  // ── Rename ──────────────────────────────────────────────────────────────────

  const handleRename = async () => {
    const name = renameValue.trim();
    if (!name) return;
    setRenaming(true);
    setRenameError(null);
    try {
      const updated = await updateDashboard(accessToken, dashboard.dashboard_id, { name });
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
        sx={{ borderBottom: "1px solid", borderBottomColor: "divider" }}
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
          {/* Widget presets (Sprint 19 - docs/SPRINT_PLAN.md) */}
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            <Button size="small" variant="outlined" onClick={() => setSavePresetOpen(true)}>
              Save as Preset
            </Button>
            {presets.length > 0 ? (
              <>
                <Select
                  size="small"
                  displayEmpty
                  value={selectedPresetId}
                  onChange={(e) => setSelectedPresetId(e.target.value)}
                  sx={{ minWidth: 220 }}
                >
                  <MenuItem value="">
                    <em>Apply a saved combination…</em>
                  </MenuItem>
                  {presets.map((preset) => (
                    <MenuItem key={preset.preset_id} value={preset.preset_id}>
                      {preset.name} ({preset.widget_count} widgets)
                    </MenuItem>
                  ))}
                </Select>
                <Button size="small" onClick={handleApplyPreset} disabled={!selectedPresetId || applyingPreset}>
                  {applyingPreset ? "Applying…" : "Apply"}
                </Button>
              </>
            ) : (
              <Typography variant="caption" color="text.secondary">
                No saved combinations yet - build a dashboard, then "Save as Preset" to reuse it elsewhere.
              </Typography>
            )}
          </Stack>
          {presetError ? <Alert severity="error" sx={{ mb: 1.5 }}>{presetError}</Alert> : null}

          {pendingDraft ? (
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <Stack direction="row" spacing={1}>
                  <Button size="small" onClick={handleRestoreDraft}>Restore</Button>
                  <Button size="small" color="inherit" onClick={handleDiscardDraft}>Discard</Button>
                </Stack>
              }
            >
              You have an unpublished draft from {new Date(pendingDraft.draft_saved_at).toLocaleString()}.
            </Alert>
          ) : null}
          <DashboardStudio
            dashboardId={dashboard.dashboard_id}
            dashboardName={dashboard.name}
            campaign={campaign}
            initialWidgets={studioInitialWidgets}
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
              // Publishing supersedes any pending draft - clear it so a
              // stale "you have an unpublished draft" banner doesn't
              // reappear for widgets that are now actually live.
              await clearDashboardDraft(accessToken, dashboard.dashboard_id).catch(() => {});
              setPendingDraft(null);
              await refreshWidgets();
            }}
            onSaveDraft={async (draftWidgets) => {
              await saveDashboardDraft(accessToken, dashboard.dashboard_id, draftWidgets);
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

      {/* Save widget preset dialog (Sprint 19 - docs/SPRINT_PLAN.md) */}
      <Dialog open={savePresetOpen} onClose={() => setSavePresetOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Save as Preset</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Saves this dashboard's current published widgets as a reusable combination you can
              apply to any dashboard.
            </Typography>
            {presetError ? <Alert severity="error">{presetError}</Alert> : null}
            <TextField
              label="Preset name"
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              fullWidth
              autoFocus
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavePresetOpen(false)} disabled={savingPreset}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePreset} disabled={!presetName.trim() || savingPreset}>
            {savingPreset ? "Saving…" : "Save"}
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
