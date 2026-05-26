import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { updateCampaign } from "../../services/campaignService";

const STATUS_OPTIONS = ["draft", "running", "paused", "completed", "archived"];

export default function CampaignSettingsModal({ open, campaign, accessToken, onSaved, onClose }) {
  const [name, setName] = useState("");
  const [statusCode, setStatusCode] = useState("draft");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campaign || !open) return;
    setName(campaign.name || "");
    setStatusCode(campaign.status_code || "draft");
    setStartsAt(campaign.starts_at ? String(campaign.starts_at).slice(0, 16) : "");
    setEndsAt(campaign.ends_at ? String(campaign.ends_at).slice(0, 16) : "");
    setError("");
    setSaving(false);
  }, [open, campaign]);

  const handleSave = async () => {
    if (!campaign) return;
    if (!name.trim()) {
      setError("Campaign name is required.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await updateCampaign(accessToken, campaign.campaign_id, {
        name: name.trim(),
        status_code: statusCode,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
      });
      onSaved?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Failed to update campaign settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Campaign Settings</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField label="Campaign name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField
            label="Status"
            select
            fullWidth
            value={statusCode}
            onChange={(e) => setStatusCode(e.target.value)}
          >
            {STATUS_OPTIONS.map((s) => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Starts at"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            fullWidth
          />
          <TextField
            label="Ends at"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
