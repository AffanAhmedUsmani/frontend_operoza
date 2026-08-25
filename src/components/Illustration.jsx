import { Box } from "@mui/material";

/**
 * Public-website UI/UX revamp - real illustration (see
 * data/illustrations.js). Most of these are now background-removed,
 * transparent PNGs (frontend/bg_rm_pictures) - no card frame or drop
 * shadow around them, since a shadow drawn against a mostly-transparent
 * image's own bounding box would render as a floating rectangle of
 * empty space rather than hugging the visible subject. The art is
 * meant to float directly on the page.
 */
export default function Illustration({ src, alt, maxWidth = 420, sx }) {
  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      loading="lazy"
      sx={{
        width: "100%",
        maxWidth,
        height: "auto",
        display: "block",
        ...sx,
      }}
    />
  );
}
