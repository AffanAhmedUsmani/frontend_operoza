import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { MdAutoAwesome } from "react-icons/md";

import { createFollowUpTask, draftFollowUpNote } from "../../services/followUpService";

/**
 * Sprint 12 (docs/SPRINT_PLAN.md), general guide §7.3 - "create a
 * follow-up directly from a lead I'm still working... or from a sale
 * record, with a note, when I judge one is needed" (Agent guide §5).
 * Only ever reachable from a sale whose campaign has follow_up_enabled -
 * the caller (SalesTableCard) hides the action entirely otherwise, and
 * the backend independently rejects the request either way.
 */
export default function CreateFollowUpDialog({ open, sale, accessToken, onCreated, onClose }) {
  const [dueAt, setDueAt] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDueAt("");
    setNote("");
    setError("");
    setSaving(false);
    setDrafting(false);
    setDraftError("");
  }, [open, sale]);

  const handleDraftNote = async () => {
    if (!sale?.sale_id) return;
    setDrafting(true);
    setDraftError("");
    try {
      const result = await draftFollowUpNote(accessToken, { saleId: sale.sale_id });
      setNote(result?.note || "");
    } catch (err) {
      setDraftError(err.message || "Unable to draft a note.");
    } finally {
      setDrafting(false);
    }
  };

  const handleCreate = async () => {
    if (!dueAt) {
      setError("Due date is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createFollowUpTask(accessToken, {
        saleId: sale.sale_id,
        dueAt: new Date(dueAt).toISOString(),
        note,
      });
      onCreated?.();
      onClose?.();
    } catch (err) {
      setError(err.message || "Unable to create follow-up.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Create Follow-Up</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <Typography variant="body2" color="text.secondary">
            {sale ? `For ${sale.lead_name || "this sale"} on ${sale.campaign_name || "this campaign"}.` : ""}
          </Typography>
          <TextField
            label="Follow up on"
            type="datetime-local"
            InputLabelProps={{ shrink: true }}
            value={dueAt}
            onChange={(e) => setDueAt(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Note"
            placeholder="e.g. call back in 3 days about pricing"
            multiline
            minRows={2}
            fullWidth
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          {draftError ? <Alert severity="error">{draftError}</Alert> : null}
          <Button
            size="small"
            variant="text"
            onClick={handleDraftNote}
            disabled={drafting}
            startIcon={drafting ? <CircularProgress size={14} color="inherit" /> : <MdAutoAwesome />}
            sx={{ alignSelf: "flex-start" }}
          >
            {drafting ? "Drafting..." : "Draft with AI"}
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleCreate} disabled={saving}>
          {saving ? "Creating..." : "Create Follow-Up"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
