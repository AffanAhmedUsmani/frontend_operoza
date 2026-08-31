import { useState } from "react";
import { Box, IconButton, Paper, Popover, Typography } from "@mui/material";
import { MdHelpOutline } from "react-icons/md";
import { getGuidanceForScreen } from "./guidanceContent";

/**
 * QA_FIX_PLAN.md steps 19 & 20 - persistent per-screen help, the second of
 * two delivery mechanisms for the same guidance content FirstLoginTour
 * uses. Mounted once in TenantCrmLayout (like ChatDock/NotificationBell),
 * not per-screen, so it's always available - a user who gets stuck later,
 * not just on day one, has somewhere to go without restarting the whole
 * tour.
 */
export default function HelpGuidanceButton({ role, activeScreenLabel }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const guidance = getGuidanceForScreen(role, activeScreenLabel);

  if (!guidance) {
    // No authored content for this (role, screen) pair yet - nothing to
    // show, so don't clutter the UI with a button that opens to nothing.
    return null;
  }

  return (
    <>
      <Box sx={{ position: "fixed", bottom: 20, left: 20, zIndex: (theme) => theme.zIndex.speedDial }}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label="Help for this screen"
          sx={{
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 2,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <MdHelpOutline size={22} />
        </IconButton>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        transformOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Paper sx={{ p: 2.5, maxWidth: 320 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            {guidance.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {guidance.body}
          </Typography>
        </Paper>
      </Popover>
    </>
  );
}
