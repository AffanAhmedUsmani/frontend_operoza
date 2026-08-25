import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdAudiotrack, MdCancel, MdCheckCircle, MdLock, MdPending } from "react-icons/md";
import { useTheme } from "@mui/material/styles";

/** Renders a single dynamic schema field in the sale editor. */
function renderField(field, value, readOnly, onUpdatePayload, form, editingSale, audioFiles, onAudioFileChange, theme) {
  if (field.type === "textarea") {
    return (
      <TextField
        key={field.key}
        label={field.label}
        multiline
        minRows={3}
        fullWidth
        required={field.required}
        value={value}
        disabled={readOnly}
        onChange={(e) => onUpdatePayload(field.key, e.target.value)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <TextField
        key={field.key}
        label={field.label}
        select
        fullWidth
        required={field.required}
        value={value}
        disabled={readOnly}
        onChange={(e) => onUpdatePayload(field.key, e.target.value)}
      >
        <MenuItem value="">Select...</MenuItem>
        {field.options.map((option) => (
          <MenuItem key={option} value={option}>{option}</MenuItem>
        ))}
      </TextField>
    );
  }

  if (field.type === "date") {
    return (
      <TextField
        key={field.key}
        label={field.label}
        type="date"
        InputLabelProps={{ shrink: true }}
        fullWidth
        required={field.required}
        value={value}
        disabled={readOnly}
        onChange={(e) => onUpdatePayload(field.key, e.target.value)}
      />
    );
  }

  if (field.type === "number") {
    return (
      <TextField
        key={field.key}
        label={field.label}
        type="number"
        fullWidth
        required={field.required}
        value={value}
        disabled={readOnly}
        onChange={(e) => onUpdatePayload(field.key, e.target.value)}
      />
    );
  }

  if (field.type === "audio") {
    const existingUrl = form.payload_json?.[field.key];
    const analysisEntry = editingSale?.audio_analysis_json?.[field.key];
    const isLocked = analysisEntry?.locked;
    // Sprint 14 (docs/SPRINT_PLAN.md): `locked` is set true immediately on
    // upload (it blocks re-upload), before analysis has actually run - it no
    // longer means "analyzed". `status` reflects real progress; entries
    // from before this sprint have no `status` key, so a locked entry with
    // no status is treated as the legacy "completed" case.
    const analysisStatus = analysisEntry?.status ?? (isLocked ? "completed" : null);
    const pendingFile = audioFiles?.[field.key];

    return (
      <Box
        key={field.key}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 1.5 }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <MdAudiotrack size={18} />
            <Typography variant="body2" fontWeight={500}>
              {field.label}{field.required ? " *" : ""}
            </Typography>
            {analysisStatus === "failed" && (
              <Chip size="small" color="error" icon={<MdCancel size={12} />} label="Analysis failed" />
            )}
            {analysisStatus === "pending" && (
              <Chip size="small" color="warning" icon={<MdPending size={12} />} label="Analysis pending" />
            )}
            {analysisStatus === "completed" && (
              <Chip size="small" color="success" icon={<MdLock size={12} />} label="Analysis locked" />
            )}
          </Stack>

          {isLocked ? (
            <Stack direction="row" spacing={1} alignItems="center">
              {analysisStatus === "failed" ? (
                <>
                  <MdCancel color={theme.palette.error.main} />
                  <Typography variant="caption" color="text.secondary">
                    Analysis failed{analysisEntry?.error ? `: ${analysisEntry.error}` : "."}
                  </Typography>
                </>
              ) : analysisStatus === "pending" ? (
                <>
                  <MdPending color={theme.palette.warning.main} />
                  <Typography variant="caption" color="text.secondary">
                    Audio uploaded - analysis is processing, check back shortly.
                  </Typography>
                </>
              ) : (
                <>
                  <MdCheckCircle color={theme.palette.success.main} />
                  <Typography variant="caption" color="text.secondary">
                    Audio already analyzed. Click the AI Analysis button to view results.
                  </Typography>
                </>
              )}
              {existingUrl && (
                <Typography component="a" href={existingUrl} target="_blank" variant="caption" color="primary">
                  Listen
                </Typography>
              )}
            </Stack>
          ) : readOnly ? (
            <Typography variant="caption" color="text.secondary">
              {existingUrl ? (
                <a href={existingUrl} target="_blank" rel="noreferrer">Open audio file</a>
              ) : "No audio uploaded."}
            </Typography>
          ) : (
            <>
              {existingUrl && !pendingFile && (
                <Typography variant="caption" color="text.secondary">
                  Current: <a href={existingUrl} target="_blank" rel="noreferrer">audio file</a>
                </Typography>
              )}
              <Button
                component="label"
                variant="outlined"
                size="small"
                startIcon={<MdAudiotrack />}
                color={pendingFile ? "success" : "primary"}
                sx={{ alignSelf: "flex-start" }}
              >
                {pendingFile ? `✓ ${pendingFile.name}` : "Choose Audio File"}
                <input
                  type="file"
                  accept="audio/*"
                  hidden
                  onChange={(e) => onAudioFileChange(field.key, e.target.files?.[0] ?? null)}
                />
              </Button>
              <Typography variant="caption" color="text.secondary">
                Audio will be uploaded and analyzed after saving.
              </Typography>
            </>
          )}
        </Stack>
      </Box>
    );
  }

  // Default: text / email / phone / etc.
  return (
    <TextField
      key={field.key}
      label={field.label}
      fullWidth
      required={field.required}
      value={value}
      disabled={readOnly}
      onChange={(e) => onUpdatePayload(field.key, e.target.value)}
    />
  );
}

