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
  Typography,
} from "@mui/material";
import { MdFileUpload } from "react-icons/md";
import { importCampaignSheet } from "../../services/campaignService";

// Sprint 8 (docs/SPRINT_PLAN.md): extracted from the 801-line
// CampaignsPanel.jsx into its own concern (the CSV/XLSX import dialog),
// alongside CampaignBuilder.jsx and the now-much-smaller
// CampaignsPanel.jsx orchestrator.
export default function CampaignImportDialog({ open, onClose, accessToken, onImported }) {
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
