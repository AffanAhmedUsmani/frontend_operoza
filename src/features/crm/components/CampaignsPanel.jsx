import { useEffect, useRef, useState } from "react";
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
  Grid,
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

import { createCampaign, fetchCampaigns } from "../services/campaignService";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select (dropdown)" },
  { value: "textarea", label: "Textarea" },
];

function slugify(label) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function makeUniqueKey(baseKey, existingKeys) {
  if (!existingKeys.includes(baseKey)) return baseKey;
  let counter = 2;
  while (existingKeys.includes(`${baseKey}_${counter}`)) counter++;
  return `${baseKey}_${counter}`;
}

const EMPTY_FIELD = {
  label: "",
  key: "",
  type: "text",
  required: false,
  options: "",
};

// ------------------------------------------------------------------
// FieldEditorDialog — add or edit a single field
// ------------------------------------------------------------------
function FieldEditorDialog({ open, initial, existingKeys, onSave, onClose }) {
  const [field, setField] = useState(initial || { ...EMPTY_FIELD });
  const [keyTouched, setKeyTouched] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setField(initial || { ...EMPTY_FIELD });
    setKeyTouched(false);
    setErrors({});
  }, [open, initial]);

  const handleLabelChange = (value) => {
    const newKey = slugify(value);
    setField((prev) => ({
      ...prev,
      label: value,
      key: keyTouched ? prev.key : newKey,
    }));
  };

  const handleKeyChange = (value) => {
    setKeyTouched(true);
    setField((prev) => ({ ...prev, key: slugify(value) || value }));
  };

  const validate = () => {
    const errs = {};
    if (!field.label.trim()) errs.label = "Label is required";
    if (!field.key.trim()) errs.key = "Key is required";
    if (existingKeys.includes(field.key)) errs.key = "Key must be unique";
    if (field.type === "select" && !field.options.trim()) {
      errs.options = "Provide at least one option";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...field, options: field.options });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? "Edit Field" : "Add Field"}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Field label"
            fullWidth
            value={field.label}
            onChange={(e) => handleLabelChange(e.target.value)}
            error={!!errors.label}
            helperText={errors.label}
          />
          <TextField
            label="Field key (auto-generated)"
            fullWidth
            value={field.key}
            onChange={(e) => handleKeyChange(e.target.value)}
            error={!!errors.key}
            helperText={errors.key || "Unique identifier used in the schema"}
          />
          <TextField
            label="Field type"
            select
            fullWidth
            value={field.type}
            onChange={(e) => setField((prev) => ({ ...prev, type: e.target.value }))}
          >
            {FIELD_TYPES.map((ft) => (
              <MenuItem key={ft.value} value={ft.value}>{ft.label}</MenuItem>
            ))}
          </TextField>
          {field.type === "select" && (
            <TextField
              label="Options (comma-separated)"
              fullWidth
              value={field.options}
              onChange={(e) => setField((prev) => ({ ...prev, options: e.target.value }))}
              placeholder="Option A, Option B, Option C"
              helperText={errors.options || "Enter choices separated by commas"}
              error={!!errors.options}
            />
          )}
          <FormControlLabel
            control={
              <Switch
                checked={field.required}
                onChange={(e) => setField((prev) => ({ ...prev, required: e.target.checked }))}
                color="warning"
              />
            }
            label="Required field"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          {initial ? "Save Changes" : "Add Field"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

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
// CampaignBuilder — create a new campaign with dynamic schema
// ------------------------------------------------------------------
function CampaignBuilder({ accessToken, onCreated, onCancel }) {
  const [campaignName, setCampaignName] = useState("");
  const [fields, setFields] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddField = () => {
    setEditingIndex(null);
    setEditorOpen(true);
  };

  const handleEditField = (index) => {
    setEditingIndex(index);
    setEditorOpen(true);
  };

  const handleSaveField = (fieldData) => {
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
      const schemaJson = fields.map(({ label, key, type, required, options }) => {
        const entry = { key, label, type, required };
        if (type === "select") {
          entry.options = options
            ? options.split(",").map((o) => o.trim()).filter(Boolean)
            : [];
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
        onSave={handleSaveField}
        onClose={() => setEditorOpen(false)}
      />
    </Stack>
  );
}

// ------------------------------------------------------------------
// ImportDialog — CSV/Excel coming soon placeholder
// ------------------------------------------------------------------
function ImportDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Import from CSV / Excel</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} alignItems="center" sx={{ py: 2 }}>
          <MdFileUpload size={48} color="#c87941" />
          <Typography variant="h6" textAlign="center">
            Coming Soon
          </Typography>
          <Typography color="text.secondary" textAlign="center">
            CSV and Excel import support is being built. Once the backend endpoint is
            ready, you will be able to upload a spreadsheet here and automatically
            generate a campaign schema from its column headers.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ------------------------------------------------------------------
// CampaignsPanel — list + create entry point
// ------------------------------------------------------------------
function CampaignsPanel({ accessToken }) {
  const [view, setView] = useState("list"); // "list" | "create"
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const hasFetched = useRef(false);

  const loadCampaigns = async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const items = await fetchCampaigns(accessToken);
      setCampaigns(items);
    } catch (err) {
      setLoadError(err.message || "Unable to load campaigns.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true;
      loadCampaigns();
    }
  }, [accessToken]);

  const handleCreated = () => {
    setView("list");
    loadCampaigns();
  };

  if (view === "create") {
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
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<MdFileUpload />}
            onClick={() => setImportOpen(true)}
            sx={{ borderColor: "#c87941", color: "#7c3f17" }}
          >
            Import from CSV / Excel
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
        <Box
          sx={{
            border: "2px dashed #e0d0c0",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
          }}
        >
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No campaigns yet. Create your first campaign or import from a spreadsheet.
          </Typography>
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
        </Box>
      ) : null}

      {!isLoading && campaigns.length > 0 ? (
        <Grid container spacing={2}>
          {campaigns.map((campaign) => (
            <Grid item xs={12} sm={6} md={4} key={campaign.id || campaign.campaign_id || campaign.name}>
              <Card sx={{ border: "1px solid #ead8c4", height: "100%" }}>
                <CardContent>
                  <Stack spacing={1}>
                    <Typography variant="h6" noWrap>{campaign.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Array.isArray(campaign.schema_json) ? campaign.schema_json.length : 0} field
                      {Array.isArray(campaign.schema_json) && campaign.schema_json.length !== 1 ? "s" : ""}
                    </Typography>
                    {Array.isArray(campaign.schema_json) && campaign.schema_json.length > 0 ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {campaign.schema_json.slice(0, 4).map((f) => (
                          <Chip key={f.key} label={f.label} size="small" />
                        ))}
                        {campaign.schema_json.length > 4 ? (
                          <Chip label={`+${campaign.schema_json.length - 4} more`} size="small" variant="outlined" />
                        ) : null}
                      </Stack>
                    ) : null}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : null}

      <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />
    </Stack>
  );
}

export default CampaignsPanel;
