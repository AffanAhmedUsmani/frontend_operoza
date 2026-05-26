import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdAdd, MdClose, MdDelete, MdSave } from "react-icons/md";
import { getWidgetByType } from "./widgetLibrary";

const DEFAULT_SALE_FIELDS = [
  "sale.sale_id",
  "sale.lead_name",
  "sale.amount",
  "sale.currency_code",
  "sale.status_code",
  "sale.sold_at",
  "sale.created_at",
  "sale.agent_user_id",
  "payload.customer_name",
  "payload.phone_number",
  "payload.email",
];

function toUniqueList(items) {
  return [...new Set(items.filter(Boolean))];
}

function splitTableColumns(columns) {
  const baseColumns = [];
  const computedColumns = [];

  for (const column of Array.isArray(columns) ? columns : []) {
    if (typeof column === "string") {
      baseColumns.push(column);
      continue;
    }

    if (column && typeof column === "object" && (column.kind === "computed" || column.expression)) {
      computedColumns.push({
        label: String(column.label || "Calculated column").trim(),
        expression: String(column.expression || "").trim(),
      });
    }
  }

  return { baseColumns, computedColumns };
}

function getRowValue(row, ref) {
  if (!row || !ref) {
    return undefined;
  }

  return String(ref)
    .split(".")
    .reduce((value, key) => (value && typeof value === "object" ? value[key] : undefined), row);
}

function buildComputedValue(expression, row) {
  const trimmed = String(expression || "").trim();
  if (!trimmed) {
    return "";
  }

  const transformed = trimmed.replace(/\b([a-zA-Z_]\w*(?:\.[a-zA-Z_]\w+)+)\b/g, (match) => {
    return `get(${JSON.stringify(match)})`;
  });

  try {
    const evaluator = new Function(
      "get",
      "concat",
      "num",
      "round",
      "abs",
      `return (${transformed});`
    );
    const result = evaluator(
      (ref) => getRowValue(row, ref),
      (...parts) => parts.filter((part) => part !== null && part !== undefined).map((part) => String(part)).join(""),
      (value) => Number(value || 0),
      Math.round,
      Math.abs
    );

    if (result === null || result === undefined || result === "") {
      return "";
    }
    return result;
  } catch (_) {
    return "";
  }
}

/**
 * PropertiesPanel — Right sidebar: edit selected widget properties
 *
 * For table widgets, the panel exposes a friendly column editor with:
 * - visible columns
 * - add/remove columns
 * - calculated columns
 * - row/column resize controls
 *
 * For other widgets, the JSON editor remains available.
 */