// Shared campaign selector used in both admin and agent paths.
function CampaignSelect({ campaigns, value, onChange, disabled }) {
  return (
    <TextField select label="Campaign" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} fullWidth>
      {campaigns.map((c) => (
        <MenuItem key={c.campaign_id} value={c.campaign_id}>{c.name}</MenuItem>
      ))}
    </TextField>
  );
}

export default function SaleEditorDialog({
  open,
  saving,
  editingSale,
  readOnly = false,
  isAdmin,
  campaigns,
  users,
  form,
  formSchema,
  selectedFormCampaign,
  actorName,
  audioFiles,
  onAudioFileChange,
  onClose,
  onSave,
  onCampaignChange,
  onSetAgent,
  onUpdatePayload,
}) {
  const theme = useTheme();
  const title = readOnly ? "View Sale" : editingSale ? "Edit Sale" : "Create Sale";

  return (
    <Dialog open={open} onClose={() => !saving && onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          {/* Campaign selector is shared; admin also gets an agent selector */}
          <CampaignSelect
            campaigns={campaigns}
            value={form.campaign_id}
            onChange={onCampaignChange}
            disabled={readOnly}
          />

          {isAdmin ? (
            <TextField
              select
              label="Agent"
              value={form.agent_user_id}
              onChange={(e) => onSetAgent(e.target.value)}
              disabled={readOnly}
              fullWidth
            >
              {users.map((u) => (
                <MenuItem key={u.user_id} value={u.user_id}>
                  {u.display_name || u.email || u.email_address}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip label={`Campaign: ${selectedFormCampaign?.name || "Assigned campaign"}`} />
              <Chip label={`Agent: ${actorName}`} />
            </Stack>
          )}

          {formSchema.length === 0 ? (
            <Alert severity="warning">This campaign has no schema fields configured yet.</Alert>
          ) : (
            formSchema.map((field) =>
              renderField(
                field,
                form.payload_json?.[field.key] ?? "",
                readOnly,
                onUpdatePayload,
                form,
                editingSale,
                audioFiles,
                onAudioFileChange,
                theme,
              )
            )
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>{readOnly ? "Close" : "Cancel"}</Button>
        {!readOnly && (
          <Button variant="contained" onClick={onSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
