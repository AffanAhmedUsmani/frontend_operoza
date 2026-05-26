import { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  Divider,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { MdExpandMore, MdAdd } from "react-icons/md";
import { WIDGET_LIBRARY, getWidgetsByCategory, getWidgetCategories } from "./widgetLibrary";

/**
 * WidgetPalette — Left sidebar: available widget catalog
 * 
 * Miller's Law: Chunks widgets by category with progressive disclosure (collapsible groups)
 * Jakob's Law: Familiar card-based interaction pattern
 * 
 * Props:
 *   onWidgetSelect — (widgetType) => void
 *   selectedType   — currently selected widget type (highlights active)
 */
function WidgetPalette({ onWidgetSelect, selectedType }) {
  const [expandedCategories, setExpandedCategories] = useState(
    new Set(getWidgetCategories()) // Start all expanded
  );

  const toggleCategory = (category) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  };

  return (
    <Paper
      sx={{
        width: 280,
        maxHeight: "70vh",
        overflow: "auto",
        bgcolor: "#faf6f0",
        border: "1px solid #ead8c4",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: "#f5ece0", borderBottom: "1px solid #ead8c4" }}>
        <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
          📦 Widget Library
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Drag or click to add
        </Typography>
      </Box>

      {/* Categories */}
      <Stack spacing={0} sx={{ flex: 1 }}>
        {getWidgetCategories().map((category) => {
          const widgets = getWidgetsByCategory(category);
          const isExpanded = expandedCategories.has(category);

          return (
            <Box key={category}>
              {/* Category header (collapsible) */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  p: 1.5,
                  bgcolor: "#faf6f0",
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#f5ece0" },
                  borderBottom: "1px solid #ead8c4",
                }}
                onClick={() => toggleCategory(category)}
              >
                <IconButton
                  size="small"
                  sx={{
                    transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)",
                    transition: "transform 0.2s",
                  }}
                >
                  <MdExpandMore size={18} />
                </IconButton>
                <Typography variant="caption" fontWeight={700} sx={{ flexGrow: 1 }}>
                  {category}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: "0.65rem", color: "#999" }}
                >
                  {widgets.length}
                </Typography>
              </Box>

              {/* Widgets in category (collapsible) */}
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Stack spacing={0.75} sx={{ p: 1 }}>
                  {widgets.map((widget) => (
                    <Card
                      key={widget.type}
                      onClick={() => onWidgetSelect(widget.type)}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "copy";
                        e.dataTransfer.setData("widget-type", widget.type);
                      }}
                      sx={{
                        cursor: "grab",
                        border:
                          selectedType === widget.type
                            ? "2px solid"
                            : "1px solid #ead8c4",
                        borderColor:
                          selectedType === widget.type ? "primary.main" : "#ead8c4",
                        bgcolor:
                          selectedType === widget.type ? "action.selected" : "transparent",
                        transition: "all 0.15s ease",
                        "&:hover": {
                          boxShadow: 2,
                          borderColor: "primary.main",
                          bgcolor: "action.hover",
                        },
                        "&:active": {
                          cursor: "grabbing",
                        },
                      }}
                    >
                      <CardActionArea sx={{ p: 1 }}>
                        <Stack spacing={0.5}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.75,
                            }}
                          >
                            <Typography sx={{ fontSize: "1.25rem" }}>
                              {widget.icon}
                            </Typography>
                            <Typography
                              variant="caption"
                              fontWeight={700}
                              sx={{ flexGrow: 1 }}
                            >
                              {widget.name}
                            </Typography>
                            <MdAdd size={14} color="#999" />
                          </Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.65rem", lineHeight: 1.3 }}
                          >
                            {widget.description}
                          </Typography>
                        </Stack>
                      </CardActionArea>
                    </Card>
                  ))}
                </Stack>
              </Collapse>
            </Box>
          );
        })}
      </Stack>

      {/* Footer hint */}
      <Box
        sx={{
          p: 1.5,
          bgcolor: "#f5ece0",
          borderTop: "1px solid #ead8c4",
          fontSize: "0.7rem",
          color: "#999",
          textAlign: "center",
          fontStyle: "italic",
        }}
      >
        💡 Drag widgets to grid or click + edit
      </Box>
    </Paper>
  );
}

export default WidgetPalette;
