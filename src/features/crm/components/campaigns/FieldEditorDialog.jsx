import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { MdClose, MdDragIndicator } from "react-icons/md";

export const FIELD_TYPES = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "select", label: "Select (dropdown)" },
  { value: "textarea", label: "Textarea" },
  { value: "audio", label: "Audio (MP3 / Call Recording)" },
];

const AUDIO_CHECK_LIBRARY = [
  {
    group: "Sentiment & Summary",
    items: [
      { id: "overall_sentiment", label: "Overall sentiment score" },
      { id: "call_summary", label: "Call summary" },
      { id: "next_step_summary", label: "Suggested next steps" },
    ],
  },
  {
    group: "Compliance & Confirmation",
    items: [
      { id: "consent_confirmed", label: "Consent / authorization confirmed" },
      { id: "identity_verified", label: "Identity verification asked" },
      { id: "yes_to_offer", label: "Customer said yes to product/offer" },
    ],
  },
  {
    group: "Industry Signals",
    items: [
      { id: "insurance_keywords", label: "Insurance intent and policy keywords" },
      { id: "medical_keywords", label: "Medical context keywords" },
      { id: "solar_keywords", label: "Solar/roofing qualification keywords" },
    ],
  },
];

const ANALYSIS_TYPES = ["sentiment", "compliance", "summary"];

const ALL_CHECK_ITEMS = AUDIO_CHECK_LIBRARY.flatMap((group) => group.items);
const CHECK_LABEL_MAP = Object.fromEntries(ALL_CHECK_ITEMS.map((item) => [item.id, item.label]));

function defaultAudioProfile(source) {
  return {
    industry: source?.industry || "insurance",
    analysis_type: Array.isArray(source?.analysis_type) && source.analysis_type.length
      ? source.analysis_type
      : ["sentiment", "compliance", "summary"],
    checks: Array.isArray(source?.checks) ? source.checks : [],
    custom_questions: Array.isArray(source?.custom_questions) ? source.custom_questions : [],
  };
}

export const EMPTY_FIELD = {
  label: "",
  key: "",
  type: "text",
  required: false,
  options: "",
  visibility: ["admin", "agent"],
  analysis_profile: defaultAudioProfile(),
  max_size_mb: 30,
  accepted_extensions: [".m4a", ".mp3", ".wav"],
};

export function slugify(label) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function makeUniqueKey(baseKey, existingKeys) {
  if (!existingKeys.includes(baseKey)) return baseKey;
  let counter = 2;
  while (existingKeys.includes(`${baseKey}_${counter}`)) counter++;
  return `${baseKey}_${counter}`;
}

