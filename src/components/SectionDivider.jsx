import { Box } from "@mui/material";

/**
 * Public-website UI/UX revamp. A soft organic curve between homepage
 * sections, in place of a flat <Divider> line - full-bleed curved
 * section transitions are a standard marketing-site pattern a dashboard
 * app never uses, making this one of the cheapest, highest-signal ways
 * to visually separate the Storefront from the CRM. Colored via the
 * parent's `color` (uses currentColor), so it can sit on any background
 * band without a hardcoded fill.
 */
export default function SectionDivider({ flip = false }) {
  return (
    <Box
      component="svg"
      viewBox="0 0 1440 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      sx={{
        display: "block",
        width: "100%",
        height: { xs: 36, md: 64 },
        transform: flip ? "scaleY(-1)" : "none",
      }}
    >
      <path
        d="M0,32 C240,80 480,0 720,24 C960,48 1200,8 1440,40 L1440,80 L0,80 Z"
        fill="currentColor"
      />
    </Box>
  );
}
