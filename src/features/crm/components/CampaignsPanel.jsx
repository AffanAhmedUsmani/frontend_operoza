import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdDelete,
  MdEdit,
  MdFileUpload,
  MdPreview,
  MdVisibilityOff,
} from "react-icons/md";

import {
  createCampaign,
  fetchCampaignTemplateDetail,
  fetchCampaignTemplates,
  importCampaignSheet,
} from "../services/campaignService";
import { useCampaigns } from "../hooks/useCampaigns";
import CampaignCard from "./campaigns/CampaignCard";
import CampaignExportModal from "./campaigns/CampaignExportModal";
import CampaignFieldsModal from "./campaigns/CampaignFieldsModal";
import CampaignSettingsModal from "./campaigns/CampaignSettingsModal";
import DeleteCampaignDialog from "./campaigns/DeleteCampaignDialog";
import TeamMembersModal from "./campaigns/TeamMembersModal";
import FieldEditorDialog, {
  EMPTY_FIELD,
  FIELD_TYPES,
  makeUniqueKey,
  slugify,
} from "./campaigns/FieldEditorDialog";
import { normalizeRole, resolveActorContext } from "./sales/salesFormUtils";

// ------------------------------------------------------------------
// PreviewForm — renders the form based on schema
// ------------------------------------------------------------------
function PreviewForm({ fields }) {
  return (
    <Stack spacing={2}>
      {fields.length === 0 ? (
        <Typography color="text.secondary">No fields defined yet.</Typography>
      ) : (
        fields.map((field) => {
          if (field.type === "select") {
            const optionList = field.options
              ? field.options.split(",").map((o) => o.trim()).filter(Boolean)
              : [];
            return (
              <TextField
                key={field.key}
                label={field.label + (field.required ? " *" : "")}
                select
                fullWidth
                defaultValue=""
              >
                {optionList.map((opt) => (
                  <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                ))}
              </TextField>
            );
          }
          if (field.type === "textarea") {
            return (
              <TextField
                key={field.key}
                label={field.label + (field.required ? " *" : "")}
                multiline
                minRows={3}
                fullWidth
              />
            );
          }
          return (
            <TextField
              key={field.key}
              label={field.label + (field.required ? " *" : "")}
              type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
              fullWidth
              InputLabelProps={field.type === "date" ? { shrink: true } : undefined}
            />
          );
        })
      )}
    </Stack>
  );
}

// ------------------------------------------------------------------
// Template field-type helpers (pure functions — defined at module level)
// ------------------------------------------------------------------
function mapTemplateFieldType(templateType) {
  const value = String(templateType || "").trim().toLowerCase();
  if (["number", "integer", "decimal", "currency", "amount"].includes(value)) return "number";
  if (["date", "datetime", "timestamp"].includes(value)) return "date";
  if (["select", "radio", "dropdown", "multiselect"].includes(value)) return "select";
  if (["textarea", "long_text", "notes"].includes(value)) return "textarea";
  if (["audio", "recording", "call_recording"].includes(value)) return "audio";
  return "text";
}

function convertTemplateToBuilderFields(template) {
  const groups = Array.isArray(template?.groups) ? template.groups : [];
  const out = [];
  const usedKeys = new Set();

  for (const group of groups) {
    for (const field of (Array.isArray(group?.fields) ? group.fields : [])) {
      if (!field || typeof field !== "object") continue;
      const label = String(field.label || field.field_code || "").trim();
      const rawKey = String(field.field_code || slugify(label) || "").trim();
      if (!label || !rawKey) continue;

      let key = rawKey;
      let idx = 2;
      while (usedKeys.has(key)) { key = `${rawKey}_${idx}`; idx += 1; }
      usedKeys.add(key);

      out.push({
        ...EMPTY_FIELD,
        label,
        key,
        type: mapTemplateFieldType(field.type),
        required: Boolean(field.required),
        options: Array.isArray(field.options) ? field.options.join(", ") : "",
      });
    }
  }

  return out;
}

