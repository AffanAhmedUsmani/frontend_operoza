import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdDeleteForever, MdVisibility, MdVisibilityOff, MdWarning } from "react-icons/md";
import { deleteCampaign } from "../../services/campaignService";

export default function DeleteCampaignDialog({ open, campaign, accessToken, onDeleted, onClose }) {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [step, setStep] = useState("confirm"); // "confirm" | "password"
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setPassword("");
      setShowPw(false);
      setStep("confirm");
      setSaving(false);
      setError("");
    }
  }, [open]);

  const handleConfirm = () => {
    setStep("password");
  };

  const handleDelete = async () => {
    if (!password.trim()) {
      setError("Enter your password to confirm deletion.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await deleteCampaign(accessToken, campaign.campaign_id, password);
      onDeleted();
      onClose();
    } catch (err) {
      setError(err.message || "Deletion failed. Check your password and try again.");
      setSaving(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <MdDeleteForever size={22} color="#d32f2f" />
          <Typography variant="h6" component="span" color="error.main">
            Delete Campaign
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {step === "confirm" ? (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <MdWarning size={22} color="#f57c00" style={{ marginTop: 2, flexShrink: 0 }} />
              <Typography variant="body2">
                Are you sure you want to delete{" "}
                <strong>&ldquo;{campaign.name}&rdquo;</strong>?
                <br />
                This action will hide the campaign and all its assignments from the workspace.
                It cannot be undone from the UI.
              </Typography>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Enter your <strong>Super Admin password</strong> to confirm permanent deletion of{" "}
              <strong>&ldquo;{campaign.name}&rdquo;</strong>.
            </Typography>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="Super Admin password"
              type={showPw ? "text" : "password"}
              fullWidth
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !saving && handleDelete()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowPw((v) => !v)} edge="end">
                      {showPw ? <MdVisibilityOff /> : <MdVisibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        {step === "confirm" ? (
          <Button variant="outlined" color="error" onClick={handleConfirm}>
            Yes, Delete
          </Button>
        ) : (
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <MdDeleteForever />}
          >
            {saving ? "Deleting…" : "Confirm Delete"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
