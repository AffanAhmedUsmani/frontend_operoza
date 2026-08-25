import { Box, Chip, Stack, Typography } from "@mui/material";

/**
 * Sprint 8 (docs/SPRINT_PLAN.md) - one shared, honest "not built yet"
 * treatment, used everywhere a Settings section previously described a
 * capability that has no real state or API behind it. An explicitly
 * labeled "Coming soon" is not the same defect as a placeholder that
 * reads as if the feature already works (general guide §15.7) - the
 * difference is exactly what this component exists to make consistent.
 */
export default function ComingSoonNotice({ title, description, sprint }) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Chip label={sprint ? `Coming in ${sprint}` : "Coming soon"} size="small" variant="outlined" sx={{ borderColor: "primary.light", color: "primary.dark" }} />
      </Stack>
      <Typography color="text.secondary" variant="body2">
        {description}
      </Typography>
    </Box>
  );
}
