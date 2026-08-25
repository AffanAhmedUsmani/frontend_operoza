import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { updateCampaign } from "../../services/campaignService";

const STATUS_OPTIONS = ["draft", "running", "paused", "completed", "archived"];

// A curated, non-exhaustive set covering major regions - a free-text IANA
// name also works since the backend validates against the full tz
// database, but a short list covers the common case without building a
// full timezone-picker component.
const TIMEZONE_OPTIONS = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Karachi",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Dhaka",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export default function CampaignSettingsModal({ open, campaign, accessToken, onSaved, onClose }) {
  const [name, setName] = useState("");
  const [statusCode, setStatusCode] = useState("draft");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [shiftStartTime, setShiftStartTime] = useState("");
  const [shiftEndTime, setShiftEndTime] = useState("");
  const [shiftTimezoneCode, setShiftTimezoneCode] = useState("UTC");
  const [shiftGraceMinutes, setShiftGraceMinutes] = useState(0);
  const [shiftLateThresholdMinutes, setShiftLateThresholdMinutes] = useState("");
  const [followUpEnabled, setFollowUpEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!campaign || !open) return;
    setName(campaign.name || "");
    setStatusCode(campaign.status_code || "draft");
    setStartsAt(campaign.starts_at ? String(campaign.starts_at).slice(0, 16) : "");
    setEndsAt(campaign.ends_at ? String(campaign.ends_at).slice(0, 16) : "");
    setShiftStartTime(campaign.shift_start_time ? String(campaign.shift_start_time).slice(0, 5) : "");
    setShiftEndTime(campaign.shift_end_time ? String(campaign.shift_end_time).slice(0, 5) : "");
    setShiftTimezoneCode(campaign.shift_timezone_code || "UTC");
    setShiftGraceMinutes(campaign.shift_grace_minutes ?? 0);
    setShiftLateThresholdMinutes(
      campaign.shift_late_threshold_minutes === null || campaign.shift_late_threshold_minutes === undefined
        ? ""
        : String(campaign.shift_late_threshold_minutes)
    );
    setFollowUpEnabled(Boolean(campaign.follow_up_enabled));
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
      const result = await updateCampaign(accessToken, campaign.campaign_id, {
        name: name.trim(),
        status_code: statusCode,
        starts_at: startsAt ? new Date(startsAt).toISOString() : null,
        ends_at: endsAt ? new Date(endsAt).toISOString() : null,
        // Always sent, even unchanged - the backend's update semantics
        // treat an omitted field as "clear it", matching how starts_at/
        // ends_at already behave in this same request.
        shift_start_time: shiftStartTime || null,
        shift_end_time: shiftEndTime || null,
        shift_timezone_code: shiftTimezoneCode,
        shift_grace_minutes: Number(shiftGraceMinutes) || 0,
        shift_late_threshold_minutes: shiftLateThresholdMinutes === "" ? null : Number(shiftLateThresholdMinutes),
        follow_up_enabled: followUpEnabled,
      });
      // Sprint 8 (docs/SPRINT_PLAN.md): passes the updated campaign back
      // so the caller can patch its own state in place, instead of
      // re-fetching the whole campaign list for a single-row edit.
      onSaved?.(result.campaign);
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

          <Divider />
          <Typography variant="subtitle2">Shift &amp; Attendance (optional)</Typography>
          <Typography variant="caption" color="text.secondary">
            Leave shift start empty to leave attendance unrestricted for this campaign - agents can
            check in at any time from any assigned network.
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Shift start"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={shiftStartTime}
              onChange={(e) => setShiftStartTime(e.target.value)}
              fullWidth
            />
            <TextField
              label="Shift end"
              type="time"
              InputLabelProps={{ shrink: true }}
              value={shiftEndTime}
              onChange={(e) => setShiftEndTime(e.target.value)}
              fullWidth
            />
          </Stack>
          <TextField
            label="Shift timezone"
            select
            fullWidth
            value={shiftTimezoneCode}
            onChange={(e) => setShiftTimezoneCode(e.target.value)}
          >
            {TIMEZONE_OPTIONS.map((tz) => (
              <MenuItem key={tz} value={tz}>{tz}</MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Grace period (minutes)"
              type="number"
              fullWidth
              value={shiftGraceMinutes}
              onChange={(e) => setShiftGraceMinutes(e.target.value)}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Late cutoff (minutes, blank = none)"
              type="number"
              fullWidth
              value={shiftLateThresholdMinutes}
              onChange={(e) => setShiftLateThresholdMinutes(e.target.value)}
              inputProps={{ min: 0 }}
            />
          </Stack>

          <Divider />
          <Typography variant="subtitle2">Follow-Ups</Typography>
          <Typography variant="caption" color="text.secondary">
            Turning this on only makes the follow-up UI available on this campaign - it never
            schedules a follow-up on anyone's behalf. Each agent still decides, per lead or sale,
            whether one is needed.
          </Typography>
          <FormControlLabel
            control={<Checkbox checked={followUpEnabled} onChange={(e) => setFollowUpEnabled(e.target.checked)} />}
            label="Enable follow-ups for this campaign"
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
