import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdHelpOutline } from "react-icons/md";
import { createReport, updateReport, validateReportConfig } from "../../services/reportingService";

// Sprint 19 (docs/SPRINT_PLAN.md) - static, always-on formula cheat-sheet
// with worked examples, matching crm/formula_engine.py's actual
// whitelist exactly (SUM/COUNT/AVG, optional WHERE with AND/OR, root
// namespaces sale/payload/audio) - never show an example the engine
// wouldn't actually accept.
const FORMULA_EXAMPLES = [
  { formula: "SUM(sale.amount)", note: "Total of a numeric field" },
  { formula: "COUNT(*)", note: "Row count" },
  { formula: "AVG(sale.amount)", note: "Average of a numeric field" },
  { formula: "SUM(sale.amount WHERE sale.status_code == \"won\")", note: "Total, filtered to matching rows" },
  { formula: "COUNT(*) WHERE payload.premium > 100", note: "Count with a numeric condition" },
  { formula: "SUM(sale.amount WHERE sale.status_code == \"won\" AND payload.tier == \"gold\")", note: "Combine conditions with AND/OR" },
];

const BASE_SALE_COLUMNS = [
  { key: "lead_name", label: "Lead Name", source: "sale.lead_name", type: "text" },
  { key: "agent_user_id", label: "Agent", source: "sale.agent_user_id", type: "text" },
  { key: "status_code", label: "Status", source: "sale.status_code", type: "text" },
  { key: "amount", label: "Amount", source: "sale.amount", type: "number" },
  { key: "sold_at", label: "Sold At", source: "sale.sold_at", type: "datetime" },
  { key: "created_at", label: "Created At", source: "sale.created_at", type: "datetime" },
  { key: "updated_at", label: "Updated At", source: "sale.updated_at", type: "datetime" },
];

function buildPayloadColumns(schemaFields) {
  if (!Array.isArray(schemaFields)) return [];
  return schemaFields
    .map((field) => {
      const key = String(field?.key || "").trim();
      const label = String(field?.label || key).trim();
      const type = String(field?.type || "text").toLowerCase();
      if (!key) return null;
      return {
        key,
        label,
        source: `payload.${key}`,
        type,
      };
    })
    .filter(Boolean);
}

function normalizeColumn(rawCol) {
  if (!rawCol || typeof rawCol !== "object") return null;
  const key = String(rawCol.key || "").trim();
  const source = String(rawCol.source || "").trim();
  const formula = String(rawCol.formula || "").trim();
  if (!key || (!source && !formula)) return null;
  return {
    key,
    label: String(rawCol.label || key).trim() || key,
    source,
    formula,
    type: String(rawCol.type || "text").trim().toLowerCase() || "text",
    visible: rawCol.visible !== false,
    exportable: rawCol.exportable !== false,
    optional: !!rawCol.optional,
    required: !!rawCol.required,
  };
}

