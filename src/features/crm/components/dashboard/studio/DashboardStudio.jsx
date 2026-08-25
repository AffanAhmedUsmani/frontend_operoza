import { useCallback, useEffect, useState } from "react";
import { Box, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Button, Snackbar, Alert } from "@mui/material";
import StudioToolbar from "./StudioToolbar";
import WidgetPalette from "./WidgetPalette";
import GridCanvas from "./GridCanvas";
import PropertiesPanel from "./PropertiesPanel";

/**
 * DashboardStudio — Main orchestrator for drag-drop dashboard builder
 * 
 * Implements perfect composition:
 * - StudioToolbar: save/draft/cancel actions (primacy)
 * - WidgetPalette: chunked widget catalog (Miller's Law)
 * - GridCanvas: 3-column grid with drag-drop (center canvas)
 * - PropertiesPanel: edit selected widget (progressive disclosure)
 * 
 * State management: local component state, lifts to parent on save
 * 
 * Props:
 *   dashboardId      — current dashboard UUID
 *   dashboardName    — current dashboard name
 *   initialWidgets   — array of existing widgets
 *   onSave           — async (widgets) => void
 *   onSaveDraft      — async (widgets, draftState) => void
 *   onCancel         — () => void
 */
function DashboardStudio({
  dashboardId,
  dashboardName,
  campaign,
  initialWidgets = [],
  onSave,
  onSaveDraft,
  onCancel,
}) {
  // ── State ────────────────────────────────────────────────────────────────
  const [widgets, setWidgets] = useState(initialWidgets);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [selectedPaletteType, setSelectedPaletteType] = useState(null);
  const [isDragSource, setIsDragSource] = useState(null);
  const [draggedType, setDraggedType] = useState(null); // Sprint 19: real preview-on-drop
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveDraftLoading, setSaveDraftLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [historyStack, setHistoryStack] = useState([initialWidgets]); // For undo
  const [historyIndex, setHistoryIndex] = useState(0);
  const [snackbar, setSnackbar] = useState(null); // { message, severity }

  useEffect(() => {
    setWidgets(initialWidgets);
    setSelectedWidget(null);
    setHistoryStack([initialWidgets]);
    setHistoryIndex(0);
    setHasChanges(false);
  }, [initialWidgets]);

  // Track original state to detect changes
  const originalState = JSON.stringify(initialWidgets);
  const currentState = JSON.stringify(widgets);
  const actualHasChanges = originalState !== currentState || hasChanges;

  // ── Undo/Redo ────────────────────────────────────────────────────────────

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setWidgets(historyStack[historyIndex - 1]);
      setSelectedWidget(null);
    }
  }, [historyIndex, historyStack]);

  const canUndo = historyIndex > 0;

  // Sprint 19 (docs/SPRINT_PLAN.md): redo was previously only a section
  // comment - pushToHistory already truncates "future" entries on a new
  // branch (the standard undo/redo stack shape), so redo is just walking
  // forward through historyStack the same way undo walks backward.
  const handleRedo = useCallback(() => {
    if (historyIndex < historyStack.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setWidgets(historyStack[historyIndex + 1]);
      setSelectedWidget(null);
    }
  }, [historyIndex, historyStack]);

  const canRedo = historyIndex < historyStack.length - 1;

  const pushToHistory = (newWidgets) => {
    // Trim any "future" history if we've branched
    const newStack = historyStack.slice(0, historyIndex + 1);
    newStack.push(newWidgets);
    setHistoryStack(newStack);
    setHistoryIndex(newStack.length - 1);
  };

  // ── Widget operations ────────────────────────────────────────────────────

  const handleAddWidget = useCallback(
    (newWidget) => {
      const updated = [...widgets, newWidget];
      setWidgets(updated);
      pushToHistory(updated);
      setHasChanges(true);
      setSelectedWidget(newWidget);
    },
    [widgets, historyIndex]
  );

  const handleUpdateWidget = useCallback(
    (updated) => {
      const newWidgets = widgets.map((w) =>
        w.widget_id === updated.widget_id ? updated : w
      );
      setWidgets(newWidgets);
      pushToHistory(newWidgets);
      setHasChanges(true);
      setSelectedWidget(updated);
    },
    [widgets, historyIndex]
  );

  const handleDeleteWidget = useCallback(
    (widgetId) => {
      const newWidgets = widgets.filter((w) => w.widget_id !== widgetId);
      setWidgets(newWidgets);
      pushToHistory(newWidgets);
      setHasChanges(true);
      setSelectedWidget(null);
    },
    [widgets, historyIndex]
  );

  // ── Save operations ─────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      await onSave(widgets);
      // Reset history and changes tracking on successful save
      setHistoryStack([widgets]);
      setHistoryIndex(0);
      setHasChanges(false);
      setSnackbar({ message: "Dashboard saved.", severity: "success" });
    } catch (err) {
      console.error("Save failed:", err);
      setSnackbar({ message: err.message || "Failed to save dashboard.", severity: "error" });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaveDraftLoading(true);
    try {
      // Sprint 19 (docs/SPRINT_PLAN.md): previously localStorage-only plus
      // a blocking window.alert() - onSaveDraft is now a real backend
      // call (DashboardBuilderPanel.jsx persists it via dashboardService),
      // confirmed here with a non-blocking Snackbar instead.
      await onSaveDraft(widgets, { draftAt: new Date().toISOString() });
      setHasChanges(false);
      setSnackbar({ message: "Draft saved - not yet published.", severity: "success" });
    } catch (err) {
      console.error("Save draft failed:", err);
      setSnackbar({ message: err.message || "Failed to save draft.", severity: "error" });
    } finally {
      setSaveDraftLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Stack spacing={3}>
      {/* Top toolbar - primacy (Serial Position Effect) */}
      <StudioToolbar
        dashboardName={dashboardName}
        hasChanges={actualHasChanges}
        onSave={handleSave}
        onSaveDraft={handleSaveDraft}
        onCancel={onCancel}
        onUndo={handleUndo}
        canUndo={canUndo}
        onRedo={handleRedo}
        canRedo={canRedo}
      />

      {/* Three-column layout: Palette | Canvas | Properties */}
      <Box sx={{ display: "flex", gap: 2, minHeight: "60vh" }}>
        {/* Left: Widget Palette - Miller's Law */}
        <WidgetPalette
          onWidgetSelect={(type) => {
            setSelectedPaletteType(type);
            // Auto-add on select (optional: user can click button instead)
          }}
          selectedType={selectedPaletteType}
          onWidgetDragStart={setDraggedType}
          onWidgetDragEnd={() => setDraggedType(null)}
        />

        {/* Center: 3-Column Grid Canvas */}
        <GridCanvas
          widgets={widgets}
          selectedWidget={selectedWidget}
          onSelectWidget={setSelectedWidget}
          onEditWidget={(w) => setSelectedWidget(w)}
          onDeleteWidget={handleDeleteWidget}
          onUpdateWidget={handleUpdateWidget}
          onAddWidget={handleAddWidget}
          isDragSource={isDragSource}
          draggedType={draggedType}
        />

        {/* Right: Properties Panel - Progressive Disclosure */}
        <PropertiesPanel
          widget={selectedWidget}
          campaign={campaign}
          onUpdate={handleUpdateWidget}
          onClose={() => setSelectedWidget(null)}
        />
      </Box>

      {/* Floating hint - recency cue */}
      <Box
        sx={{
          textAlign: "center",
          p: 1.5,
          bgcolor: "brand.subtle",
          borderRadius: 1,
          border: "1px solid", borderColor: "divider",
          fontSize: "0.75rem",
          color: "text.disabled",
        }}
      >
        💡 <strong>Pro tip:</strong> Drag widgets to reorder or from the palette to add.
        Changes are tracked in history (Undo/Redo available).
      </Box>

      <Snackbar
        open={Boolean(snackbar)}
        autoHideDuration={4000}
        onClose={() => setSnackbar(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        {snackbar ? (
          <Alert severity={snackbar.severity} onClose={() => setSnackbar(null)} sx={{ width: "100%" }}>
            {snackbar.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Stack>
  );
}

export default DashboardStudio;
