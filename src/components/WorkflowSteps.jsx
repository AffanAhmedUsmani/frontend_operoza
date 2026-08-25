import { Box, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";

/**
 * Public-website Phase 3, Step 3. A real workflow visual (numbered,
 * connected steps) instead of a plain bullet list - each /features/*
 * page's "how it actually works" section uses this with that feature's
 * own real sequence (featuresData.js), not a generic 3-step placeholder.
 * Horizontal on wider screens, stacks vertically on mobile.
 */
export default function WorkflowSteps({ steps }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 1, md: 2 }}
      alignItems={{ xs: "stretch", md: "flex-start" }}
      sx={{ width: "100%" }}
    >
      {steps.map((step, index) => (
        <Stack key={step.label} direction={{ xs: "column", md: "row" }} alignItems="center" spacing={{ xs: 1, md: 2 }} sx={{ flex: 1 }}>
          <Stack alignItems="center" spacing={1} sx={{ textAlign: "center", flex: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontWeight: 800,
                fontSize: "1.1rem",
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {step.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {step.detail}
            </Typography>
          </Stack>
          {index < steps.length - 1 ? (
            <Box sx={{ color: "divider", display: "flex", alignItems: "center", justifyContent: "center", py: { xs: 0.5, md: 0 } }}>
              <ArrowForwardRoundedIcon sx={{ display: { xs: "none", md: "block" } }} />
              <ArrowDownwardRoundedIcon sx={{ display: { xs: "block", md: "none" } }} />
            </Box>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
}
