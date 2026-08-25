import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";

// The real support contact channel (also used on the public Storefront's
// Contact/FloatingWhatsApp) - deliberately the same link everywhere so
// there's exactly one "how do I actually reach support" answer.
const SUPPORT_WHATSAPP_URL = "https://wa.link/ov814n";

const LIMIT_COPY = {
  seat_quota_exceeded: {
    title: "Team Seat Limit Reached",
    detail: "Your workspace has used its full allocation of team seats, so this account can't be created yet. Contact support to raise your seat allowance.",
  },
  storage_quota_exceeded: {
    title: "Storage Limit Reached",
    detail: "Your workspace has used its full file storage allocation - anything that would use more space is paused until support raises it. Contact support to increase your storage allowance.",
  },
  transcription_quota_exceeded: {
    title: "Audio Transcription Limit Reached",
    detail: "Your workspace has used its full audio transcription allocation for this month. Contact support to increase it.",
  },
  ai_assist_quota_exceeded: {
    title: "AI-Assist Action Limit Reached",
    detail: "Your workspace has used its full AI-assist action allocation for this month. Contact support to increase it.",
  },
};

/**
 * PLATFORM_OPS_AND_BILLING.md S3 - the real-time consequence of a
 * capacity limit actually being enforced (billing.services.BillingService):
 * rather than a generic error toast, the admin who hit the wall gets a
 * clear reason and a direct path to support. Nothing here can raise the
 * limit itself - that's a deliberate manual step (a Django Admin
 * operator applying a TenantTierChangeRequest after a real
 * conversation/deal), which is what emits the TENANT_TIER_CHANGED
 * notification + email once it's actually done.
 */
export default function UpgradeRequiredModal({ open, onClose, reasonCode }) {
  const copy = LIMIT_COPY[reasonCode] || {
    title: "Plan Limit Reached",
    detail: "Your workspace has reached one of its plan's capacity limits.",
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography color="text.secondary">{copy.detail}</Typography>
          <Alert severity="info">
            Message support with your workspace name - once they confirm the new limit, it's applied to your
            account directly, with a confirmation sent to you here and by email.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<FaWhatsapp />}
          href={SUPPORT_WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
        >
          Contact Support
        </Button>
      </DialogActions>
    </Dialog>
  );
}
