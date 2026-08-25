import {
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { MdDeleteForever, MdDownload, MdPeople, MdSettings, MdViewList } from "react-icons/md";
import CampaignSalesWidget from "./CampaignSalesWidget";
import { normalizeRole } from "../sales/salesFormUtils";

// Post-Sprint-20 - status is a semantic signal (draft/running/paused/...),
// not a brand identity, so it reads from MUI's built-in success/warning/
// info/error palette (already mode-aware) rather than the tenant's
// primary/secondary - the same "semantic color is separate from the
// accent hue" rule the rest of the theme follows.
function getStatusStyles(theme) {
  return {
    draft: { bg: alpha(theme.palette.text.secondary, 0.12), color: theme.palette.text.secondary },
    running: { bg: alpha(theme.palette.success.main, 0.16), color: theme.palette.success.dark },
    paused: { bg: alpha(theme.palette.warning.main, 0.18), color: theme.palette.warning.dark },
    completed: { bg: alpha(theme.palette.info.main, 0.16), color: theme.palette.info.dark },
    archived: { bg: alpha(theme.palette.text.disabled, 0.12), color: theme.palette.text.disabled },
  };
}

export default function CampaignCard({
  campaign,
  accessToken,
  userRole,
  onViewTeam,
  onEditFields,
  onDeleteCampaign,
  onOpenSettings,
  onOpenExport,
}) {
  const theme = useTheme();
  const statusStyles = getStatusStyles(theme);
  const themeBorder = alpha(theme.palette.primary.main, 0.55);
  const themeDivider = alpha(theme.palette.primary.main, 0.28);
  const schemaFields = Array.isArray(campaign.schema_json) ? campaign.schema_json : [];
  const fieldCount = schemaFields.length;
  const statusKey = (campaign.status_code || "draft").toLowerCase();
  const statusStyle = statusStyles[statusKey] || statusStyles.draft;
  const normalizedRole = normalizeRole(userRole || "");
  const isAdmin = normalizedRole === "admin";
  const canManageCampaign = ["admin", "team_lead"].includes(normalizedRole);
  const canExportCampaign = canManageCampaign;

  return (
    <Card
      sx={{
        border: `1.5px solid ${themeBorder}`,
        borderRadius: { xs: 2.5, md: 4 },
        overflow: "hidden",
        width: "100%",
        bgcolor: "background.paper",
        transition: "box-shadow 0.15s, transform 0.15s",
        "&:hover": {
          boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.18)}`,
          transform: "translateY(-1px)",
          borderColor: "primary.main",
        },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "2.3fr 1.2fr 2fr 1.9fr" },
          alignItems: "stretch",
        }}
      >
        <Stack
          sx={{
            px: 2.25,
            py: 1.25,
            minHeight: { md: 74 },
            justifyContent: "center",
            borderRight: { md: `1px solid ${themeDivider}` },
            borderBottom: { xs: `1px solid ${themeDivider}`, md: "none" },
          }}
        >
          <Typography variant="h6" fontWeight={700} noWrap>{campaign.name}</Typography>
        </Stack>

        <Stack
          sx={{
            px: 2.25,
            py: 1.25,
            minHeight: { md: 74 },
            justifyContent: "center",
            borderRight: { md: `1px solid ${themeDivider}` },
            borderBottom: { xs: `1px solid ${themeDivider}`, md: "none" },
          }}
        >
          <Chip
            label={statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
            size="small"
            sx={{ bgcolor: statusStyle.bg, color: statusStyle.color, fontWeight: 700, width: "fit-content", height: 24 }}
          />
        </Stack>

        <Stack
          sx={{
            position: "relative",
            px: 2.25,
            py: 1.1,
            minHeight: { md: 74 },
            justifyContent: "center",
            borderRight: { md: `1px solid ${themeDivider}` },
            borderBottom: { xs: `1px solid ${themeDivider}`, md: "none" },
          }}
        >
          <CampaignSalesWidget campaignId={campaign.campaign_id} accessToken={accessToken} />
          {canExportCampaign ? (
            <Tooltip title="Export">
              <IconButton
                size="small"
                onClick={() => onOpenExport && onOpenExport(campaign)}
                sx={{
                  position: "absolute",
                  right: 8,
                  bottom: 7,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <MdDownload size={15} />
              </IconButton>
            </Tooltip>
          ) : null}
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent={{ xs: "flex-start", md: "center" }}
          sx={{ px: 1.25, py: 1.1, minHeight: { md: 74 } }}
          spacing={0.2}
        >
          {canManageCampaign ? (
            <Tooltip title="Team">
              <IconButton size="small" onClick={() => onViewTeam && onViewTeam(campaign)}>
                <MdPeople size={18} />
              </IconButton>
            </Tooltip>
          ) : null}

          {isAdmin && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDeleteCampaign && onDeleteCampaign(campaign)}>
                <MdDeleteForever size={18} />
              </IconButton>
            </Tooltip>
          )}

          {canManageCampaign ? (
            <>
              <Tooltip title={`Fields (${fieldCount})`}>
                <IconButton size="small" onClick={() => onEditFields && onEditFields(campaign)}>
                  <MdViewList size={18} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Settings">
                <IconButton size="small" onClick={() => onOpenSettings && onOpenSettings(campaign)}>
                  <MdSettings size={18} />
                </IconButton>
              </Tooltip>
            </>
          ) : null}
        </Stack>
      </Box>
    </Card>
  );
}

