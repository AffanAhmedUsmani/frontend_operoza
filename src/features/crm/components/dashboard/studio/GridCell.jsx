import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdDelete, MdEdit, MdDragHandle, MdMoreVert } from "react-icons/md";
import { getWidgetByType } from "./widgetLibrary";

/**
 * GridCell — Single widget cell in the canvas grid
 * 
 * Reusable, single responsibility: render a draggable/resizable widget cell.
 * Shows placeholder if no data yet (progressive disclosure).
 * 
 * Props:
 *   widget           — { widget_id, type, title, config_json, gridSpan, gridRowSpan }
 *   isSelected       — bool
 *   isDragSource     — bool (being dragged)
 *   onSelect         — (widget) => void
 *   onEdit           — (widget) => void
 *   onDelete         — (widget_id) => void
 *   onDragStart      — (e, widget) => void
 *   onSpanChange     — (widget_id, newSpan) => void
 */
function GridCell({
  widget,
  isSelected,
  isDragSource,
  onSelect,
  onEdit,
  onDelete,
  onDragStart,
  onSpanChange,
}) {
  const meta = getWidgetByType(widget.type);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const dragHandleRef = useRef(null);

  if (!meta) {
    return (
      <Box
        sx={{
          gridColumn: `span ${widget.gridSpan || 1}`,
          gridRow: `span ${widget.gridRowSpan || 1}`,
          bgcolor: "error.light",
          border: "1px dashed", borderColor: "error.main",
          borderRadius: 1,
          p: 2,
          textAlign: "center",
        }}
      >
        <Typography variant="caption" color="error">
          Unknown widget type: {widget.type}
        </Typography>
      </Box>
    );
  }

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart?.(e, widget)}
      onClick={() => onSelect(widget)}
      sx={{
        gridColumn: `span ${Math.min(widget.gridSpan || 1, 3)}`,
        gridRow: `span ${Math.min(widget.gridRowSpan || 1, 4)}`,
        cursor: "pointer",
        border: isSelected ? "2px solid" : "1px solid",
        borderColor: isSelected ? "primary.main" : "divider",
        bgcolor: isDragSource ? "action.hover" : isSelected ? "action.selected" : "brand.subtle",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 3,
          borderColor: "primary.main",
        },
        opacity: isDragSource ? 0.6 : 1,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with drag handle */}
      <CardHeader
        sx={{
          p: 1.5,
          pb: 1,
          borderBottom: "1px solid",
          borderBottomColor: "divider",
          display: "flex",
          alignItems: "center",
        }}
        avatar={
          <Box
            ref={dragHandleRef}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.disabled",
              cursor: "grab",
              "&:active": { cursor: "grabbing" },
            }}
            draggable
            onDragStart={(e) => {
              e.stopPropagation();
              onDragStart?.(e, widget);
            }}
          >
            <MdDragHandle size={18} />
          </Box>
        }
        title={
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" fontWeight={700} noWrap>
              {widget.title}
            </Typography>
            <Chip
              label={meta.name}
              size="small"
              icon={<span>{meta.icon}</span>}
              sx={{
                bgcolor: "brand.subtle",
                color: "primary.dark",
                fontWeight: 700,
                fontSize: "0.65rem",
                width: "fit-content",
              }}
            />
          </Stack>
        }
        action={
          <Tooltip title="More options">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setMenuAnchor(e.currentTarget);
              }}
              aria-label="More options"
            >
              <MdMoreVert size={16} />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Content area - shows placeholder or widget preview */}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 120,
          p: 2,
          color: "text.disabled",
          fontSize: "0.875rem",
        }}
      >
        <Typography variant="caption" color="text.secondary" align="center">
          {widget.type === "metric" && "📊 Formula-based single value"}
          {widget.type === "chart" && "📈 Grouped data visualization"}
          {widget.type === "table" && "📋 Paginated record table"}
          {widget.type === "funnel" && "🎯 Stage drop-off funnel"}
          {widget.type === "leaderboard" && "🏆 Performance ranking"}
          {widget.type === "commission" && "💰 Earnings breakdown"}
          {widget.type === "target" && "🎪 Actual vs. target"}
          {widget.type === "qa_score" && "⭐ Audio quality metrics"}
          {widget.type === "flagged_calls" && "🚩 Quality issues"}
          {widget.type === "roi" && "📊 Revenue & profitability"}
          {!Object.keys({
            metric: 1,
            chart: 1,
            table: 1,
            funnel: 1,
            leaderboard: 1,
            commission: 1,
            target: 1,
            qa_score: 1,
            flagged_calls: 1,
            roi: 1,
          }).includes(widget.type) && "Unknown widget"}
        </Typography>
        <Typography variant="caption" sx={{ mt: 1, fontStyle: "italic" }}>
          (Click to edit configuration)
        </Typography>
      </CardContent>

      {/* Footer: size info */}
      <Box
        sx={{
          p: 1,
          bgcolor: "brand.subtle",
          borderTop: "1px solid",
          borderTopColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.7rem",
          color: "text.disabled",
        }}
      >
        <span>
          Size: {widget.gridSpan || 1}/3 cols × {widget.gridRowSpan || 1} rows
        </span>
      </Box>

      {/* Context menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchor(null);
            onEdit(widget);
          }}
        >
          <MdEdit size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchor(null);
            if (onSpanChange) {
              const newSpan = widget.gridSpan === 1 ? 2 : widget.gridSpan === 2 ? 3 : 1;
              onSpanChange(widget.widget_id, newSpan);
            }
          }}
        >
          Resize width ({widget.gridSpan || 1} → {widget.gridSpan === 1 ? 2 : widget.gridSpan === 2 ? 3 : 1})
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            setMenuAnchor(null);
            onDelete(widget.widget_id);
          }}
          sx={{ color: "error.main" }}
        >
          <MdDelete size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}

export default GridCell;