function PropertiesPanel({ widget, campaign = null, onUpdate, onClose }) {
  const [editTitle, setEditTitle] = useState(widget?.title || "");
  const [editConfig, setEditConfig] = useState(widget ? JSON.stringify(widget.config_json || {}, null, 2) : "");
  const [editWidth, setEditWidth] = useState(String(widget?.gridSpan || 1));
  const [editHeight, setEditHeight] = useState(String(widget?.gridRowSpan || 1));
  const [baseColumns, setBaseColumns] = useState([]);
  const [computedColumns, setComputedColumns] = useState([]);
  const [columnToAdd, setColumnToAdd] = useState("");
  const [newComputedLabel, setNewComputedLabel] = useState("");
  const [newComputedExpression, setNewComputedExpression] = useState("");
  const [configError, setConfigError] = useState(null);

  const meta = widget ? getWidgetByType(widget.type) : null;
  const isTableWidget = widget?.type === "table";

  const availableColumns = useMemo(() => {
    const campaignColumns = Array.isArray(campaign?.schema_json)
      ? campaign.schema_json.flatMap((field) => {
          const key = String(field?.key || "").trim();
          if (!key) return [];
          return [`payload.${key}`];
        })
      : [];

    return toUniqueList([...DEFAULT_SALE_FIELDS, ...campaignColumns]);
  }, [campaign]);

  const selectedColumnSet = useMemo(() => new Set(baseColumns), [baseColumns]);
  const addableColumns = useMemo(
    () => availableColumns.filter((column) => !selectedColumnSet.has(column)),
    [availableColumns, selectedColumnSet]
  );

  useEffect(() => {
    if (!widget) {
      setEditTitle("");
      setEditConfig("");
      setEditWidth("1");
      setEditHeight("1");
      setBaseColumns([]);
      setComputedColumns([]);
      setColumnToAdd("");
      setNewComputedLabel("");
      setNewComputedExpression("");
      setConfigError(null);
      return;
    }

    const config = widget.config_json || {};
    setEditTitle(widget.title || "");
    setEditConfig(JSON.stringify(config, null, 2));
    setEditWidth(String(widget.gridSpan || 1));
    setEditHeight(String(widget.gridRowSpan || 1));
    setConfigError(null);

    if (widget.type === "table") {
      const split = splitTableColumns(config.columns || []);
      setBaseColumns(split.baseColumns.length > 0 ? split.baseColumns : []);
      setComputedColumns(split.computedColumns.length > 0 ? split.computedColumns : []);
    } else {
      setBaseColumns([]);
      setComputedColumns([]);
    }
  }, [widget]);

  const handleSave = () => {
    try {
      const config = JSON.parse(editConfig);
      const width = Math.max(1, Math.min(3, parseInt(editWidth, 10) || 1));
      const height = Math.max(1, Math.min(6, parseInt(editHeight, 10) || 1));
      if (isTableWidget) {
        config.columns = [
          ...baseColumns,
          ...computedColumns
            .filter((column) => column.label.trim() && column.expression.trim())
            .map((column) => ({
              kind: "computed",
              label: column.label.trim(),
              expression: column.expression.trim(),
            })),
        ];
      }

      onUpdate({
        ...widget,
        title: editTitle || meta.name,
        config_json: config,
        gridSpan: width,
        gridRowSpan: height,
      });
      setConfigError(null);
    } catch (err) {
      setConfigError("Invalid JSON: " + err.message);
    }
  };

  const addColumn = () => {
    if (!columnToAdd || selectedColumnSet.has(columnToAdd)) {
      return;
    }
    setBaseColumns((prev) => [...prev, columnToAdd]);
    setColumnToAdd("");
  };

  const removeColumn = (column) => {
    setBaseColumns((prev) => prev.filter((item) => item !== column));
  };

  const addComputedColumn = () => {
    const label = newComputedLabel.trim();
    const expression = newComputedExpression.trim();
    if (!label || !expression) {
      return;
    }

    setComputedColumns((prev) => [...prev, { label, expression }]);
    setNewComputedLabel("");
    setNewComputedExpression("");
  };

  const updateComputedColumn = (index, field, value) => {
    setComputedColumns((prev) => prev.map((item, currentIndex) => (currentIndex === index ? { ...item, [field]: value } : item)));
  };

  const removeComputedColumn = (index) => {
    setComputedColumns((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  if (!widget || !meta) {
    return (
      <Paper
        sx={{
          width: 320,
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

  const selectedColumnOptions = addableColumns;

  return (
    <Paper
      sx={{
        width: 320,
        maxHeight: "70vh",
        overflow: "auto",
        bgcolor: "#faf6f0",
        border: "1px solid #ead8c4",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ p: 2, bgcolor: "#f5ece0", borderBottom: "1px solid #ead8c4" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography sx={{ fontSize: "1.25rem" }}>{meta.icon}</Typography>
          <Typography variant="subtitle2" fontWeight={700} sx={{ flexGrow: 1 }}>
            {meta.name}
          </Typography>
          <Button size="small" onClick={onClose} startIcon={<MdClose />} sx={{ color: "#999" }}>
            ×
          </Button>
        </Stack>
      </Box>

      <Stack spacing={2} sx={{ flex: 1, p: 2, overflow: "auto" }}>
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
          />
        </Box>

        {isTableWidget && (
          <>
            <Divider />
            <Box>
              <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                Visible Columns
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Pick the columns you want to show in the table.
              </Typography>

              <Stack direction="row" spacing={1} sx={{ mb: 1 }} alignItems="flex-start">
                <FormControl fullWidth size="small">
                  <InputLabel id="add-column-label">Add column</InputLabel>
                  <Select
                    labelId="add-column-label"
                    label="Add column"
                    value={columnToAdd}
                    onChange={(e) => setColumnToAdd(e.target.value)}
                  >
                    {selectedColumnOptions.length === 0 ? (
                      <MenuItem value="" disabled>
                        No more columns available
                      </MenuItem>
                    ) : (
                      selectedColumnOptions.map((column) => (
                        <MenuItem key={column} value={column}>
                          {column}
                        </MenuItem>
                      ))
                    )}
                  </Select>
                </FormControl>
                <Button variant="outlined" size="small" onClick={addColumn} startIcon={<MdAdd />} disabled={!columnToAdd}>
                  Add
                </Button>
              </Stack>

              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                {baseColumns.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No columns selected yet.
                  </Typography>
                ) : (
                  baseColumns.map((column) => (
                    <Chip
                      key={column}
                      label={column}
                      onDelete={() => removeColumn(column)}
                      deleteIcon={<MdClose />}
                      sx={{ bgcolor: "#fff7ef", border: "1px solid #ead8c4" }}
                    />
                  ))
                )}
              </Stack>
            </Box>

            <Divider />

            <Box>
              <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
                Calculated Columns
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                Use field references like <strong>sale.amount</strong> or <strong>payload.first_name + " " + payload.last_name</strong>. You can also use <strong>concat(...)</strong> for text.
              </Typography>

              <Stack spacing={1.5}>
                {computedColumns.length === 0 ? (
                  <Typography variant="caption" color="text.secondary">
                    No calculated columns yet.
                  </Typography>
                ) : (
                  computedColumns.map((column, index) => (
                    <Box key={`${column.label}-${index}`} sx={{ border: "1px solid #ead8c4", borderRadius: 1.5, p: 1 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          Column {index + 1}
                        </Typography>
                        <IconButton size="small" onClick={() => removeComputedColumn(index)} aria-label={`Remove calculated column ${column.label}`}>
                          <MdDelete size={16} />
                        </IconButton>
                      </Stack>
                      <Stack spacing={1}>
                        <TextField
                          label="Label"
                          size="small"
                          value={column.label}
                          onChange={(e) => updateComputedColumn(index, "label", e.target.value)}
                          fullWidth
                        />
                        <TextField
                          label="Expression"
                          size="small"
                          value={column.expression}
                          onChange={(e) => updateComputedColumn(index, "expression", e.target.value)}
                          fullWidth
                          multiline
                          minRows={2}
                          placeholder='sale.amount * 1.1 or concat(payload.first_name, " ", payload.last_name)'
                        />
                      </Stack>
                    </Box>
                  ))
                )}

                <Box sx={{ border: "1px dashed #ead8c4", borderRadius: 1.5, p: 1.5 }}>
                  <Stack spacing={1}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Add calculated column
                    </Typography>
                    <TextField
                      label="Label"
                      size="small"
                      value={newComputedLabel}
                      onChange={(e) => setNewComputedLabel(e.target.value)}
                      fullWidth
                      placeholder="e.g. Net Revenue"
                    />
                    <TextField
                      label="Expression"
                      size="small"
                      value={newComputedExpression}
                      onChange={(e) => setNewComputedExpression(e.target.value)}
                      fullWidth
                      multiline
                      minRows={2}
                      placeholder='sale.amount - payload.discount or concat(payload.first_name, " ", payload.last_name)'
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={addComputedColumn}
                      disabled={!newComputedLabel.trim() || !newComputedExpression.trim()}
                      startIcon={<MdAdd />}
                    >
                      Add calculated column
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </>
        )}

        <Divider />

        <Box>
          <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
            Configuration (JSON)
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: "block" }}>
            Advanced settings for this widget.
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

        <Divider />

        <Box>
          <Typography variant="caption" fontWeight={600} display="block" sx={{ mb: 0.5 }}>
            Resize
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Width"
              type="number"
              size="small"
              value={editWidth}
              onChange={(e) => setEditWidth(e.target.value)}
              inputProps={{ min: 1, max: 3 }}
              helperText="1 to 3 columns"
              fullWidth
            />
            <TextField
              label="Height"
              type="number"
              size="small"
              value={editHeight}
              onChange={(e) => setEditHeight(e.target.value)}
              inputProps={{ min: 1, max: 6 }}
              helperText="1 to 6 rows"
              fullWidth
            />
          </Stack>
        </Box>

        <Box sx={{ bgcolor: "#f5ece0", p: 1, borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>Type:</strong> {widget.type}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            <strong>ID:</strong> {widget.widget_id}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <strong>Size:</strong> {widget.gridSpan || 1}/3 columns × {widget.gridRowSpan || 1} rows
          </Typography>
        </Box>
      </Stack>

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
