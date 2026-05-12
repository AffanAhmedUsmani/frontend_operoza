import { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdSave, MdClose } from "react-icons/md";
import { getWidgetByType } from "./widgetLibrary";

/**
 * PropertiesPanel — Right sidebar: edit selected widget properties
 * 
 * Progressive disclosure: shows nothing if no widget selected.
 * Shows title editor + basic config JSON editor.
 * 
 * Props:
 *   widget         — selected widget object or null
 *   onUpdate       — (updatedWidget) => void
 *   onClose        — () => void (deselect)
 */
function PropertiesPanel({ widget, onUpdate, onClose }) {
  const [editTitle, setEditTitle] = useState(widget?.title || "");
  const [editConfig, setEditConfig] = useState(
    widget ? JSON.stringify(widget.config_json || {}, null, 2) : ""
  );
  const [configError, setConfigError] = useState(null);

  const meta = widget ? getWidgetByType(widget.type) : null;

  const handleSave = () => {
    try {
      const config = JSON.parse(editConfig);
      onUpdate({
        ...widget,
        title: editTitle || meta.name,
        config_json: config,
      });
      setConfigError(null);
    } catch (err) {
      setConfigError("Invalid JSON: " + err.message);
    }
  };

  if (!widget || !meta) {
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
          alignItems: "center",
          justifyContent: "center",
          p: 3,
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Select a widget to edit its properties.
        </Typography>
      </Paper>
    );
  }

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
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: "1.25rem" }}>{meta.icon}</Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
            {meta.name}
          </Typography>
          <Button
            size="small"
            onClick={onClose}
            startIcon={<MdClose />}
            sx={{ color: "#999" }}
          >
            ×
          </Button>
        </Stack>
      </Box>

      {/* Content */}
      <Stack spacing={2} sx={{ flex: 1, p: 2, overflow: "auto" }}>
        {/* Title editor */}
        <Box>
          <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
            Widget Title
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="e.g., Total Revenue"
            variant="outlined"
          />
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Config editor */}
        <Box>
          <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
            Configuration (JSON)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
            Edit the widget's settings below:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={8}
            size="small"
            value={editConfig}
            onChange={(e) => {
              setEditConfig(e.target.value);
              setConfigError(null);
            }}
            placeholder="{}"
            variant="outlined"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
              },
            }}
          />
          {configError && (
            <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>
              {configError}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Info */}
        <Box sx={{ bgcolor: "#f5ece0", p: 1, borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>Type:</strong> {widget.type}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>ID:</strong> {widget.widget_id}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <strong>Size:</strong> {widget.gridSpan || 1}/3 columns
          </Typography>
        </Box>
      </Stack>

      {/* Footer: Save button */}
      <Box sx={{ p: 2, bgcolor: "#f5ece0", borderTop: "1px solid #ead8c4" }}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          startIcon={<MdSave />}
          onClick={handleSave}
          disabled={!editTitle.trim() || configError !== null}
        >
          Save Changes
        </Button>
      </Box>
    </Paper>
  );
}

export default PropertiesPanel;