export default function ReportBuilder({ open, onClose, accessToken, report, canCreate, onSaved, campaigns = [] }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [draggedAvailableKey, setDraggedAvailableKey] = useState("");
  const [draggedSelectedIndex, setDraggedSelectedIndex] = useState(-1);
  const [validation, setValidation] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Sprint 19 (docs/SPRINT_PLAN.md) - Report Builder previously had no
  // way at all to add a formula column (only source-based fields could
  // be dragged in), even though the backend engine already supported
  // SUM/COUNT/AVG formulas - this closes that gap so "a report
  // containing at least one formula column" is actually buildable.
  const [formulaLabel, setFormulaLabel] = useState("");
  const [formulaExpression, setFormulaExpression] = useState("");
  const [formulaError, setFormulaError] = useState("");

  const selectedCampaign = campaigns.find((item) => String(item.campaign_id) === String(campaignId));

  const availableColumns = (() => {
    const payloadColumns = buildPayloadColumns(selectedCampaign?.schema_json || []);
    const map = new Map();
    [...BASE_SALE_COLUMNS, ...payloadColumns, ...selectedColumns].forEach((col) => {
      if (!col?.key) return;
      map.set(col.key, { ...col });
    });
    return Array.from(map.values());
  })();

  useEffect(() => {
    const cfg = report?.config_json || {};
    const dataSource = cfg?.data_source || {};
    const campaignIds = Array.isArray(dataSource?.campaign_ids) ? dataSource.campaign_ids : [];
    const normalizedColumns = Array.isArray(cfg.columns)
      ? cfg.columns.map(normalizeColumn).filter(Boolean)
      : [];

    setName(report?.name || "");
    setDescription(report?.description || "");
    setCampaignId(report?.campaign_id || campaignIds[0] || campaigns?.[0]?.campaign_id || "");
    setSelectedColumns(normalizedColumns);
    if (!normalizedColumns.length) {
      setSelectedColumns(BASE_SALE_COLUMNS.slice(0, 4));
    }
    setValidation(null);
    setError("");
  }, [report, open, campaigns]);

  const buildConfig = () => ({
    data_source: {
      entity: "sale",
      campaign_ids: campaignId ? [String(campaignId)] : [],
      scope: "campaign",
    },
    columns: selectedColumns
      .map((col) => normalizeColumn(col))
      .filter(Boolean),
  });

  const addColumnByKey = (key) => {
    const normalizedKey = String(key || "").trim();
    if (!normalizedKey) return;
    if (selectedColumns.some((col) => col.key === normalizedKey)) return;
    const found = availableColumns.find((col) => col.key === normalizedKey);
    if (!found) return;
    setSelectedColumns((prev) => [...prev, normalizeColumn(found)].filter(Boolean));
  };

  const removeColumnByKey = (key) => {
    setSelectedColumns((prev) => prev.filter((col) => col.key !== key));
  };

  const moveSelectedColumn = (fromIndex, toIndex) => {
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
    setSelectedColumns((prev) => {
      if (fromIndex >= prev.length || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const addFormulaColumn = () => {
    const label = formulaLabel.trim();
    const formula = formulaExpression.trim();
    setFormulaError("");
    if (!label) {
      setFormulaError("Give the column a name.");
      return;
    }
    if (!formula) {
      setFormulaError("Enter a formula - see the examples above.");
      return;
    }
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || `formula_${selectedColumns.length}`;
    if (selectedColumns.some((col) => col.key === key)) {
      setFormulaError("A column with that name already exists.");
      return;
    }
    setSelectedColumns((prev) => [
      ...prev,
      normalizeColumn({ key, label, formula, type: "number" }),
    ].filter(Boolean));
    setFormulaLabel("");
    setFormulaExpression("");
  };

  const handleValidate = async () => {
    setError("");
    setValidation(null);
    try {
      const payload = {
        report_id: report?.report_id || null,
        name,
        description,
        campaign_id: campaignId || null,
        config_json: buildConfig(),
      };
      const result = await validateReportConfig(accessToken, payload);
      setValidation(result);
    } catch (err) {
      setError(err.message || "Validation failed.");
    }
  };

  const handleSave = async () => {
    if (!canCreate && !report?.report_id) {
      setError("You do not have permission to create reports.");
      return;
    }
    if (!String(name || "").trim()) {
      setError("Report name is required.");
      return;
    }
    if (!campaignId) {
      setError("Please select a campaign.");
      return;
    }
    if (!selectedColumns.length) {
      setError("Please add at least one column.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = {
        name: String(name || "").trim(),
        description: String(description || "").trim(),
        campaign_id: campaignId,
        config_json: buildConfig(),
      };
      if (report?.report_id) {
        await updateReport(accessToken, report.report_id, payload);
      } else {
        await createReport(accessToken, payload);
      }
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{report?.report_id ? "Edit Report" : "Create Report"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          <TextField
            label="Report Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel id="campaign-label">Campaign</InputLabel>
            <Select
              labelId="campaign-label"
              value={campaignId}
              label="Campaign"
              onChange={(e) => setCampaignId(e.target.value)}
            >
              {campaigns.map((entry) => (
                <MenuItem key={entry.campaign_id} value={entry.campaign_id}>{entry.name}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Columns</Typography>
                <Typography variant="caption" color="text.secondary">
                  Drag from available columns and drop into selected columns. Drag inside selected columns to reorder.
                </Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <Box sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1 }}>
                    <Typography variant="caption" color="text.secondary">Available Columns</Typography>
                    <List dense sx={{ maxHeight: 220, overflowY: "auto" }}>
                      {availableColumns.map((col) => {
                        const selected = selectedColumns.some((item) => item.key === col.key);
                        return (
                          <ListItem
                            key={col.key}
                            draggable={!selected}
                            onDragStart={() => setDraggedAvailableKey(col.key)}
                            onDragEnd={() => setDraggedAvailableKey("")}
                            secondaryAction={
                              <Button size="small" disabled={selected} onClick={() => addColumnByKey(col.key)}>
                                Add
                              </Button>
                            }
                          >
                            <ListItemText
                              primary={col.label}
                              secondary={`${col.key} • ${col.type}`}
                              primaryTypographyProps={{ variant: "body2" }}
                              secondaryTypographyProps={{ variant: "caption" }}
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  </Box>

                  <Box
                    sx={{ flex: 1, border: "1px solid", borderColor: "divider", borderRadius: 1, p: 1, minHeight: 220 }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (draggedAvailableKey) addColumnByKey(draggedAvailableKey);
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">Selected Columns</Typography>
                    {selectedColumns.length ? (
                      <List dense>
                        {selectedColumns.map((col, index) => (
                          <ListItem
                            key={col.key}
                            draggable
                            onDragStart={() => setDraggedSelectedIndex(index)}
                            onDragOver={(event) => {
                              event.preventDefault();
                              if (draggedSelectedIndex >= 0 && draggedSelectedIndex !== index) {
                                moveSelectedColumn(draggedSelectedIndex, index);
                                setDraggedSelectedIndex(index);
                              }
                            }}
                            onDragEnd={() => setDraggedSelectedIndex(-1)}
                            secondaryAction={
                              <Button size="small" color="error" onClick={() => removeColumnByKey(col.key)}>
                                Remove
                              </Button>
                            }
                          >
                            <ListItemText
                              primary={col.label}
                              secondary={`${col.key} • ${col.type}`}
                              primaryTypographyProps={{ variant: "body2" }}
                              secondaryTypographyProps={{ variant: "caption" }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Drop columns here.
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {selectedColumns.map((col) => (
                    <Chip
                      key={col.key}
                      label={col.formula ? `ƒ ${col.label}` : col.label}
                      onDelete={() => removeColumnByKey(col.key)}
                      size="small"
                      color={col.formula ? "secondary" : "default"}
                    />
                  ))}
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Formula column + cheat-sheet (Sprint 19 - docs/SPRINT_PLAN.md's
              static, always-on in-app guidance layer) */}
          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack spacing={1.5}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography variant="subtitle2">Formula Column</Typography>
                  <Tooltip
                    title={
                      <Stack spacing={0.5}>
                        {FORMULA_EXAMPLES.map((ex) => (
                          <Typography key={ex.formula} variant="caption" component="div">
                            <code>{ex.formula}</code> — {ex.note}
                          </Typography>
                        ))}
                      </Stack>
                    }
                    placement="right"
                  >
                    <Box component="span" sx={{ display: "inline-flex", cursor: "help" }}>
                      <MdHelpOutline size={16} />
                    </Box>
                  </Tooltip>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Add a computed column using SUM/COUNT/AVG, optionally filtered with WHERE. Hover
                  the (?) above for worked examples.
                </Typography>
                {formulaError ? <Alert severity="error">{formulaError}</Alert> : null}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    label="Column name"
                    placeholder="Total Revenue"
                    value={formulaLabel}
                    onChange={(e) => setFormulaLabel(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Formula"
                    placeholder='SUM(sale.amount WHERE sale.status_code == "won")'
                    value={formulaExpression}
                    onChange={(e) => setFormulaExpression(e.target.value)}
                    fullWidth
                  />
                  <Button variant="outlined" onClick={addFormulaColumn} sx={{ whiteSpace: "nowrap" }}>
                    Add Formula Column
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          <Card sx={{ border: "1px solid", borderColor: "divider" }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2">Config Validation</Typography>
                {validation?.valid ? <Chip size="small" color="success" label="Valid" /> : null}
              </Stack>
              <Button variant="outlined" onClick={handleValidate}>Validate Config</Button>
              {validation?.errors?.length ? (
                <Box sx={{ mt: 1 }}>
                  {validation.errors.map((entry, idx) => (
                    <Typography key={`${entry}-${idx}`} variant="body2" color="error">• {entry}</Typography>
                  ))}
                </Box>
              ) : null}
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {report?.report_id ? "Save Changes" : "Create Report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
