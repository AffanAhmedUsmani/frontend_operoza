import { Box } from "@mui/material";

/**
 * Public-website UI/UX revamp, structural pass ahead of the real
 * illustration set (24 prompts drafted separately, one per hero/section -
 * same warm-gradient, rounded-geometric style guide used here). Marks
 * exactly where a generated illustration will drop in later: swapping
 * one out for a real <img src="..."> is then a one-line change, and
 * every page that will eventually carry art already reads as
 * illustration-led in the meantime, not another icon-in-a-circle.
 */
export default function IllustrationPlaceholder({ icon: Icon, size = 220, label = "" }) {
  return (
    <Box
      role="img"
      aria-label={label}
      sx={{
        width: size,
        height: size,
        maxWidth: "100%",
        borderRadius: "32% 68% 62% 38% / 41% 34% 66% 59%",
        background: (t) => `linear-gradient(135deg, ${t.palette.primary.main}, ${t.palette.primary.light})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {Icon ? <Icon sx={{ fontSize: size * 0.4, color: "#fff" }} /> : null}
    </Box>
  );
}
