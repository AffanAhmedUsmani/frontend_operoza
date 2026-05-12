import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import { MdSave, MdClose, MdUndo } from "react-icons/md";

/**
 * StudioToolbar — Top toolbar for dashboard studio
 * 
 * Primacy (Serial Position Effect): Save/Draft buttons at top
 * Miller's Law: Chunked into 2 groups - main actions vs. dismissal
 * 
 * Props:
 *   dashboardName  — string
 *   hasChanges     — bool, enables save button
 *   onSave         — () => void
 *   onSaveDraft    — () => void
 *   onCancel       — () => void (with unsaved confirmation)
 *   onUndo         — () => void (optional)
 *   canUndo        — bool
 */
function StudioToolbar({
  dashboardName,
  hasChanges,
  onSave,
  onSaveDraft,
  onCancel,
  onUndo,
  canUndo,
}) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const handleCancelClick = () => {
    if (hasChanges) {
      setConfirmCancelOpen(true);
    } else {
      onCancel();
    }
  };

  return (
    <>
      <Box
        sx={{
          background: "linear-gradient(135deg, #f5ece0 0%, #faf6f0 100%)",
          border: "1px solid #ead8c4",
          borderRadius: 2,
          p: 2,
          mb: 3,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          {/* Left: Dashboard name & info */}
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {dashboardName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {hasChanges ? "Unsaved changes •" : "All saved •"} Studio Builder
            </Typography>
          </Box>

          {/* Right: Action buttons (chunked: save group, cancel group) */}
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Undo button - only if available */}
            {onUndo && (
              <Tooltip title={canUndo ? "Undo last change" : "Nothing to undo"}>
                <span>
                  <IconButton
                    size="small"
                    onClick={onUndo}
                    disabled={!canUndo}
                    aria-label="Undo"
                  >
                    <MdUndo size={18} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {/* Primary: Save button */}
            <Tooltip title="Save dashboard with all widgets">
              <span>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<MdSave />}
                  onClick={onSave}
                  disabled={!hasChanges}
                  sx={{
                    background: hasChanges
                      ? "linear-gradient(135deg, #c05314 0%, #a03f0f 100%)"
                      : "#e0e0e0",
                    color: hasChanges ? "#fff" : "#999",
                    fontWeight: 700,
                  }}
                  aria-label="Save dashboard"
                >
                  Save
                </Button>
              </span>
            </Tooltip>

            {/* Secondary: Save as Draft */}
            <Tooltip title="Save as draft — changes not yet published">
              <span>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={onSaveDraft}
                  disabled={!hasChanges}
                  aria-label="Save as draft"
                >
                  Draft
                </Button>
              </span>
            </Tooltip>

            {/* Tertiary: Cancel (recency cue) */}
            <Tooltip title={hasChanges ? "Discard unsaved changes" : "Exit builder"}>
              <span>
                <IconButton
                  size="small"
                  onClick={handleCancelClick}
                  aria-label="Cancel and exit"
                >
                  <MdClose size={20} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Info bar - unsaved changes indicator */}
        {hasChanges && (
          <Box sx={{ mt: 1.5 }}>
            <Alert severity="warning" sx={{ py: 0.75, px: 1.5 }}>
              <Typography variant="caption" fontWeight={600}>
                You have unsaved changes. Use Save or Draft to persist.
              </Typography>
            </Alert>
          </Box>
        )}
      </Box>

      {/* Confirm cancel dialog */}
      <Dialog open={confirmCancelOpen} onClose={() => setConfirmCancelOpen(false)}>
        <DialogTitle fontWeight={700}>Discard Changes?</DialogTitle>
        <DialogContent>
          <Typography>
            You have unsaved changes to "{dashboardName}". They will be lost if you exit.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmCancelOpen(false)}>
            Continue Editing
          </Button>
          <Button
            onClick={() => {
              setConfirmCancelOpen(false);
              onCancel();
            }}
            color="error"
            variant="contained"
          >
            Discard
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default StudioToolbar;