export default function FieldEditorDialog({
  open,
  initial,
  existingKeys,
  audioFieldCount = 0,
  audioLimit = 2,
  onSave,
  onClose,
}) {
  const [field, setField] = useState(initial || { ...EMPTY_FIELD });
  const [keyTouched, setKeyTouched] = useState(false);
  const [errors, setErrors] = useState({});
  const [customQuestionInput, setCustomQuestionInput] = useState("");
  const [draggedCheckId, setDraggedCheckId] = useState(null);

  useEffect(() => {
    const base = initial || { ...EMPTY_FIELD };
    if (base.type === "audio") {
      setField({
        ...base,
        analysis_profile: defaultAudioProfile(base.analysis_profile),
        max_size_mb: 30,
        accepted_extensions: [".m4a", ".mp3", ".wav"],
      });
    } else {
      setField({
        ...base,
        options: Array.isArray(base.options) ? base.options.join(", ") : (base.options || ""),
      });
    }
    setKeyTouched(false);
    setErrors({});
    setCustomQuestionInput("");
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
    const wasAudio = (initial?.type || "") === "audio";
    if (field.type === "audio" && !wasAudio && audioFieldCount >= audioLimit) {
      errs.type = `Only ${audioLimit} audio fields are allowed in one campaign`;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (field.type === "audio") {
      onSave({
        ...field,
        max_size_mb: 30,
        accepted_extensions: [".m4a", ".mp3", ".wav"],
        analysis_profile: defaultAudioProfile(field.analysis_profile),
      });
      return;
    }
    onSave({ ...field });
  };

  const toggleAnalysisType = (type) => {
    setField((prev) => {
      const profile = defaultAudioProfile(prev.analysis_profile);
      const exists = profile.analysis_type.includes(type);
      const analysis_type = exists
        ? profile.analysis_type.filter((t) => t !== type)
        : [...profile.analysis_type, type];
      return { ...prev, analysis_profile: { ...profile, analysis_type } };
    });
  };

  const addCustomQuestion = () => {
    const value = customQuestionInput.trim();
    if (!value) return;
    setField((prev) => {
      const profile = defaultAudioProfile(prev.analysis_profile);
      if (profile.custom_questions.includes(value)) return prev;
      return {
        ...prev,
        analysis_profile: {
          ...profile,
          custom_questions: [...profile.custom_questions, value],
        },
      };
    });
    setCustomQuestionInput("");
  };

  const removeCustomQuestion = (value) => {
    setField((prev) => {
      const profile = defaultAudioProfile(prev.analysis_profile);
      return {
        ...prev,
        analysis_profile: {
          ...profile,
          custom_questions: profile.custom_questions.filter((q) => q !== value),
        },
      };
    });
  };

  const addCheckById = (checkId) => {
    setField((prev) => {
      const profile = defaultAudioProfile(prev.analysis_profile);
      if (profile.checks.includes(checkId)) return prev;
      return {
        ...prev,
        analysis_profile: {
          ...profile,
          checks: [...profile.checks, checkId],
        },
      };
    });
  };

  const removeCheckById = (checkId) => {
    setField((prev) => {
      const profile = defaultAudioProfile(prev.analysis_profile);
      return {
        ...prev,
        analysis_profile: {
          ...profile,
          checks: profile.checks.filter((id) => id !== checkId),
        },
      };
    });
  };

  const moveCheckToIndex = (checkId, targetIndex) => {
    setField((prev) => {
      const profile = defaultAudioProfile(prev.analysis_profile);
      const currentIndex = profile.checks.indexOf(checkId);
      if (currentIndex === -1) return prev;
      const next = [...profile.checks];
      next.splice(currentIndex, 1);
      next.splice(targetIndex, 0, checkId);
      return {
        ...prev,
        analysis_profile: {
          ...profile,
          checks: next,
        },
      };
    });
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
            error={!!errors.type}
            helperText={errors.type}
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

          {field.type === "audio" && (
            <Stack spacing={1.5}>
              <Alert severity="info">
                Audio field uploads are limited to 30 MB and accepted formats are MP3/WAV/M4A.
              </Alert>

              <TextField
                select
                label="Industry context"
                value={defaultAudioProfile(field.analysis_profile).industry}
                onChange={(e) => {
                  const industry = e.target.value;
                  setField((prev) => ({
                    ...prev,
                    analysis_profile: {
                      ...defaultAudioProfile(prev.analysis_profile),
                      industry,
                    },
                  }));
                }}
                fullWidth
              >
                <MenuItem value="insurance">Insurance</MenuItem>
                <MenuItem value="medical">Medical</MenuItem>
                <MenuItem value="solar">Solar</MenuItem>
                <MenuItem value="generic_sales">Generic Sales</MenuItem>
              </TextField>

              <Box>
                <Typography variant="caption" color="text.secondary">Analysis outputs</Typography>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.5} sx={{ mt: 0.5 }}>
                  {ANALYSIS_TYPES.map((type) => {
                    const checked = defaultAudioProfile(field.analysis_profile).analysis_type.includes(type);
                    return (
                      <Chip
                        key={type}
                        label={type}
                        color={checked ? "warning" : "default"}
                        variant={checked ? "filled" : "outlined"}
                        onClick={() => toggleAnalysisType(type)}
                      />
                    );
                  })}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">Questionnaire checks (drag to reorder)</Typography>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mt: 0.75 }}>
                  <Box sx={{ flex: 1, border: "1px solid #ead8c4", borderRadius: 2, p: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Available checks</Typography>
                    <Stack spacing={0.5} sx={{ mt: 0.75, maxHeight: 220, overflow: "auto" }}>
                      {AUDIO_CHECK_LIBRARY.map((group) => (
                        <Box key={group.group}>
                          <Typography variant="caption" color="text.secondary">{group.group}</Typography>
                          {group.items
                            .filter((item) => !defaultAudioProfile(field.analysis_profile).checks.includes(item.id))
                            .map((item) => (
                              <Box
                                key={item.id}
                                draggable
                                onDragStart={() => setDraggedCheckId(item.id)}
                                onDragEnd={() => setDraggedCheckId(null)}
                                onClick={() => addCheckById(item.id)}
                                sx={{
                                  mt: 0.4,
                                  px: 1,
                                  py: 0.55,
                                  border: "1px solid #e8d8c8",
                                  borderRadius: 1.2,
                                  fontSize: 13,
                                  cursor: "grab",
                                  "&:hover": { bgcolor: "#fcf6ef" },
                                }}
                              >
                                {item.label}
                              </Box>
                            ))}
                        </Box>
                      ))}
                    </Stack>
                  </Box>

                  <Box
                    sx={{ flex: 1, border: "1px solid #ead8c4", borderRadius: 2, p: 1 }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!draggedCheckId) return;
                      addCheckById(draggedCheckId);
                      setDraggedCheckId(null);
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>Selected order</Typography>
                    <Stack spacing={0.45} sx={{ mt: 0.75, maxHeight: 220, overflow: "auto" }}>
                      {defaultAudioProfile(field.analysis_profile).checks.length === 0 ? (
                        <Typography variant="caption" color="text.secondary">
                          Drag checks here or click from Available checks.
                        </Typography>
                      ) : (
                        defaultAudioProfile(field.analysis_profile).checks.map((checkId, index) => (
                          <Stack
                            key={`${checkId}_${index}`}
                            direction="row"
                            alignItems="center"
                            spacing={0.5}
                            draggable
                            onDragStart={() => setDraggedCheckId(checkId)}
                            onDragEnd={() => setDraggedCheckId(null)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (!draggedCheckId) return;
                              if (!defaultAudioProfile(field.analysis_profile).checks.includes(draggedCheckId)) {
                                addCheckById(draggedCheckId);
                                moveCheckToIndex(draggedCheckId, index);
                              } else {
                                moveCheckToIndex(draggedCheckId, index);
                              }
                              setDraggedCheckId(null);
                            }}
                            sx={{
                              px: 0.75,
                              py: 0.45,
                              border: "1px solid #e8d8c8",
                              borderRadius: 1.2,
                              cursor: "grab",
                              bgcolor: "#fff",
                            }}
                          >
                            <MdDragIndicator size={16} color="#8a8a8a" />
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {CHECK_LABEL_MAP[checkId] || checkId}
                            </Typography>
                            <IconButton size="small" onClick={() => removeCheckById(checkId)}>
                              <MdClose size={14} />
                            </IconButton>
                          </Stack>
                        ))
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </Box>

              <Stack direction="row" spacing={1}>
                <TextField
                  label="Add custom question/check"
                  fullWidth
                  value={customQuestionInput}
                  onChange={(e) => setCustomQuestionInput(e.target.value)}
                  placeholder="e.g. Did caller mention smoker/non-smoker?"
                />
                <Button variant="outlined" onClick={addCustomQuestion}>Add</Button>
              </Stack>

              {defaultAudioProfile(field.analysis_profile).custom_questions.length > 0 && (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {defaultAudioProfile(field.analysis_profile).custom_questions.map((q) => (
                    <Chip key={q} label={q} onDelete={() => removeCustomQuestion(q)} size="small" />
                  ))}
                </Stack>
              )}
            </Stack>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={field.required}
                onChange={(e) => setField((prev) => ({ ...prev, required: e.target.checked }))}
                color="warning"
              />
            }
            label={<Typography variant="body2">Required field</Typography>}
          />

          {/* Role visibility toggles */}
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
              Visible to roles — click to toggle
            </Typography>
            <Stack direction="row" spacing={1}>
              {[
                { role: "admin", label: "Admin" },
                { role: "agent", label: "Agent" },
                { role: "client", label: "Client" },
              ].map(({ role, label }) => {
                const vis = Array.isArray(field.visibility) ? field.visibility : ["admin", "agent"];
                const active = vis.includes(role);
                return (
                  <Chip
                    key={role}
                    label={label}
                    size="small"
                    color={active ? "warning" : "default"}
                    variant={active ? "filled" : "outlined"}
                    onClick={() =>
                      setField((prev) => {
                        const current = Array.isArray(prev.visibility) ? prev.visibility : ["admin", "agent"];
                        const next = current.includes(role)
                          ? current.filter((r) => r !== role)
                          : [...current, role];
                        return { ...prev, visibility: next };
                      })
                    }
                  />
                );
              })}
            </Stack>
          </Box>
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
