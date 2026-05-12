import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import GridCell from "./GridCell";
import { createNewWidget } from "./widgetLibrary";

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
}) {
  const [dragOverIndex, setDragOverIndex] = useState(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOverIndex(null);

    const widgetType = e.dataTransfer.getData("widget-type");
    if (widgetType) {
      const newWidget = createNewWidget(widgetType);
      if (newWidget) {
        onAddWidget(newWidget);
      }
    }
  };

  const handleDragEnd = () => {
    setDragOverIndex(null);
  };

  if (widgets.length === 0) {
    return (
      <Paper
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 400,
          bgcolor: "#faf6f0",
          border: "2px dashed #ead8c4",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          transition: "all 0.2s ease",
          cursor: "copy",
        }}
      >
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
        bgcolor: "#faf6f0",
        border: "1px solid #ead8c4",
        borderRadius: 2,
        p: 2,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
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

      {/* Drop zone hint when dragging over */}
      {dragOverIndex !== null && (
        <Box
          sx={{
            gridColumn: "1 / -1",
            bgcolor: "primary.light",
            border: "2px dashed",
            borderColor: "primary.main",
            borderRadius: 1,
            p: 3,
            textAlign: "center",
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          Drop here to add widget
        </Box>
      )}
    </Paper>
  );
}

export default GridCanvas;
