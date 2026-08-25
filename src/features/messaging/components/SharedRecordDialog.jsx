import { useEffect, useState } from "react";
import { Alert, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

import { fetchSharedRecord } from "../services/messagingService";

/**
 * Sprint 13 (docs/SPRINT_PLAN.md), general guide S8 - a shared record is
 * a reference, not a copy. This always re-resolves through the backend's
 * SharedRecordView (which reuses the normal Sale/Report/Dashboard
 * service calls) at OPEN time, under the CURRENT viewer's own session -
 * never renders data the poster attached, since the poster's own access
 * is irrelevant to whether this viewer can see it.
 */
export default function SharedRecordDialog({ open, messageId, accessToken, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !messageId) return;
    setLoading(true);
    setError("");
    setData(null);
    fetchSharedRecord(accessToken, messageId)
      .then(setData)
      .catch((err) => setError(err.message || "Unable to open this shared record - it may be outside your access scope."))
      .finally(() => setLoading(false));
  }, [open, messageId, accessToken]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Shared Record</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Stack alignItems="center" sx={{ py: 3 }}><CircularProgress size={24} /></Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : data ? (
          <Stack spacing={1}>
            {Object.entries(data.sale || data.report || data.dashboard || data).map(([key, value]) => (
              <Typography key={key} variant="body2">
                <strong>{key}:</strong> {typeof value === "object" ? JSON.stringify(value) : String(value)}
              </Typography>
            ))}
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
