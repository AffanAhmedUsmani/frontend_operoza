import { Box, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";

/**
 * Public-website UI/UX revamp - a deliberately card-free list item:
 * icon and heading share one row (not icon-above-heading), detail text
 * beneath, no border/shadow. Used where a plain bordered Card grid read
 * as repetitive/flat (Homepage's solution grid, Security's mechanism
 * list) - a soft background tint on hover is the only affordance,
 * rather than a lifting card.
 *
 * `to` is optional: Homepage's solution grid links each entry to its
 * real /features/:slug (or /security, for the one entry - Role-Based
 * Access Control - that isn't its own feature page) page, while
 * Security's own mechanism list renders the exact same component with
 * no `to` at all, since those five items already are the whole page.
 */
export default function FeaturePoint({ icon, title, detail, to }) {
  return (
    <Stack
      {...(to ? { component: Link, to } : {})}
      direction="row"
      spacing={2}
      alignItems="flex-start"
      sx={{
        p: 1.5,
        borderRadius: 3,
        transition: "background-color 0.2s ease",
        "&:hover": { bgcolor: "brand.subtleHover" },
        ...(to ? { textDecoration: "none", color: "inherit", cursor: "pointer" } : {}),
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          flexShrink: 0,
          bgcolor: "brand.subtle",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>
      <Stack spacing={0.4} sx={{ pt: 0.5 }}>
        <Typography variant="h3" sx={{ fontSize: "1.05rem" }}>{title}</Typography>
        <Typography color="text.secondary" variant="body2">{detail}</Typography>
      </Stack>
    </Stack>
  );
}
