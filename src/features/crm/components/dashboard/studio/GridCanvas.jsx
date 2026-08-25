import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import GridCell from "./GridCell";
import { createNewWidget, WIDGET_LIBRARY } from "./widgetLibrary";

/**
 * GridCanvas — Center: 3-column responsive grid with drag-drop
 * 
 * Implements drag-and-drop widget placement and reordering.
 * Progressive disclosure: shows empty state, then grid of cells.
 * 
 * Props:
 *   widgets          — array of widget objects
 *   selectedWidget   — currently selected widget
 *   onSelectWidget   — (widget) => void
 *   onEditWidget     — (widget) => void
 *   onDeleteWidget   — (widget_id) => void
 *   onUpdateWidget   — (widget) => void (for reordering/resizing)
 *   onAddWidget      — (widget) => void (new widget added to canvas)
 *   isDragSource     — widget_id being dragged
 *   draggedType      — widget type string currently being dragged from the
 *                      palette (Sprint 19 - docs/SPRINT_PLAN.md's widget
 *                      preview-on-drop), or null when nothing is
 */
function GridCanvas({
  widgets,
  selectedWidget,
  onSelectWidget,
  onEditWidget,
  onDeleteWidget,
  onUpdateWidget,
  onAddWidget,
  isDragSource,
  draggedType,
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const draggedMeta = draggedType ? WIDGET_LIBRARY.find((w) => w.type === draggedType) : null;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const widgetType = e.dataTransfer.getData("widget-type");
    if (widgetType) {
      const newWidget = createNewWidget(widgetType);
      if (newWidget) {
        onAddWidget(newWidget);
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragOver(false);
  };

  if (widgets.length === 0) {
    return (
      <Paper
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={() => setIsDragOver(false)}
        onDragEnd={handleDragEnd}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          bgcolor: "brand.subtle",
          border: "2px dashed",
          borderColor: isDragOver ? "primary.main" : "divider",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          transition: "all 0.2s ease",
          cursor: "copy",
        }}
      >
        {isDragOver && draggedMeta ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ fontSize: 40 }}>{draggedMeta.icon}</Typography>
            <Typography variant="subtitle1" fontWeight={700} color="primary.main">
              {draggedMeta.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {draggedMeta.description}
            </Typography>
          </Box>
        ) : (
          <Box>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No widgets yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag a widget from the left panel or select one to add it here.
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 2, display: "block" }}>
              💡 You can also arrange widgets on this 3-column grid.
            </Typography>
          </Box>
        )}
      </Paper>
    );
  }

  return (
    <Paper
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragLeave={() => setDragOverIndex(null)}
      onDragEnd={handleDragEnd}
      sx={{
        flex: 1,
        minHeight: 400,
        bgcolor: "brand.subtle",
        border: "1px solid", borderColor: "divider",
        borderRadius: 2,
        p: 2,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridAutoRows: "120px",
        gridAutoFlow: "dense",
        gap: 2,
        alignContent: "start",
        overflow: "auto",
      }}
    >
      {widgets.map((widget) => (
        <GridCell
          key={widget.widget_id}
          widget={widget}
          isSelected={selectedWidget?.widget_id === widget.widget_id}
          isDragSource={isDragSource === widget.widget_id}
          onSelect={onSelectWidget}
          onEdit={onEditWidget}
          onDelete={onDeleteWidget}
          onDragStart={(e, w) => {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("widget-id", w.widget_id);
          }}
          onSpanChange={(widgetId, newSpan) => {
            const updated = widgets.find((w) => w.widget_id === widgetId);
            if (updated) {
              onUpdateWidget({ ...updated, gridSpan: newSpan });
            }
          }}
        />
      ))}

      {/* Drop zone preview - Sprint 19 (docs/SPRINT_PLAN.md): shows what's
          actually about to be dropped (icon, name, real footprint) rather
          than a generic "drop here" banner. */}
      {isDragOver && (
        <Box
          sx={{
            gridColumn: draggedMeta ? `span ${draggedMeta.defaultSpan}` : "1 / -1",
            gridRow: "span 1",
            bgcolor: "primary.light",
            border: "2px dashed",
            borderColor: "primary.main",
            borderRadius: 1,
            p: 2,
            textAlign: "center",
            color: "primary.dark",
            fontWeight: 700,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {draggedMeta ? (
            <>
              <Typography sx={{ fontSize: 24 }}>{draggedMeta.icon}</Typography>
              <Typography variant="body2" fontWeight={700}>{draggedMeta.name}</Typography>
            </>
          ) : (
            "Drop here to add widget"
          )}
        </Box>
      )}
    </Paper>
  );
}

export default GridCanvas;
