import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdAdd, MdArrowBack, MdDelete } from "react-icons/md";

import { createCampaign } from "../services/campaignService";

const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select (dropdown)" },
];

function emptyField() {
  return { label: "", key: "", type: "text", required: false, options: "" };
}

function CampaignCreatePanel({ accessToken, onBack, onCreated }) {
  const [name, setName] = useState("");
  const [fields, setFields] = useState([emptyField()]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const updateField = (index, patch) => {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  };

  const addField = () => setFields((prev) => [...prev, emptyField()]);

  const removeField = (index) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-generate key from label (snake_case)
  const handleLabelChange = (index, value) => {
    const autoKey = value
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    updateField(index, { label: value, key: autoKey });
  };

  const buildSchemaJson = () =>
    fields
      .filter((f) => f.label.trim() && f.key.trim())
      .map((f) => {
        const entry = { key: f.key, label: f.label, type: f.type, required: f.required };
        if (f.type === "select" && f.options.trim()) {
          entry.options = f.options
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean);
        }
        return entry;
      });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    const schemaJson = buildSchemaJson();
    if (schemaJson.length === 0) {
      setErrorMessage("Add at least one valid field (label + key required).");
      return;
    }

    setSubmitting(true);
    try {
      await createCampaign(accessToken, { name: name.trim(), schemaJson });
      onCreated();
    } catch (err) {
      setErrorMessage(err.message || "Unable to create campaign.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title="Back to campaigns">
          <IconButton size="small" onClick={onBack}>
            <MdArrowBack />
          </IconButton>
        </Tooltip>
        <Typography variant="h6">New Campaign</Typography>
      </Stack>

      {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

      <Card sx={{ border: "1px solid #ead8c4" }}>
        <CardContent>
          <Stack component="form" spacing={3} onSubmit={handleSubmit}>
            {/* Campaign name */}
            <TextField
              label="Campaign name"
              fullWidth
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Q3 Outbound Sales"
            />

            {/* Schema builder */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2">Lead Fields (Schema)</Typography>
                <Button size="small" startIcon={<MdAdd />} onClick={addField} variant="outlined">
                  Add Field
                </Button>
              </Stack>

              <Stack spacing={1.5}>
                {fields.map((field, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{ border: "1px solid #e0d6cc", background: "#fdf9f5" }}
                  >
                    <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                      <Grid container spacing={1.5} alignItems="flex-start">
                        <Grid item xs={12} sm={4}>
                          <TextField
                            label="Field label"
                            fullWidth
                            size="small"
                            value={field.label}
                            onChange={(e) => handleLabelChange(index, e.target.value)}
                            placeholder="e.g. Full Name"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Key (auto)"
                            fullWidth
                            size="small"
                            value={field.key}
                            onChange={(e) => updateField(index, { key: e.target.value.replace(/\s+/g, "_").replace(/[^a-z0-9_]/gi, "") })}
                            placeholder="e.g. full_name"
                          />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <TextField
                            label="Type"
                            select
                            fullWidth
                            size="small"
                            value={field.type}
                            onChange={(e) => updateField(index, { type: e.target.value })}
                          >
                            {FIELD_TYPES.map((t) => (
                              <MenuItem key={t.value} value={t.value}>
                                {t.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        <Grid item xs={12} sm={1} sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                          <Tooltip title="Remove field">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeField(index)}
                                disabled={fields.length === 1}
                              >
                                <MdDelete />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Grid>

                        {/* Options input for select type */}
                        {field.type === "select" && (
                          <Grid item xs={12}>
                            <TextField
                              label="Options (comma-separated)"
                              fullWidth
                              size="small"
                              value={field.options}
                              onChange={(e) => updateField(index, { options: e.target.value })}
                              placeholder="e.g. Interested, Not Interested, Callback"
                              helperText="Enter each option separated by a comma."
                            />
                          </Grid>
                        )}

                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size="small"
                                checked={field.required}
                                onChange={(e) => updateField(index, { required: e.target.checked })}
                                color="warning"
                              />
                            }
                            label={<Typography variant="caption">Required field</Typography>}
                            sx={{ ml: 0 }}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </Box>

            <Stack direction="row" spacing={1.5}>
              <Button
                type="submit"
                variant="contained"
                disabled={!name.trim() || submitting}
              >
                {submitting ? "Creating…" : "Create Campaign"}
              </Button>
              <Button variant="text" onClick={onBack} disabled={submitting}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

export default CampaignCreatePanel;
