import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormControl,
  FormGroup,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

const WIDGET_TYPES = [
  {
    value: "metric",
    label: "Metric",
    description: "A single computed number from a formula (e.g. total sales amount).",
  },
  {
    value: "table",
    label: "Table",
    description: "Paginated table of individual sale records.",
  },
  {
    value: "chart",
    label: "Bar Chart",
    description: "Group and aggregate sales by a field (e.g. status, campaign, agent).",
  },
];

const SALE_FIELDS = [
  "sale.amount",
  "sale.status_code",
  "sale.lead_name",
  "sale.currency_code",
  "sale.agent_user_id",
  "sale.sold_at",
  "sale.created_at",
];

const CHART_AGGREGATE_OPTIONS = [
  { value: "COUNT", label: "COUNT — number of records" },
  { value: "SUM", label: "SUM — sum of a numeric field" },
];

const CHART_VARIANTS = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "pie", label: "Pie" },
];

const FORMULA_HINT = `Examples:
  COUNT(*)
  SUM(sale.amount)
  SUM(sale.amount WHERE sale.status_code == "won")
  AVG(sale.amount) * 1.1`;

const EMPTY_FORM = {
  title: "",
  type: "metric",
  formula: "",
  page_size: "50",
  editable: true,
  columns: [],
  group_by: "sale.status_code",
  aggregate: "COUNT",
  aggregate_field: "sale.amount",
  chart_variant: "bar",
};

/**
 * WidgetFormDialog
 *
 * Props:
 *   open        — boolean
 *   initialData — widget result object to pre-fill (edit mode); null for add mode
 *   onClose     — () => void
 *   onSubmit    — async (payload) => void
 *   saving      — boolean — show spinner on Save button
 *   error       — string | null — API error to show
 */
