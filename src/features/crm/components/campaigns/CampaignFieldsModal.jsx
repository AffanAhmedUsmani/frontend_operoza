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
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  MdAdd,
  MdArrowDownward,
  MdArrowUpward,
  MdDelete,
  MdEdit,
} from "react-icons/md";
import { updateCampaignSchema } from "../../services/campaignService";
import FieldEditorDialog, { makeUniqueKey } from "./FieldEditorDialog";

export default function CampaignFieldsModal({ open, campaign, accessToken, onSaved, onClose }) {
  const [fields, setFields] = useState([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !campaign) return;
    setFields(Array.isArray(campaign.schema_json) ? [...campaign.schema_json] : []);
    setError("");
    setSaving(false);
  }, [open, campaign]);

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
      setError("Only 2 audio fields are allowed per campaign.");
      setEditorOpen(false);
      return;
    }

    if (editingIndex !== null) {
      setFields((prev) => prev.map((f, i) => (i === editingIndex ? fieldData : f)));
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

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const schemaJson = fields.map(({ label, key, type, required, options, visibility, analysis_profile, max_size_mb, accepted_extensions }) => {
        const entry = { key, label, type, required };
        entry.visibility = Array.isArray(visibility) && visibility.length > 0 ? visibility : ["admin", "agent"];
        if (type === "select") {
          entry.options = Array.isArray(options)
            ? options
            : (options ? options.split(",").map((o) => o.trim()).filter(Boolean) : []);
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
      await updateCampaignSchema(accessToken, campaign.campaign_id, schemaJson);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save fields.");
    } finally {
      setSaving(false);
    }
  };

  const editingField = editingIndex !== null ? fields[editingIndex] : null;
  const existingKeysForEditor = editingIndex !== null
    ? fields.filter((_, i) => i !== editingIndex).map((f) => f.key)
    : fields.map((f) => f.key);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" component="span">Form Fields</Typography>
              {campaign && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                  {campaign.name}
                </Typography>
              )}
            </Box>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MdAdd />}
              onClick={handleAddField}
              sx={{ borderColor: "primary.light", color: "primary.dark" }}
            >
              Add Field
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {fields.length === 0 ? (
            <Box
              sx={{
                border: "2px dashed", borderColor: "divider",
                borderRadius: 2,
                p: 4,
                textAlign: "center",
              }}
            >
              <Typography color="text.secondary">
                No fields defined. Click <strong>Add Field</strong> to build the schema.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1}>
              {fields.map((field, index) => (
                <Card key={field.key} variant="outlined" sx={{ borderColor: "divider" }}>
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
                        {field.required && <Chip label="required" color="warning" size="small" />}
                        {field.type === "select" && field.options && (
                          <Typography variant="caption" color="text.secondary">
                            Options: {Array.isArray(field.options) ? field.options.join(", ") : field.options}
                          </Typography>
                        )}
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
                        <Tooltip title="Edit field">
                          <IconButton size="small" color="primary" onClick={() => handleEditField(index)}>
                            <MdEdit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete field">
                          <IconButton size="small" color="error" onClick={() => handleDeleteField(index)}>
                            <MdDelete />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
            Save Fields
          </Button>
        </DialogActions>
      </Dialog>

      <FieldEditorDialog
        open={editorOpen}
        initial={editingField}
        existingKeys={existingKeysForEditor}
        audioFieldCount={fields.filter((f, i) => i !== editingIndex && f.type === "audio").length}
        audioLimit={2}
        onSave={handleSaveField}
        onClose={() => setEditorOpen(false)}
      />
    </>
  );
}
