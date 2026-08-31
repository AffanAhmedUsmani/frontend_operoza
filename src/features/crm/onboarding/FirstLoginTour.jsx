import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MobileStepper,
  Typography,
} from "@mui/material";
import { markOnboardingSeen } from "../../auth/services/authService";
import { getAllGuidanceForRole } from "./guidanceContent";

/**
 * QA_FIX_PLAN.md steps 19 & 20 - shown once, the first time a user logs
 * in (gated on UserAccount.has_seen_onboarding), walking through that
 * role's guidance content one screen at a time. Skippable at any point;
 * either skipping or finishing marks the flag so it never auto-shows
 * again - HelpGuidanceButton (persistent, per-screen) is how the same
 * content gets revisited later.
 */
export default function FirstLoginTour({ open, role, accessToken, onDismiss }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [dismissing, setDismissing] = useState(false);

  const entries = Object.values(getAllGuidanceForRole(role));
  const totalSteps = entries.length;
  const current = entries[stepIndex];

  const finish = async () => {
    if (dismissing) return;
    setDismissing(true);
    try {
      if (accessToken) {
        await markOnboardingSeen(accessToken);
      }
    } catch {
      // Non-fatal - worst case the tour shows again next login, which is
      // a minor annoyance, not a broken state. Never block the user on
      // this call succeeding.
    } finally {
      setDismissing(false);
      onDismiss();
    }
  };

  if (!open || totalSteps === 0 || !current) {
    return null;
  }

  const isLastStep = stepIndex === totalSteps - 1;

  return (
    <Dialog open={open} onClose={finish} maxWidth="xs" fullWidth>
      <DialogTitle>{current.title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary">
          {current.body}
        </Typography>
      </DialogContent>
      <MobileStepper
        variant="dots"
        steps={totalSteps}
        position="static"
        activeStep={stepIndex}
        sx={{ bgcolor: "transparent", justifyContent: "center" }}
        nextButton={<span />}
        backButton={<span />}
      />
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={finish} disabled={dismissing} color="inherit">
          Skip
        </Button>
        <Button
          variant="outlined"
          disabled={stepIndex === 0}
          onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        <Button
          variant="contained"
          disabled={dismissing}
          onClick={() => (isLastStep ? finish() : setStepIndex((s) => Math.min(totalSteps - 1, s + 1)))}
        >
          {isLastStep ? "Done" : "Next"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