function WidgetFormDialog({ open, initialData, campaign = null, onClose, onSubmit, saving = false, error = null }) {
  const isEdit = !!initialData;
  const [form, setForm] = useState(EMPTY_FORM);

  // Pre-fill form when editing
  useEffect(() => {
    if (!open) return;
    if (initialData) {
      const cfg = initialData.config_json || {};
      setForm({
        title: initialData.title || "",
        type: initialData.type || "metric",
        formula: cfg.formula || "",
        page_size: String(cfg.page_size || "50"),
        editable: typeof cfg.editable === "boolean" ? cfg.editable : true,
        columns: Array.isArray(cfg.columns) ? cfg.columns : [],
        group_by: cfg.group_by || "sale.status_code",
        aggregate: cfg.aggregate || "COUNT",
        aggregate_field: cfg.aggregate_field || "sale.amount",
        chart_variant: cfg.chart_variant || "bar",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, initialData]);

  const set = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  // Build the list of column references available for table column picker
  const availableColumns = useMemo(() => {
    const schemaFields = (Array.isArray(campaign?.schema_json) ? campaign.schema_json : []).map(
      (f) => {
        const key = f.key || f.field_code || "";
        return key ? `payload.${key}` : null;
      }
    ).filter(Boolean);
    return [...SALE_FIELDS, ...schemaFields];
  }, [campaign]);

  const toggleColumn = (ref) => {
    setForm((prev) => {
      const cols = prev.columns.includes(ref)
        ? prev.columns.filter((c) => c !== ref)
        : [...prev.columns, ref];
      return { ...prev, columns: cols };
    });
  };

  const handleSubmit = () => {
    const config_json = {};
    if (form.type === "metric") {
      config_json.formula = form.formula.trim();
    } else if (form.type === "table") {
      config_json.page_size = parseInt(form.page_size, 10) || 50;
      config_json.editable = Boolean(form.editable);
      if (form.columns.length > 0) {
        config_json.columns = form.columns;
      }
    } else if (form.type === "chart") {
      config_json.group_by = form.group_by;
      config_json.aggregate = form.aggregate;
      config_json.chart_variant = form.chart_variant;
      if (form.aggregate === "SUM") {
        config_json.aggregate_field = form.aggregate_field;
      }
    }

    onSubmit({
      title: form.title.trim(),
      type: form.type,
      config_json,
    });
  };

  const canSubmit = form.title.trim().length > 0 && !saving;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="widget-dialog-title"
    >
      <DialogTitle id="widget-dialog-title">
        {isEdit ? "Edit Widget" : "Add Widget"}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ pt: 0.5 }}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Title */}
          <TextField
            label="Widget title"
            value={form.title}
            onChange={set("title")}
            fullWidth
            required
            autoFocus
            inputProps={{ maxLength: 180, "aria-required": "true" }}
            helperText="Name shown on the widget card header."
          />

          {/* Type — only changeable in add mode */}
          <FormControl fullWidth>
            <InputLabel id="widget-type-label">Widget type</InputLabel>
            <Select
              labelId="widget-type-label"
              label="Widget type"
              value={form.type}
              onChange={set("type")}
              disabled={isEdit}
            >
              {WIDGET_TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  <Stack spacing={0}>
                    <Typography variant="body2" fontWeight={700}>
                      {t.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t.description}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
            {isEdit && (
              <FormHelperText>Widget type cannot be changed after creation.</FormHelperText>
            )}
          </FormControl>

          {/* Metric — formula */}
          {form.type === "metric" && (
            <TextField
              label="Formula"
              value={form.formula}
              onChange={set("formula")}
              fullWidth
              multiline
              minRows={2}
              maxRows={5}
              inputProps={{ maxLength: 500, "aria-label": "Formula expression" }}
              helperText={
                <span style={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: "0.7rem" }}>
                  {FORMULA_HINT}
                </span>
              }
            />
          )}

          {/* Table — page size */}
          {form.type === "table" && (
            <>
              <TextField
                label="Rows per page"
                type="number"
                value={form.page_size}
                onChange={set("page_size")}
                fullWidth
                inputProps={{ min: 1, max: 200, "aria-label": "Rows per page" }}
                helperText="Maximum 200 rows per page."
              />
              <FormControlLabel
                control={<Switch checked={Boolean(form.editable)} onChange={(e) => setForm((prev) => ({ ...prev, editable: e.target.checked }))} />}
                label="Allow inline field edits in table"
              />
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                  Columns to display — leave all unchecked to show every available column
                </Typography>
                <FormGroup
                  sx={{
                    maxHeight: 200,
                    overflowY: "auto",
                    border: "1px solid", borderColor: "divider",
                    borderRadius: 1.5,
                    px: 1.5,
                    py: 0.5,
                  }}
                >
                  {availableColumns.map((ref) => (
                    <FormControlLabel
                      key={ref}
                      control={
                        <Checkbox
                          size="small"
                          checked={form.columns.includes(ref)}
                          onChange={() => toggleColumn(ref)}
                        />
                      }
                      label={<Typography variant="body2">{ref}</Typography>}
                    />
                  ))}
                </FormGroup>
              </Box>
            </>
          )}

          {/* Chart — group_by + aggregate */}
          {form.type === "chart" && (
            <>
              <FormControl fullWidth>
                <InputLabel id="group-by-label">Group by field</InputLabel>
                <Select
                  labelId="group-by-label"
                  label="Group by field"
                  value={form.group_by}
                  onChange={set("group_by")}
                >
                  {SALE_FIELDS.map((f) => (
                    <MenuItem key={f} value={f}>
                      {f}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>The field used to bucket records into chart bars.</FormHelperText>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="aggregate-label">Aggregate</InputLabel>
                <Select
                  labelId="aggregate-label"
                  label="Aggregate"
                  value={form.aggregate}
                  onChange={set("aggregate")}
                >
                  {CHART_AGGREGATE_OPTIONS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="chart-variant-label">Chart style</InputLabel>
                <Select
                  labelId="chart-variant-label"
                  label="Chart style"
                  value={form.chart_variant}
                  onChange={set("chart_variant")}
                >
                  {CHART_VARIANTS.map((o) => (
                    <MenuItem key={o.value} value={o.value}>
                      {o.label}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Choose the visual style for this chart widget.</FormHelperText>
              </FormControl>

              {form.aggregate === "SUM" && (
                <FormControl fullWidth>
                  <InputLabel id="agg-field-label">Sum field</InputLabel>
                  <Select
                    labelId="agg-field-label"
                    label="Sum field"
                    value={form.aggregate_field}
                    onChange={set("aggregate_field")}
                  >
                    {SALE_FIELDS.filter((f) => f !== "sale.status_code").map((f) => (
                      <MenuItem key={f} value={f}>
                        {f}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Numeric field to sum within each group.</FormHelperText>
                </FormControl>
              )}
            </>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          aria-label={isEdit ? "Save widget changes" : "Add widget"}
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Widget"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WidgetFormDialog;
