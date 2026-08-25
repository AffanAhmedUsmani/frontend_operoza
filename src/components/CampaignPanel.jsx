import { Chip, Stack, Typography } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Link } from "react-router-dom";

/**
 * Public-website UI/UX revamp. The /campaigns hub deliberately doesn't
 * use a plain bordered Card (per explicit direction: "I dont want cards
 * there") - a growing left accent bar, a lift-and-glow hover, and a
 * sliding arrow stand in for the border/shadow a Card would use. Info
 * order is icon+title on one row, the vertical tag beneath it, then the
 * detail copy - not icon/tag/title stacked as three separate lines.
 */
export default function CampaignPanel({ to, icon, eyebrow, title, detail, ctaLabel = "See the template" }) {
  return (
    <Stack
      component={Link}
      to={to}
      className="campaign-panel"
      spacing={1.25}
      sx={{
        position: "relative",
        display: "block",
        textDecoration: "none",
        color: "inherit",
        height: "100%",
        p: 3,
        pl: 3.5,
        borderRadius: 3,
        bgcolor: "background.paper",
        overflow: "hidden",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Stack
          alignItems="center"
          justifyContent="center"
          sx={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            bgcolor: "brand.subtle",
            flexShrink: 0,
          }}
          className="campaign-panel-icon"
        >
          {icon}
        </Stack>
        <Typography variant="h2" sx={{ fontSize: "1.2rem" }}>{title}</Typography>
      </Stack>
      <Chip label={eyebrow} size="small" variant="outlined" sx={{ alignSelf: "flex-start" }} />
      <Typography color="text.secondary" sx={{ flexGrow: 1 }}>{detail}</Typography>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "primary.main" }}>
        <Typography variant="body2" fontWeight={700} color="primary.main">{ctaLabel}</Typography>
        <ArrowForwardRoundedIcon fontSize="small" className="campaign-panel-arrow" />
      </Stack>
    </Stack>
  );
}