// ------------------------------------------------------------------
// CampaignBuilder — create a new campaign with dynamic schema
// ------------------------------------------------------------------
function CampaignBuilder({ accessToken, onCreated, onCancel }) {
  const [campaignName, setCampaignName] = useState("");
  const [fields, setFields] = useState([]);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateCode, setSelectedTemplateCode] = useState("");
  const [selectedTemplateSummary, setSelectedTemplateSummary] = useState(null);
  const [templateError, setTemplateError] = useState("");
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    setTemplatesLoading(true);
    setTemplateError("");

    fetchCampaignTemplates(accessToken)
      .then((items) => {
        if (!active) return;
        setTemplateOptions(items);
      })
      .catch((err) => {
        if (!active) return;
        setTemplateError(err.message || "Unable to load templates.");
      })
      .finally(() => {
        if (!active) return;
        setTemplatesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessToken]);

  const handleApplyTemplate = async () => {
    if (!selectedTemplateCode) {
      setTemplateError("Select a template first.");
      return;
    }

    setTemplateError("");
    setApplyingTemplate(true);
    try {
      const template = await fetchCampaignTemplateDetail(accessToken, selectedTemplateCode);
      if (!template) {
        setTemplateError("Template not found.");
        return;
      }

      const mappedFields = convertTemplateToBuilderFields(template);
      if (mappedFields.length === 0) {
        setTemplateError("Selected template has no usable fields.");
        return;
      }

      setFields(mappedFields);
      setSubmitError("");
      setSubmitSuccess(`Loaded template: ${template.display_name}`);
      if (!campaignName.trim()) {
        setCampaignName(template.display_name || "");
      }
    } catch (err) {
      setTemplateError(err.message || "Unable to apply template.");
    } finally {
      setApplyingTemplate(false);
    }
  };

  const handleAddField = () => {
    setEditingIndex(null);
    setEditorOpen(true);
  };

  const handleEditField = (index) => {
    setEditingIndex(index);
    setEditorOpen(true);
  };

  const handleSaveField = (fieldData) => {
    const audioCountExcludingEdit = fields.filter((f, i) => i !== editingIndex && f.type === "audio").length;
    if (fieldData.type === "audio" && audioCountExcludingEdit >= 2) {
      setSubmitError("Only 2 audio fields are allowed per campaign.");
      setEditorOpen(false);
      return;
    }

    if (editingIndex !== null) {
      setFields((prev) =>
        prev.map((f, i) => (i === editingIndex ? fieldData : f))
      );
    } else {
      const existingKeys = fields.map((f) => f.key);
      const uniqueKey = makeUniqueKey(fieldData.key, existingKeys);
      setFields((prev) => [...prev, { ...fieldData, key: uniqueKey }]);
    }
    setEditorOpen(false);
  };

  const handleDeleteField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    setFields((prev) => {
      const copy = [...prev];
      [copy[index - 1], copy[index]] = [copy[index], copy[index - 1]];
      return copy;
    });
  };

  const handleMoveDown = (index) => {
    if (index === fields.length - 1) return;
    setFields((prev) => {
      const copy = [...prev];
      [copy[index], copy[index + 1]] = [copy[index + 1], copy[index]];
      return copy;
    });
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitSuccess("");

    if (!campaignName.trim()) {
      setSubmitError("Campaign name is required.");
      return;
    }
    if (fields.length === 0) {
      setSubmitError("Add at least one field to the campaign schema.");
      return;
    }

    setIsSubmitting(true);
    try {
      const schemaJson = fields.map(({ label, key, type, required, options, analysis_profile, max_size_mb, accepted_extensions }) => {
        const entry = { key, label, type, required };
        if (type === "select") {
          entry.options = options
            ? options.split(",").map((o) => o.trim()).filter(Boolean)
            : [];
        }
        if (type === "audio") {
          entry.max_size_mb = max_size_mb || 30;
          entry.accepted_extensions = Array.isArray(accepted_extensions)
            ? accepted_extensions
            : [".m4a", ".mp3", ".wav"];
          entry.analysis_profile = analysis_profile || {
            industry: "insurance",
            analysis_type: ["sentiment", "compliance", "summary"],
            checks: [],
            custom_questions: [],
          };
        }
        return entry;
      });
      await createCampaign(accessToken, { name: campaignName.trim(), schema_json: schemaJson });
      setSubmitSuccess("Campaign created successfully!");
      setTimeout(() => onCreated(), 1200);
    } catch (err) {
      setSubmitError(err.message || "Failed to create campaign.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const editingField = editingIndex !== null ? fields[editingIndex] : null;
  const existingKeysForEditor = editingIndex !== null
    ? fields.filter((_, i) => i !== editingIndex).map((f) => f.key)
    : fields.map((f) => f.key);

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} justifyContent="space-between" spacing={1}>
        <Typography variant="h6">New Campaign</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={previewMode ? <MdVisibilityOff /> : <MdPreview />}
            onClick={() => setPreviewMode((v) => !v)}
            sx={{ borderColor: "#c87941", color: "#7c3f17" }}
          >
            {previewMode ? "Edit Mode" : "Preview Form"}
          </Button>
          <Button variant="text" size="small" onClick={onCancel}>
            Cancel
          </Button>
        </Stack>
      </Stack>

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}
      {submitSuccess ? <Alert severity="success">{submitSuccess}</Alert> : null}
      {templateError ? <Alert severity="warning">{templateError}</Alert> : null}

      <Card sx={{ border: "1px solid #ead8c4" }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="subtitle1" fontWeight={600}>
              Start From Template
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              <TextField
                label="Campaign template"
                select
                fullWidth
                size="small"
                value={selectedTemplateCode}
                onChange={(e) => {
                  const code = e.target.value;
                  setSelectedTemplateCode(code);
                  const summary = templateOptions.find((item) => item.template_code === code) || null;
                  setSelectedTemplateSummary(summary);
                }}
                disabled={templatesLoading || applyingTemplate}
                helperText={templatesLoading ? "Loading templates..." : "Choose a predefined industry template."}
              >
                <MenuItem value="">None (custom schema)</MenuItem>
                {templateOptions.map((item) => (
                  <MenuItem key={item.template_code} value={item.template_code}>
                    {item.display_name}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                onClick={handleApplyTemplate}
                disabled={!selectedTemplateCode || templatesLoading || applyingTemplate}
                sx={{ borderColor: "#c87941", color: "#7c3f17", minWidth: 180 }}
              >
                {applyingTemplate ? "Applying..." : "Apply Template"}
              </Button>
            </Stack>

            {selectedTemplateSummary ? (
              <Typography variant="body2" color="text.secondary">
                {selectedTemplateSummary.description}
              </Typography>
            ) : null}
          </Stack>
        </CardContent>
      </Card>

      <TextField
        label="Campaign name"
        fullWidth
        value={campaignName}
        onChange={(e) => setCampaignName(e.target.value)}
        placeholder="e.g. Q3 Outbound Sales"
      />

      <Divider />

      {previewMode ? (
        <Card sx={{ border: "1px solid #ead8c4" }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Form Preview — {campaignName || "Untitled Campaign"}
            </Typography>
            <PreviewForm fields={fields} />
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={600}>
              Form Fields ({fields.length})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdAdd />}
              onClick={handleAddField}
              sx={{ borderColor: "#c87941", color: "#7c3f17" }}
            >
              Add Field
            </Button>
          </Stack>

          {fields.length === 0 ? (
            <Box
              sx={{
                border: "2px dashed #e0d0c0",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                No fields yet. Click <strong>Add Field</strong> to start building the form schema.
              </Typography>
            </Box>
          ) : (
            fields.map((field, index) => (
              <Card key={field.key} variant="outlined" sx={{ borderColor: "#e8d8c8" }}>
                <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap" useFlexGap>
                      <Typography fontWeight={600}>{field.label}</Typography>
                      <Chip label={field.type} size="small" />
                      <Typography variant="caption" color="text.secondary">
                        key: {field.key}
                      </Typography>
                      {field.required ? (
                        <Chip label="required" color="warning" size="small" />
                      ) : null}
                      {field.type === "select" && field.options ? (
                        <Typography variant="caption" color="text.secondary">
                          Options: {field.options}
                        </Typography>
                      ) : null}
                    </Stack>
                    <Stack direction="row" spacing={0.5} flexShrink={0}>
                      <Tooltip title="Move up">
                        <span>
                          <IconButton size="small" onClick={() => handleMoveUp(index)} disabled={index === 0}>
                            <MdArrowUpward />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton size="small" onClick={() => handleMoveDown(index)} disabled={index === fields.length - 1}>
                            <MdArrowDownward />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary" onClick={() => handleEditField(index)}>
                          <MdEdit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeleteField(index)}>
                          <MdDelete />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      )}

      <Box>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isSubmitting}
          sx={{ mr: 1 }}
        >
          {isSubmitting ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
          Create Campaign
        </Button>
        <Button variant="text" onClick={onCancel}>
          Cancel
        </Button>
      </Box>

      <FieldEditorDialog
        open={editorOpen}
        initial={editingField}
        existingKeys={existingKeysForEditor}
        audioFieldCount={fields.filter((f, i) => i !== editingIndex && f.type === "audio").length}
        audioLimit={2}
        onSave={handleSaveField}
        onClose={() => setEditorOpen(false)}
      />
    </Stack>
  );
}

// ------------------------------------------------------------------
// ImportDialog — CSV/Excel coming soon placeholder
// ------------------------------------------------------------------
function ImportDialog({ open, onClose, accessToken, onImported }) {
  const [campaignName, setCampaignName] = useState("");
  const [statusCode, setStatusCode] = useState("draft");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setCampaignName("");
      setStatusCode("draft");
      setFile(null);
      setIsSubmitting(false);
      setError("");
    }
  }, [open]);

  const handleSubmit = async () => {
    setError("");
    if (!file) {
      setError("Please select a CSV or XLSX file.");
      return;
    }

    setIsSubmitting(true);
    try {
      await importCampaignSheet(accessToken, { file, campaignName, statusCode });
      onImported();
      onClose();
    } catch (err) {
      setError(err.message || "Import failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import from CSV / Excel</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label="Campaign name (optional)"
            fullWidth
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            helperText="If blank, filename will be used"
          />
          <TextField
            label="Status"
            select
            fullWidth
            value={statusCode}
            onChange={(e) => setStatusCode(e.target.value)}
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="running">Running</MenuItem>
            <MenuItem value="paused">Paused</MenuItem>
          </TextField>
          <Button variant="outlined" component="label" startIcon={<MdFileUpload />}>
            {file ? file.name : "Choose CSV / XLSX file"}
            <input
              type="file"
              hidden
              accept=".csv,.xlsx,.xlsm,.xltx,.xltm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </Button>
          <Typography variant="body2" color="text.secondary">
            The first row is used as field headers to build campaign schema automatically.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Importing..." : "Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ------------------------------------------------------------------
// ------------------------------------------------------------------
// CampaignsPanel — orchestrator (create + list with modular sub-components)
// ------------------------------------------------------------------
function CampaignsPanel({ accessToken }) {
  const [view, setView] = useState("list"); // "list" | "create"
  const [importOpen, setImportOpen] = useState(false);
  const [teamTarget, setTeamTarget] = useState(null);
  const [fieldsTarget, setFieldsTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [settingsTarget, setSettingsTarget] = useState(null);
  const [exportTarget, setExportTarget] = useState(null);

  const userRole = resolveActorContext(accessToken).role;
  const canManageCampaigns = ["admin", "team_lead"].includes(userRole);

  const { campaigns, loading: isLoading, error: loadError, reload: loadCampaigns } = useCampaigns(accessToken);

  const handleCreated = () => {
    setView("list");
    loadCampaigns();
  };

  if (view === "create" && canManageCampaigns) {
    return (
      <CampaignBuilder
        accessToken={accessToken}
        onCreated={handleCreated}
        onCancel={() => setView("list")}
      />
    );
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ sm: "center" }}
        justifyContent="space-between"
        spacing={1}
      >
        <Typography variant="h6">Campaigns</Typography>
        {canManageCampaigns ? (
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdFileUpload />}
              onClick={() => setImportOpen(true)}
              sx={{ borderColor: "#c87941", color: "#7c3f17" }}
            >
              Import CSV / Excel
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<MdAdd />}
              onClick={() => setView("create")}
            >
              New Campaign
            </Button>
          </Stack>
        ) : null}
      </Stack>

      {loadError ? (
        <Alert severity="error" action={<Button size="small" onClick={loadCampaigns}>Retry</Button>}>
          {loadError}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress />
        </Stack>
      ) : null}

      {!isLoading && !loadError && campaigns.length === 0 ? (
        <Box sx={{ border: "2px dashed #e0d0c0", borderRadius: 2, p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {canManageCampaigns
              ? "No campaigns yet. Create your first campaign or import from a spreadsheet."
              : "No campaigns are currently assigned to you."}
          </Typography>
          {canManageCampaigns ? (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="center">
              <Button variant="contained" startIcon={<MdAdd />} onClick={() => setView("create")}>
                Create Campaign
              </Button>
              <Button
                variant="outlined"
                startIcon={<MdFileUpload />}
                onClick={() => setImportOpen(true)}
                sx={{ borderColor: "#c87941", color: "#7c3f17" }}
              >
                Import from CSV / Excel
              </Button>
            </Stack>
          ) : null}
        </Box>
      ) : null}

      {!isLoading && campaigns.length > 0 ? (
        <Stack spacing={2} sx={{ width: "100%", maxWidth: 1280, mx: "auto" }}>
          {campaigns.map((campaign) => (
            <Box key={campaign.campaign_id || campaign.name} sx={{ width: "100%" }}>
              <CampaignCard
                campaign={campaign}
                accessToken={accessToken}
                userRole={userRole}
                onViewTeam={(c) => setTeamTarget(c)}
                onEditFields={(c) => setFieldsTarget(c)}
                onDeleteCampaign={(c) => setDeleteTarget(c)}
                onOpenSettings={(c) => setSettingsTarget(c)}
                onOpenExport={(c) => setExportTarget(c)}
              />
            </Box>
          ))}
        </Stack>
      ) : null}

      {canManageCampaigns ? (
        <ImportDialog
          open={importOpen}
          onClose={() => setImportOpen(false)}
          accessToken={accessToken}
          onImported={loadCampaigns}
        />
      ) : null}

      <TeamMembersModal
        open={!!teamTarget}
        campaign={teamTarget}
        accessToken={accessToken}
        onSaved={loadCampaigns}
        onClose={() => setTeamTarget(null)}
      />

      <DeleteCampaignDialog
        open={!!deleteTarget}
        campaign={deleteTarget}
        accessToken={accessToken}
        onDeleted={() => { loadCampaigns(); setDeleteTarget(null); }}
        onClose={() => setDeleteTarget(null)}
      />

      <CampaignSettingsModal
        open={!!settingsTarget}
        campaign={settingsTarget}
        accessToken={accessToken}
        onSaved={loadCampaigns}
        onClose={() => setSettingsTarget(null)}
      />

      <CampaignExportModal
        open={!!exportTarget}
        campaign={exportTarget}
        accessToken={accessToken}
        onClose={() => setExportTarget(null)}
      />

      <CampaignFieldsModal
        open={!!fieldsTarget}
        campaign={fieldsTarget}
        accessToken={accessToken}
        onSaved={loadCampaigns}
        onClose={() => setFieldsTarget(null)}
      />
    </Stack>
  );
}

export default CampaignsPanel;
